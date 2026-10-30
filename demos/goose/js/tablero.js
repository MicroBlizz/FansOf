// Fans of Goose · El tablero: 63 casillas de madera, una encima de otra, que serpentean sobre el vacío (el camino «desenrollado»:
// la cámara no gira nunca). La casilla 1 está abajo y la 63 (el Jardín de la Oca, el triple de alta) arriba del todo.
// También el derrumbe (la línea que se come el tablero por detrás) y las casillas especiales del Juego de la Oca.
'use strict';

const TH = CFG.altoCasilla;
const yCentro = t => -(t - 0.5) * TH;            // centro de la casilla t (el mundo sube hacia y negativa)
const yTecho = () => -(CFG.jardin - 1 + 3) * TH; // el borde de arriba del jardín
function casillaDe(y) { const t = Math.floor(-y / TH) + 1; return t > CFG.jardin ? CFG.jardin : t; }
// EL CAMINO DE ISLAS: el centro serpentea suave con la altura (cxY) y cada casilla es una isla con el borde irregular que se estrecha
// donde toca con la siguiente (bordes). Lo que se ve es lo que se pisa: hayCamino usa los mismos bordes.
const tDe = y => -y / TH + 0.5;   // la casilla «continua» (el centro de la casilla t da t)
function cxY(y) {
  const tf = tDe(y); if (tf >= CFG.jardin - 2) return CFG.W / 2;
  const a = Math.max(0, Math.min(1, (CFG.jardin - 2 - tf) / 3, (tf - 0.6) / 1.4));
  return CFG.W / 2 + a * (CFG.vaiven * Math.sin(tf * 0.55) + 7 * Math.sin(tf * 1.7));
}
function centroX(t) { return cxY(yCentro(t)); }
function anchoDe(t) { return t >= CFG.jardin ? CFG.W - 8 : t >= CFG.jardin - 2 ? CFG.anchoCamino + 24 : CFG.anchoCamino; }
// los bordes izquierdo y derecho de la isla a esa altura: más ancha en el medio, estrecha en las juntas, y con mordiscos
function bordes(y) {
  const t = casillaDe(y), cx = cxY(y), m = anchoDe(t) / 2;
  if (t >= CFG.jardin - 2) return [cx - m, cx + m];
  const f = Math.max(0, Math.min(1, -y / TH - (t - 1))), forma = 0.64 + 0.36 * Math.pow(Math.sin(Math.PI * f), 0.55);
  const yy = Math.round(y / 4) * 4;   // los mordiscos van de 4 en 4: escalones de píxel
  return [cx - m * forma - 4 * Math.sin(yy * 0.23 + t * 1.7) - 2.5 * Math.sin(yy * 0.61 + t), cx + m * forma + 4 * Math.sin(yy * 0.19 + t * 2.3) + 2.5 * Math.sin(yy * 0.53 - t)];
}
const enCasilla = (y, t) => casillaDe(y) === t;

// ¿se puede pisar el punto (x, y)?
function hayCamino(x, y) {
  if (y > 0 || y < yTecho() || y > JUEGO.yD) return false;
  const E = JUEGO.escena;
  if (E && E.tipo === 'puente' && y < E.y0 + TH / 2 && y > E.y1 - TH / 2) return Math.abs(x - xPuente(y)) <= ESC.puenteAncho / 2;
  const [l, r] = bordes(y);
  return x >= l && x <= r;
}

