// Fans of Goose · El tablero: 63 casillas de madera, una encima de otra, que serpentean sobre el vacío (el camino «desenrollado»:
// la cámara no gira nunca). La casilla 1 está abajo y la 63 (el Jardín de la Oca, el triple de alta) arriba del todo.
// También el derrumbe (la línea que se come el tablero por detrás) y las casillas especiales del Juego de la Oca.
'use strict';

const TH = CFG.altoCasilla;
const yCentro = t => -(t - 0.5) * TH;            // centro de la casilla t (el mundo sube hacia y negativa)
const yTecho = () => -(CFG.jardin - 1 + 3) * TH; // el borde de arriba del jardín
function casillaDe(y) { const t = Math.floor(-y / TH) + 1; return t > CFG.jardin ? CFG.jardin : t; }
function centroX(t) { if (t <= 1 || t >= CFG.jardin - 2) return CFG.W / 2; const a = Math.min(1, (CFG.jardin - 2 - t) / 3); return CFG.W / 2 + a * (CFG.vaiven * Math.sin(t * 0.83) + 9 * Math.sin(t * 2.1)); }
function anchoDe(t) { return t >= CFG.jardin ? CFG.W - 8 : t >= CFG.jardin - 2 ? CFG.anchoCamino + 24 : CFG.anchoCamino; }
const enCasilla = (y, t) => casillaDe(y) === t;

// ¿se puede pisar el punto (x, y)?
function hayCamino(x, y) {
  if (y > 0 || y < yTecho() || y > JUEGO.yD) return false;
  const t = casillaDe(y);
  return Math.abs(x - centroX(t)) <= anchoDe(t) / 2;
}

// --- casillas especiales ---
const ESPECIALES = [];
function preparaEspeciales() {
  ESPECIALES.length = 0;
  const lado = t => (t % 2 ? 1 : -1) * anchoDe(t) * 0.22;
  for (const t in CFG.ocaSalta) ESPECIALES.push({ t: +t, tipo: 'oca', x: centroX(+t) + lado(+t), y: yCentro(+t), r: 12, usado: false, a: CFG.ocaSalta[t] });
  for (const t in CFG.puente) ESPECIALES.push({ t: +t, tipo: 'puente', x: centroX(+t) - lado(+t), y: yCentro(+t), r: 12, usado: false, a: CFG.puente[t] });
  ESPECIALES.push({ t: CFG.pozo, tipo: 'pozo', x: centroX(CFG.pozo) - lado(CFG.pozo), y: yCentro(CFG.pozo), r: 13, usado: false });
  for (const t of CFG.dadoDado) ESPECIALES.push({ t, tipo: 'dadodado', x: centroX(t) + lado(t), y: yCentro(t), r: 11, usado: false });
  ESPECIALES.push({ t: CFG.posada, tipo: 'posada', x: centroX(CFG.posada), y: yCentro(CFG.posada), r: 0, usado: false });
  const m = CFG.muerte, wM = anchoDe(m) * 0.6;
  ESPECIALES.push({ t: m, tipo: 'muerte', x: centroX(m) + (anchoDe(m) / 2 - wM / 2) * (m % 2 ? -1 : 1), y: yCentro(m), w: wM, h: TH * 0.55, usado: false, cd: 0 });
}

function avanzaEspeciales(dt) {
  const J = JUEGO, yo = J.yo;
  if (J.salto > 0 || J.caida > 0) return;
  for (const e of ESPECIALES) {
    if (e.tipo === 'posada') { if (!e.usado && J.casilla === e.t) { e.usado = true; entraPosada(); } continue; }
    if (e.tipo === 'muerte') {
      e.cd -= dt;
      if (e.cd <= 0 && Math.abs(yo.x - e.x) < e.w / 2 && Math.abs(yo.y - e.y) < e.h / 2) { e.cd = 2; casillaMuerte(); }
      continue;
    }
    if (e.usado) continue;
    if ((yo.x - e.x) ** 2 + (yo.y - e.y) ** 2 < (e.r + 3) ** 2) {
      e.usado = true;
      if (e.tipo === 'oca' || e.tipo === 'puente') saltoOca(e);
      else if (e.tipo === 'pozo') entraPozo(e);
      else if (e.tipo === 'dadodado') tiradaSuerte();
    }
  }
}