// --- casillas especiales ---
const ESPECIALES = [];
function preparaEspeciales() {
  ESPECIALES.length = 0;
  const lado = t => (t % 2 ? 1 : -1) * anchoDe(t) * 0.22;
  for (const t in CFG.ocaSalta) ESPECIALES.push({ t: +t, tipo: 'oca', x: centroX(+t), y: yCentro(+t) - 22, r: 12, usado: false, a: CFG.ocaSalta[t] });
  const C = JUEGO.casillas;
  ESPECIALES.push({ t: C.puenteDe, tipo: 'puente', x: centroX(C.puenteDe), y: yCentro(C.puenteDe) - 22, r: 12, usado: false, a: C.puenteA });
  ESPECIALES.push({ t: C.pozo, tipo: 'pozo', x: centroX(C.pozo), y: yCentro(C.pozo) - 22, r: 13, usado: false });
  for (const t of [C.dado1, C.dado2]) ESPECIALES.push({ t, tipo: 'dadodado', x: centroX(t), y: yCentro(t) - 22, r: 11, usado: false });
  ESPECIALES.push({ t: C.posada, tipo: 'posada', x: centroX(C.posada), y: yCentro(C.posada), r: 0, usado: false });
  const m = CFG.muerte, wM = anchoDe(m) * 0.6;
  ESPECIALES.push({ t: m, tipo: 'muerte', x: centroX(m), y: yCentro(m), w: anchoDe(m) - 12, h: TH - 12, usado: false, cd: 0 });
}

// de oca a oca y tiro porque me toca: vuela hasta la siguiente oca y lo que haya en medio, frito
function saltoOca(e) {
  const J = JUEGO;
  const a = topePuerta(e.t, e.a);   // si hay una puerta o la Muerte en medio, el salto se queda ahí
  J.salto = 0.85; J.fase = 'escena'; J.saltoDe = { x: J.yo.x, y: J.yo.y }; J.saltoA = { x: centroX(a), y: yCentro(a) }; J.saltoT = 0;
  if (e.tipo === 'puente') { aviso(tr('¡DE PUENTE A PUENTE!'), '#9fe0ff', 1.6); aviso2(tr('y tiro porque me lleva la corriente')); }
  else { aviso(tr('¡DE OCA A OCA!'), '#ffd34d', 1.6); aviso2(tr('y tiro porque me toca')); }
  destella('#ffd34d', 0.6); tiembla(5); SONIDO.oca(); vibra(60);
  if (J.carrera) mandaCarrera({ t: 'e' });
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
  if (J.salto <= 0) { J.invul = 1; anillo(J.yo.x, J.yo.y, 70, '#ffd34d', 0.5, 5); tiembla(4); SONIDO.aterriza(); J.casilla = casillaDe(J.yo.y); J.mejorCasilla = Math.max(J.mejorCasilla, J.casilla); J.fase = 'parado'; J.quieto = 0; J.mejorY = Math.min(J.mejorY, J.yo.y); aviso(tr('¡Y TIRO PORQUE ME TOCA!'), '#ffd34d', 1.4); }
  if (J.salto <= 0 && casillaEs.puerta(J.casilla) && !J.puertas.has(J.casilla)) { J.puertas.add(J.casilla); empiezaMinijefe(J.casilla); }   // de oca a oca hasta una puerta: el minijefe también te espera
  else if (J.salto <= 0 && casillaEs.muerte(J.casilla) && !J.parcaHecha && !J.minijefe) empiezaParca();
}

function casillaMuerte() {
  const J = JUEGO, atras = CFG.muerte - CFG.muerteAtras;
  J.vida -= J.vida * 0.4; J.invul = 1.4;
  J.yo.x = centroX(atras); J.yo.y = yCentro(atras); J.casilla = atras; J.fase = 'parado'; J.quieto = 0;
  J.yD = Math.max(J.yD, yCentro(atras) + TH * 1.6);   // el tablero se recompone detrás de ti
  aviso(tr('¡LA MUERTE!'), '#ff2d2d', 1.6); aviso2(tr('Pierdes vida y vuelves tres casillas'));
  destella('#ff0000', 0.7); tiembla(8); SONIDO.muerte(); vibra([100, 50, 100]);
  if (J.vida <= 1) J.vida = 1;
}

// --- el derrumbe ---
function avanzaDerrumbe(dt) {
  const J = JUEGO, D = CFG.derrumbe, yo = J.yo;
  if (yo.y < J.mejorY - 2) { J.mejorY = yo.y; J.sinAvanzar = 0; } else J.sinAvanzar += dt;
  let v = (D.base + D.crece * J.t) * (maldita('derrumbe') ? 1.5 : 1) * J.mod.derrumbe;
  const E = J.escena;
  J.impaciente = J.fase === 'parado' && J.quieto > D.sinAvanzar && !J.jefe && !E;
  if (J.impaciente) v *= D.impaciencia;
  if (E && E.tipo === 'puente') v = velTramo() * 0.72;                 // las tablas se caen justo detrás de ti
  if ((E && E.tipo !== 'puente') || J.salto > 0 || J.dado.rodando > 0 || J.minijefe) v = 0;   // en el Pozo, la Cárcel y la Posada el tablero espera
  const antes = J.yD;
  if (esCoop() && !anfitrionCoop()) derrumbeRemoto(dt);      // la línea es la del anfitrión
  else {
    J.yD -= v * dt;
    J.yD = Math.min(J.yD, (esCoop() ? yReferenciaCoop() : yo.y) + PAN.H * D.maxDetras);         // nunca muy lejos por detrás (del más atrasado, en el cooperativo)
  }
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
  const P = J.escena && J.escena.tipo === 'puente' ? J.escena : null;
  for (let t = t0; t <= t1; t++) {
    if (P && t > P.de && t < P.a) continue;   // en el Puente, entre una orilla y otra solo hay vacío y tablas
    const top = t >= CFG.jardin ? yTecho() : -t * TH, alto = t >= CFG.jardin ? TH * 3 : TH;
    let bottom = top + alto;
    if (top >= J.yD) continue;               // ya se ha caído entera
    const cortada = bottom > J.yD; if (cortada) bottom = J.yD;
    const w = anchoDe(t), x0 = centroX(t) - w / 2;
    // tiembla un poco la que está a punto de caer
    const tb = cortada || bottom > J.yD - 18 ? Math.sin(J.t * 50 + t) * 0.8 : 0;
    if (t >= CFG.jardin) G.drawImage(JARDIN, x0, top, w, alto);
    else pintaIsla(t, top, bottom, tb, cortada);
    if (cortada) { const [l, r] = bordes(bottom - 1); G.fillStyle = '#ff7a2a'; G.fillRect(l + tb, bottom - 1.5, r - l, 1.5); G.fillStyle = 'rgba(255,90,30,.25)'; G.fillRect(l + tb, bottom - 6, r - l, 4.5); }
    pintaNumero(t, centroX(t), t >= CFG.jardin ? top + 26 : top + alto / 2, top, bottom);
    pintaAdornos(t);
  }
  pintaEspeciales(arriba, abajo);
}