// de oca a oca y tiro porque me toca: vuela hasta la siguiente oca y lo que haya en medio, frito
function saltoOca(e) {
  const J = JUEGO;
  J.salto = 0.85; J.saltoDe = { x: J.yo.x, y: J.yo.y }; J.saltoA = { x: centroX(e.a), y: yCentro(e.a) }; J.saltoT = 0;
  if (e.tipo === 'puente') { aviso(tr('¡DE PUENTE A PUENTE!'), '#9fe0ff', 1.6); aviso2(tr('y tiro porque me lleva la corriente')); }
  else { aviso(tr('¡DE OCA A OCA!'), '#ffd34d', 1.6); aviso2(tr('y tiro porque me toca')); }
  destella('#ffd34d', 0.6); tiembla(5); SONIDO.oca(); vibra(60);
}
function avanzaSalto(dt) {
  const J = JUEGO; if (J.salto <= 0) return;
  J.saltoT += dt; const k = Math.min(1, J.saltoT / 0.85), s = k * k * (3 - 2 * k);
  const px = J.yo.x, py = J.yo.y;
  J.yo.x = J.saltoDe.x + (J.saltoA.x - J.saltoDe.x) * s; J.yo.y = J.saltoDe.y + (J.saltoA.y - J.saltoDe.y) * s;
  // la estela: todo lo que toca, fuera
  const n = enemigosCerca(J.yo.x, J.yo.y, 34);
  for (let i = 0; i < n; i++) { const o = ENE.lista[CERCA[i]]; if (o.hp > 0 && Math.abs(o.x - J.yo.x) < 30 && o.tipo !== 'jefe') danar(o, 9999, (o.x - J.yo.x) > 0 ? 1 : -1, 0, 200); }
  for (let i = 0; i < 3; i++) particula(px + (Math.random() - 0.5) * 22, py + (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 40, 20, 0.6, 3, i ? '#ffd34d' : '#fff6c2', 0, 2);
  J.salto -= dt;
  if (J.salto <= 0) { J.invul = 1; anillo(J.yo.x, J.yo.y, 70, '#ffd34d', 0.5, 5); tiembla(4); SONIDO.aterriza(); }
}

// el Pozo: te quedas clavado unos segundos y te rodean, pero cada oca da el doble de plumas
function entraPozo(e) {
  const J = JUEGO;
  J.pozoT = CFG.pozoSeg; J.yo.x = e.x; J.yo.y = e.y;
  aviso(tr('¡EL POZO!'), '#7dff6b', 1.6); aviso2(tr('Aguanta: cada oca da el doble'));
  for (let i = 0; i < 32; i++) { const a = i * 6.283 / 32, oc = creaEnemigo(i % 5 ? 'oca' : 'albatros', e.x + Math.cos(a) * 95, e.y + Math.sin(a) * 95); if (oc) oc.pozo = true; }
  tiembla(5); SONIDO.pozo(); vibra(80);
}
function entraPosada() {
  const J = JUEGO;
  J.posadaT = CFG.posadaSeg; J.vida = Math.min(J.st.vidaMax, J.vida + J.st.vidaMax * 0.5);
  aviso(tr('LA POSADA'), '#ffb86b', 1.6); aviso2(tr('Te curas y el tablero espera'));
  anillo(J.yo.x, J.yo.y, 90, '#ffb86b', 0.8, 5); SONIDO.posada();
}
function casillaMuerte() {
  const J = JUEGO, atras = CFG.muerte - CFG.muerteAtras;
  J.vida -= J.vida * 0.4; J.invul = 1.4;
  J.yo.x = centroX(atras); J.yo.y = yCentro(atras);
  J.yD = Math.max(J.yD, yCentro(atras) + TH * 1.6);   // el tablero se recompone detrás de ti
  aviso(tr('¡LA MUERTE!'), '#ff2d2d', 1.6); aviso2(tr('Pierdes vida y vuelves tres casillas'));
  destella('#ff0000', 0.7); tiembla(8); SONIDO.muerte(); vibra([100, 50, 100]);
  if (J.vida <= 1) J.vida = 1;
}

// --- el derrumbe ---
function avanzaDerrumbe(dt) {
  const J = JUEGO, D = CFG.derrumbe, yo = J.yo;
  if (yo.y < J.mejorY - 2) { J.mejorY = yo.y; J.sinAvanzar = 0; } else J.sinAvanzar += dt;
  let v = D.base + D.crece * J.t;
  J.impaciente = J.sinAvanzar > D.sinAvanzar && !J.jefe;
  if (J.impaciente) v *= D.impaciencia;
  if (J.posadaT > 0 || J.pozoT > 0 || J.salto > 0) v = 0;
  const antes = J.yD;
  J.yD -= v * dt;
  J.yD = Math.min(J.yD, yo.y + PAN.H * D.maxDetras);         // nunca muy lejos por detrás
  J.yD = Math.max(J.yD, -(D.ultima - 1) * TH);               // el jardín y sus casillas de antes no se caen
  // astillas que caen al vacío por donde pasa la línea
  if (antes - J.yD > 0.01 || (J.cuadro & 3) === 0) {
    const t = casillaDe(J.yD - 1), cx = centroX(t), w = anchoDe(t);
    for (let i = 0; i < 2; i++) particula(cx + (Math.random() - 0.5) * w, J.yD + Math.random() * 3, (Math.random() - 0.5) * 20, 30 + Math.random() * 30, 1.1, 3 + Math.random() * 3, Math.random() < 0.5 ? '#6e4426' : '#3d2414', 120, 3);
    if (Math.random() < 0.4) particula(cx + (Math.random() - 0.5) * w, J.yD, (Math.random() - 0.5) * 30, -20 - Math.random() * 30, 0.6, 1.5, '#ff7a2a', -10, 0);
  }
}

// --- dibujo ---
let JARDIN = null;
function preparaJardin() {
  const w = CFG.W - 8, h = TH * 3, k = PAN.k, c = lienzo(w * k, h * k), x = c.getContext('2d'); x.scale(k, k);
  const r = azarSemilla(99);
  x.fillStyle = '#2f5a24'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) { x.fillStyle = r() < 0.5 ? '#3c7030' : '#264b1d'; x.fillRect(r() * w, r() * h, 2, 3); }
  for (let i = 0; i < 40; i++) { x.fillStyle = ['#ffd34d', '#ff8fb1', '#f6f0e0'][i % 3]; const fx = r() * w, fy = r() * h; x.fillRect(fx, fy, 2, 2); x.fillRect(fx - 2, fy, 2, 2); x.fillRect(fx + 2, fy, 2, 2); x.fillRect(fx, fy - 2, 2, 2); x.fillRect(fx, fy + 2, 2, 2); }
  x.strokeStyle = '#1a0c05'; x.lineWidth = 2.5; x.strokeRect(1, 1, w - 2, h - 2);
  x.strokeStyle = '#c9a24a'; x.lineWidth = 1; x.strokeRect(5, 5, w - 10, h - 10);
  JARDIN = c;
}