// una isla: el suelo de su tierra (patrón de Yoshi anclado al mundo, sin costuras) en franjas de 2 con sus bordes, un canto de roca
// por fuera (el grosor) y, si el derrumbe la está comiendo, su panza colgando (img/isla-<tierra>.png)
const PATRONES = {};
function patronDe(id) {
  if (PATRONES[id] !== undefined) return PATRONES[id];
  const im = IMG['t-' + id] || (SUELOS[id] && SUELOS[id][0]); if (!im) return null;
  const p = G.createPattern(im, 'repeat'); if (p && p.setTransform) p.setTransform(new DOMMatrix().scale(1 / PAN.k));
  return (PATRONES[id] = p);
}
function pintaIsla(t, top, bottom, tb, cortada) {
  const B = biomaDe(t), pat = patronDe(B.id), paso = 2;
  for (let y = top; y < bottom; y += paso) {
    const h = Math.min(paso, bottom - y), [l, r] = bordes(y + h / 2);
    G.fillStyle = '#0c0604'; G.fillRect(l - 5 + tb, y + 4, 5, h); G.fillRect(r + tb, y + 4, 5, h);   // el canto de roca (grosor) asomando por fuera
    G.fillStyle = B.veta; G.fillRect(l - 4 + tb, y + 3, 4, h - 0.5); G.fillRect(r + tb, y + 3, 4, h - 0.5);
    G.fillStyle = pat || B.suelo[0]; G.fillRect(l + tb, y, r - l, h);
    if (t === 1) { G.globalAlpha = 0.16; G.fillStyle = '#ffd34d'; G.fillRect(l + tb, y, r - l, h); G.globalAlpha = 1; }   // la salida
    G.fillStyle = B.niebla; G.globalAlpha = 0.28; G.fillRect(l + 1 + tb, y, 1.5, h); G.fillRect(r - 2.5 + tb, y, 1.5, h); G.globalAlpha = 1;   // el borde de hierba o piedra
    G.fillStyle = '#120805'; G.fillRect(l - 1 + tb, y, 1, h); G.fillRect(r + tb, y, 1, h);   // el contorno
  }
  // la junta con la siguiente isla
  G.fillStyle = '#120805'; G.globalAlpha = 0.45; const [l0, r0] = bordes(top + 0.5); G.fillRect(l0 + tb, top, r0 - l0, 1); G.globalAlpha = 1;
  if (BIOMAS.some(b => b.desde === t) && t > 1) { const [l, r] = bordes(bottom - 2); G.fillStyle = B.niebla; G.globalAlpha = 0.5; G.fillRect(l + tb, bottom - 3, r - l, 3); G.globalAlpha = 1; }
  // la panza de la isla colgando bajo el derrumbe
  if (cortada) { const [l, r] = bordes(bottom - 1), S = SPR['isla-' + B.id]; if (S) G.drawImage(S.n, l - 4 + tb, bottom - 2, r - l + 8, Math.min(40, S.h * (r - l + 8) / S.w)); }
}

function pintaNumero(t, x, y, top, bottom) {
  if (y > bottom - 6 || y < top) return;
  G.globalAlpha = 0.28;
  texto2(t >= CFG.jardin ? tr('JARDÍN DE LA OCA') : String(t), x, y + 1, t >= CFG.jardin ? 22 : 34, '#1a0a04', 'center', FUENTE_G, 400, 0);
  G.globalAlpha = 1;
  const nombre = nombreCasilla(t);
  if (nombre) { G.globalAlpha = 0.8; texto2(nombre, x, y + 21, 7, '#fff0c8', 'center', FUENTE, 800, 0.3); G.globalAlpha = 1; }
}
function nombreCasilla(t) {
  if (CFG.ocaSalta[t] || CFG.ocasAdorno.includes(t)) return tr('OCA');
  const C = JUEGO.casillas || {};
  if (t === C.puenteDe || t === C.puenteA) return tr('PUENTE');
  if (C.puertas && C.puertas.includes(t)) return tr('PUERTA');
  if (t === CFG.jardin) return tr('JARDÍN DE LA OCA');
  if (t === C.pozo) return tr('EL POZO'); if (t === C.posada) return tr('LA POSADA'); if (t === C.laberinto) return tr('EL LABERINTO');
  if (t === C.carcel) return tr('LA CÁRCEL'); if (t === CFG.muerte) return tr('LA MUERTE'); if (t === C.dado1 || t === C.dado2) return tr('DADO'); if (t === 1) return tr('SALIDA');
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
      G.globalAlpha = 0.4 + Math.sin(J.t * 6) * 0.15; disco(e.x, e.y, e.r + 3, e.r + 3, '#ffd34d'); G.globalAlpha = 1;
      aro(e.x, e.y, e.r, 1.5, '#ffd34d');
      pinta('oca-dorada', e.x, e.y - 4 + b, false, false, 0.9, 1);
      etiqueta(tr('OCA'), e.x, e.y + e.r + 6, '#ffd34d');
    } else if (e.tipo === 'puente') {
      // un puentecillo de cuerda que brilla
      G.globalAlpha = 0.35 + Math.sin(JUEGO.t * 6) * 0.15; disco(e.x, e.y, e.r + 3, e.r + 3, '#9fe0ff'); G.globalAlpha = 1;
      G.fillStyle = '#120808'; G.fillRect(e.x - 11, e.y - 5, 22, 10);
      for (let i = 0; i < 5; i++) { G.fillStyle = i % 2 ? '#8a5a30' : '#a06a3a'; G.fillRect(e.x - 10 + i * 4.2, e.y - 4, 3.4, 8); }
      G.fillStyle = '#d9c08a'; G.fillRect(e.x - 11, e.y - 6, 22, 1.2); G.fillRect(e.x - 11, e.y + 4.8, 22, 1.2);
      etiqueta(tr('PUENTE'), e.x, e.y + e.r + 6, '#9fe0ff');
    } else if (e.tipo === 'pozo') {
      if (!J.escena) { disco(e.x, e.y, 15, 11, '#5c6b72'); disco(e.x, e.y, 12.5, 8.5, '#05060a'); }
    } else if (e.tipo === 'dadodado') {
      pintaGirado('dado' + (1 + ((J.t * 6) | 0) % 6), e.x, e.y + Math.sin(J.t * 3) * 2, Math.sin(J.t * 2) * 0.4, 1.6); etiqueta(tr('SUERTE'), e.x, e.y + e.r + 5, '#ffe9a8');
    } else if (e.tipo === 'posada') {
      dibujaFarol(e.x - anchoDe(e.t) * 0.36, e.y - 18); dibujaFarol(e.x + anchoDe(e.t) * 0.36, e.y - 18);
    } else if (e.tipo === 'muerte') {
      G.globalAlpha = 0.55 + Math.sin(J.t * 3) * 0.15; G.fillStyle = '#3a0006'; G.fillRect(e.x - e.w / 2, e.y - e.h / 2, e.w, e.h); G.globalAlpha = 1;
      G.fillStyle = '#ff2d2d'; for (let q = 0; q < e.w; q += 6) { G.fillRect(e.x - e.w / 2 + q, e.y - e.h / 2, 3, 1); G.fillRect(e.x - e.w / 2 + q, e.y + e.h / 2 - 1, 3, 1); } for (let q = 0; q < e.h; q += 6) { G.fillRect(e.x - e.w / 2, e.y - e.h / 2 + q, 1, 3); G.fillRect(e.x + e.w / 2 - 1, e.y - e.h / 2 + q, 1, 3); }
      dibujaCalavera(e.x, e.y);
    }
  }
}
function etiqueta(txt, x, y, color) { texto2(txt, x, y, 7, color); }
function dibujaFarol(x, y) { const J = JUEGO; G.globalAlpha = 0.6 + Math.sin(J.t * 7 + x) * 0.15; brillo(x, y, 14, '#ffb86b', 0.6); G.globalAlpha = 1; G.fillStyle = '#1a0c05'; G.fillRect(x - 3, y - 4, 6, 8); G.fillStyle = '#ffd34d'; G.fillRect(x - 2, y - 2.5, 4, 5); }
function dibujaCalavera(x, y) {
  if (SPR['ad-calavera']) { pinta('ad-calavera', x, y, false, false, 1.4); return; }
  disco(x, y - 2, 10, 10, '#120808'); disco(x, y - 2, 9, 9, '#f1e6c8'); G.fillStyle = '#120808'; G.fillRect(x - 6, y + 3, 12, 7); G.fillStyle = '#f1e6c8'; G.fillRect(x - 5, y + 4, 10, 5);
  disco(x - 3.5, y - 2, 2.4, 2.4, '#120808'); disco(x + 3.5, y - 2, 2.4, 2.4, '#120808');
}