function pintaTablero() {
  const J = JUEGO, arriba = J.camY - 20, abajo = J.camY + PAN.H + 20;
  const t0 = Math.max(1, casillaDe(abajo)), t1 = Math.min(CFG.jardin, casillaDe(arriba));
  G.textAlign = 'center'; G.textBaseline = 'middle';
  for (let t = t0; t <= t1; t++) {
    const top = t >= CFG.jardin ? yTecho() : -t * TH, alto = t >= CFG.jardin ? TH * 3 : TH;
    let bottom = top + alto;
    if (top >= J.yD) continue;               // ya se ha caído entera
    const cortada = bottom > J.yD; if (cortada) bottom = J.yD;
    const w = anchoDe(t), x0 = centroX(t) - w / 2;
    // tiembla un poco la que está a punto de caer
    const tb = cortada || bottom > J.yD - 18 ? Math.sin(J.t * 50 + t) * 0.8 : 0;
    // canto de la losa (da grosor)
    G.fillStyle = '#1e0f07'; G.fillRect(x0 + tb, top + 3, w, bottom - top + (cortada ? 0 : 5));
    if (t >= CFG.jardin) G.drawImage(JARDIN, x0, top, w, alto);
    else {
      const img = SUELOS.length ? SUELOS[indiceBioma(t)][t % 2] : LOSAS[t % 3];
      G.drawImage(img, 0, 0, img.width, img.height * (bottom - top) / alto, x0 + tb, top, w, bottom - top);
      // el cambio de tierra: una franja de su color en la primera casilla
      if (BIOMAS.some(b => b.desde === t) && t > 1) { G.fillStyle = biomaDe(t).niebla; G.globalAlpha = 0.5; G.fillRect(x0 + tb, bottom - 3, w, 3); G.globalAlpha = 1; }
      if (t === 1) { G.fillStyle = 'rgba(255,211,77,.16)'; G.fillRect(x0, top, w, bottom - top); }
    }
    if (cortada) { G.fillStyle = '#ff7a2a'; G.fillRect(x0 + tb, bottom - 1.5, w, 1.5); G.fillStyle = 'rgba(255,90,30,.25)'; G.fillRect(x0 + tb, bottom - 6, w, 4.5); }
    pintaNumero(t, centroX(t), t >= CFG.jardin ? top + 26 : top + alto / 2, top, bottom);
    pintaAdornos(t);
  }
  pintaEspeciales(arriba, abajo);
}

function pintaNumero(t, x, y, top, bottom) {
  if (y > bottom - 6 || y < top) return;
  G.globalAlpha = 0.28; G.fillStyle = '#1a0a04';
  G.font = `400 ${t >= CFG.jardin ? 22 : 34}px "Pirata One", "Pixelify Sans", serif`;
  G.fillText(t >= CFG.jardin ? tr('JARDÍN DE LA OCA') : String(t), x, y + 1);
  G.globalAlpha = 1;
  const nombre = nombreCasilla(t);
  if (nombre) { G.font = '800 7px "Pixelify Sans", system-ui'; G.fillStyle = 'rgba(255,240,200,.75)'; G.fillText(nombre, x, y + 20); }
}
function nombreCasilla(t) {
  if (CFG.ocaSalta[t] || CFG.ocasAdorno.includes(t)) return tr('OCA');
  if (CFG.puente[t] || t === 12) return tr('PUENTE');
  if (t === CFG.pozo) return tr('EL POZO'); if (t === CFG.posada) return tr('LA POSADA'); if (t === CFG.laberinto) return tr('EL LABERINTO');
  if (t === CFG.carcel) return tr('LA CÁRCEL'); if (t === CFG.muerte) return tr('LA MUERTE'); if (CFG.dadoDado.includes(t)) return tr('DADO'); if (t === 1) return tr('SALIDA');
  return '';
}

function pintaEspeciales(arriba, abajo) {
  const J = JUEGO;
  // las ocas pintadas (adorno)
  for (const t of CFG.ocasAdorno) { const y = yCentro(t); if (y > arriba && y < abajo && y < J.yD - 10) pinta('oca-dorada', centroX(t) + (t % 2 ? -1 : 1) * anchoDe(t) * 0.3, y - 12, t % 2 === 0, false, 0.75, 0.35); }
  for (const e of ESPECIALES) {
    if (e.y < arriba - 30 || e.y > abajo + 30 || e.y > J.yD) continue;
    if (e.tipo === 'oca') {
      const b = Math.sin(J.t * 4) * 2;
      G.globalAlpha = e.usado ? 0.25 : 0.4 + Math.sin(J.t * 6) * 0.15; G.fillStyle = '#ffd34d'; G.beginPath(); G.arc(e.x, e.y, e.r + 3, 0, 6.283); G.fill(); G.globalAlpha = 1;
      G.strokeStyle = '#ffd34d'; G.lineWidth = 1.5; G.beginPath(); G.arc(e.x, e.y, e.r, 0, 6.283); G.stroke();
      pinta('oca-dorada', e.x, e.y - 4 + (e.usado ? 0 : b), false, false, 0.9, e.usado ? 0.4 : 1);
      if (!e.usado) etiqueta(tr('SALTA'), e.x, e.y + e.r + 6, '#ffd34d');
    } else if (e.tipo === 'puente') {
      // un puentecillo de cuerda que brilla
      G.globalAlpha = e.usado ? 0.3 : 0.35 + Math.sin(JUEGO.t * 6) * 0.15; G.fillStyle = '#9fe0ff'; G.beginPath(); G.arc(e.x, e.y, e.r + 3, 0, 6.283); G.fill(); G.globalAlpha = 1;
      G.fillStyle = '#120808'; G.fillRect(e.x - 11, e.y - 5, 22, 10);
      for (let i = 0; i < 5; i++) { G.fillStyle = i % 2 ? '#8a5a30' : '#a06a3a'; G.fillRect(e.x - 10 + i * 4.2, e.y - 4, 3.4, 8); }
      G.fillStyle = '#d9c08a'; G.fillRect(e.x - 11, e.y - 6, 22, 1.2); G.fillRect(e.x - 11, e.y + 4.8, 22, 1.2);
      if (!e.usado) etiqueta(tr('SALTA'), e.x, e.y + e.r + 6, '#9fe0ff');
    } else if (e.tipo === 'pozo') {
      G.fillStyle = '#05060a'; G.beginPath(); G.ellipse(e.x, e.y, e.r, e.r * 0.75, 0, 0, 6.283); G.fill();
      G.strokeStyle = '#5c6b72'; G.lineWidth = 3; G.stroke(); G.strokeStyle = '#7dff6b'; G.lineWidth = 1; G.globalAlpha = 0.5 + Math.sin(J.t * 5) * 0.3; G.stroke(); G.globalAlpha = 1;
      if (!e.usado) etiqueta(tr('PLUMAS x2'), e.x, e.y + e.r + 5, '#7dff6b');
    } else if (e.tipo === 'dadodado') {
      if (!e.usado) { pintaGirado('dado' + (1 + ((J.t * 6) | 0) % 6), e.x, e.y + Math.sin(J.t * 3) * 2, Math.sin(J.t * 2) * 0.4, 1.6); etiqueta(tr('SUERTE'), e.x, e.y + e.r + 5, '#ffe9a8'); }
    } else if (e.tipo === 'posada') {
      if (J.posadaT > 0) { G.globalAlpha = 0.18 + Math.sin(J.t * 4) * 0.06; G.fillStyle = '#ffb86b'; G.fillRect(centroX(e.t) - anchoDe(e.t) / 2, -e.t * TH, anchoDe(e.t), TH); G.globalAlpha = 1; }
      dibujaFarol(e.x - anchoDe(e.t) * 0.36, e.y - 18); dibujaFarol(e.x + anchoDe(e.t) * 0.36, e.y - 18);
    } else if (e.tipo === 'muerte') {
      G.globalAlpha = 0.55 + Math.sin(J.t * 3) * 0.15; G.fillStyle = '#3a0006'; G.fillRect(e.x - e.w / 2, e.y - e.h / 2, e.w, e.h); G.globalAlpha = 1;
      G.strokeStyle = '#ff2d2d'; G.lineWidth = 1.2; G.setLineDash([3, 3]); G.strokeRect(e.x - e.w / 2, e.y - e.h / 2, e.w, e.h); G.setLineDash([]);
      dibujaCalavera(e.x, e.y);
    }
  }
}
function etiqueta(txt, x, y, color) { G.font = '800 6px "Pixelify Sans", system-ui'; G.lineWidth = 2; G.strokeStyle = '#120808'; G.strokeText(txt, x, y); G.fillStyle = color; G.fillText(txt, x, y); }
function dibujaFarol(x, y) { const J = JUEGO; G.globalAlpha = 0.25 + Math.sin(J.t * 7 + x) * 0.08; G.fillStyle = '#ffb86b'; G.beginPath(); G.arc(x, y, 14, 0, 6.283); G.fill(); G.globalAlpha = 1; G.fillStyle = '#1a0c05'; G.fillRect(x - 3, y - 4, 6, 8); G.fillStyle = '#ffd34d'; G.fillRect(x - 2, y - 2.5, 4, 5); }
function dibujaCalavera(x, y) {
  G.fillStyle = '#f1e6c8'; G.strokeStyle = '#120808'; G.lineWidth = 1.2;
  G.beginPath(); G.arc(x, y - 2, 9, 0, 6.283); G.fill(); G.stroke(); G.fillRect(x - 5, y + 4, 10, 5); G.strokeRect(x - 5, y + 4, 10, 5);
  G.fillStyle = '#120808'; G.beginPath(); G.arc(x - 3.5, y - 2, 2.4, 0, 6.283); G.arc(x + 3.5, y - 2, 2.4, 0, 6.283); G.fill();
}
