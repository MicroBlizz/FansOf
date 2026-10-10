// Fans of Rouflage (prototipo) · DIBUJAR: la cámara (sigue al jugador y hace zoom al pintar) y cada fotograma: el fondo, los muebles y
// los personajes de atrás adelante, los efectos, la oscuridad con las linternas y las marcas (el «?» de los becarios, tu flecha…).
'use strict';

const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
let DPR = 1, VW = 320, VH = 480;   // la ventana, en píxeles CSS
// la cámara: (x, y) es el punto del mundo que cae en el centro de la pantalla; z, los píxeles CSS que mide una unidad del mundo
const CAM = { x: 840, y: 360, z: 1, tiembla: 0, ox: 0, oy: 0, esc: 1 };

// el zoom normal: en el móvil se ven unas 400 unidades a lo ancho; en pantallas grandes, unas 560 a lo alto
function zoomJuego() {
  const z = limita(Math.max(Math.max(VW, VH) / 860, Math.min(VW, VH) / 560), 0.8, 2.2);
  return J.fase !== 'titulo' && J.modo === 'cazador' ? z * 0.92 : z;
}
function avanzaCamara(dt, deGolpe) {
  let tx = CAM.x, ty = CAM.y, tz = zoomJuego();
  if (TALLER.abierto) [tx, ty, tz] = TALLER.cam;
  else if (J.fase === 'titulo') { const a = J.t * 0.07; tx = 840 + Math.cos(a) * 250; ty = 330 + Math.sin(a * 1.3) * 110; }
  else if (J.yo) {
    tx = J.yo.x; ty = J.yo.y - 26;
  }
  const k = deGolpe ? 1 : Math.min(1, dt * 7);
  CAM.z += (tz - CAM.z) * (deGolpe ? 1 : Math.min(1, dt * 9)); CAM.x += (tx - CAM.x) * k; CAM.y += (ty - CAM.y) * k;
  if (!TALLER.abierto) {   // sin enseñar más allá del mundo (dejando sitio a los botones de arriba y de abajo)
    const mw = VW / CAM.z / 2, mh = VH / CAM.z / 2, lado = 30 / CAM.z, arriba = 70 / CAM.z, abajo = 150 / CAM.z;
    CAM.x = mw * 2 >= ANCHO + lado * 2 ? ANCHO / 2 : limita(CAM.x, mw - lado, ANCHO - mw + lado);
    CAM.y = mh * 2 >= ALTO + arriba + abajo ? ALTO / 2 : limita(CAM.y, mh - arriba, ALTO - mh + abajo);
  }
  CAM.tiembla = Math.max(0, CAM.tiembla - dt);
}
// prepara el paso de mundo a pantalla de este fotograma (con el desplazamiento redondeado, para que el fondo no baile)
function calculaVista() {
  if (TALLER.abierto && TALLER.capas) { [CAM.ox, CAM.oy, CAM.esc] = TALLER.fija; return; }
  CAM.esc = CAM.z * DPR; const tm = CAM.tiembla > 0 ? CAM.tiembla * 16 * DPR : 0;
  CAM.ox = Math.round(cv.width / 2 - CAM.x * CAM.esc + rand(-tm, tm)); CAM.oy = Math.round(cv.height / 2 - CAM.y * CAM.esc + rand(-tm, tm));
}
const ponMundo = c => c.setTransform(CAM.esc, 0, 0, CAM.esc, CAM.ox, CAM.oy);
const aMundo = (sx, sy) => [(sx * DPR - CAM.ox) / CAM.esc, (sy * DPR - CAM.oy) / CAM.esc];   // de la pantalla (CSS) al mundo
const aPantalla = (x, y) => [(x * CAM.esc + CAM.ox) / DPR, (y * CAM.esc + CAM.oy) / DPR];

// la barrera de Recursos Humanos: dos postes y un haz rojo que se apaga al abrirse
const COSA_PUERTA = { y: PUERTA.y + PUERTA.h - 2, puerta: true };
function pintaPuerta(c, t) {
  const x = PUERTA.x + PUERTA.w / 2, y0 = PUERTA.y + 6, y1 = PUERTA.y + PUERTA.h - 4, a = 1 - PUERTA.abierta;
  if (a > 0.02) {
    c.globalAlpha = a * (0.75 + Math.sin(t * 9) * 0.1);
    for (const dx of [-7, 0, 7]) { raya(c, [x + dx, y0, x + dx, y1], '#ff4b5c', 5); raya(c, [x + dx, y0, x + dx, y1], '#ffd0d4', 1.6); }
    c.globalAlpha = 1;
  }
  for (const y of [y0, y1]) { forma(c, caja(x - 13, y - 9, 26, 12, 3), '#3d4063', 3); punto(c, x, y - 3, 2.6, a > 0.5 ? '#ff4b5c' : '#7ee04a'); }
}

// tú, mientras te pintas: solo la piel (medio transparente con el calco puesto) y el borde de la silueta en línea de puntos
function pintaYoEnTaller(c, yo, t) {
  c.save(); c.translate(yo.x, yo.y);
  c.globalAlpha = TALLER.calco ? 0.5 : 1; c.drawImage(yo.piel, -PIE_X, -PIE_Y, CAJA_W, CAJA_H); c.globalAlpha = 1;
  c.beginPath(); trazaAlubia(c); c.lineWidth = 0.8; c.setLineDash([2.5, 2.5]);
  c.lineDashOffset = -t * 6; c.strokeStyle = 'rgba(32,16,44,0.95)'; c.stroke();
  c.lineDashOffset = -t * 6 + 2.5; c.strokeStyle = 'rgba(255,255,255,0.95)'; c.stroke();
  c.setLineDash([]); c.restore();
}

// un bocadillo pequeño con un signo encima de alguien
function pintaSigno(c, x, y, s, color, t) {
  const bote = Math.abs(Math.sin(t * 6)) * 2.5;
  forma(c, c => { rrPath(c, x - 11, y - 22 - bote, 22, 22, 7); }, '#fff6ea', 2.6);
  forma(c, poli(x - 4, y - 1 - bote, x + 4, y - 1 - bote, x, y + 5 - bote), '#fff6ea', 0);
  rotulo(c, s, x, y - 10 - bote, 17, color);
}
// las marcas que van por encima de la oscuridad: signos de los becarios, sus cartas, nombres, tu flecha
function pintaMarcas(c, t) {
  const yo = J.yo;
  for (const e of J.entes) {
    if (e.fuera && e.tFuera > 2.6) continue;
    if (e.clase === 'cazador') {
      if (J.fase !== 'prep' && !e.jugador && J.fase !== 'titulo') {   // las cartas de despido que le quedan a cada becario
        for (let k = 0; k < AJUSTES.balas; k++) { c.fillStyle = OL; c.fillRect(e.x - 17 + k * 7, e.y - 76, 6, 8); c.fillStyle = k < e.balas ? '#fff6ea' : '#5a5f7a'; c.fillRect(e.x - 16 + k * 7, e.y - 75, 4, 6); }
      }
      if (e.marca) pintaSigno(c, e.x, e.y - 84, e.marca, e.marca === '!' ? '#ff4b5c' : '#e8731a', t);
    } else if (!e.fuera && e.hielo < 0.4 && J.fase !== 'titulo' && !(e === yo && TALLER.abierto)) {
      c.globalAlpha = 1 - e.hielo / 0.4; rotulo(c, e.jugador ? tr('TÚ') : e.nombre, e.x, e.y - 76, 10, e.jugador ? '#ffcb3d' : '#fff6ea', OL, LETRA_UI); c.globalAlpha = 1;
    }
  }
  if (yo && !yo.fuera && yo.clase === 'camaleon' && yo.hielo > 0.3 && !TALLER.abierto) {
    // congelado no te ves ni tú: una flecha y el borde de puntos te dicen dónde estás (solo los ves tú)
    const a = Math.min(1, (yo.hielo - 0.3) / 0.5), by = yo.y - 62 - Math.abs(Math.sin(t * 3.2)) * 5;
    c.globalAlpha = a; forma(c, poli(yo.x - 8, by - 9, yo.x + 8, by - 9, yo.x, by + 2), '#ffcb3d', 2.6);
    c.globalAlpha = a * 0.55; c.save(); c.translate(yo.x, yo.y); c.beginPath(); trazaAlubia(c); c.lineWidth = 1.2; c.setLineDash([3, 4]); c.lineDashOffset = -t * 5; c.strokeStyle = '#fff6ea'; c.stroke(); c.setLineDash([]); c.restore();
    c.globalAlpha = 1;
  }
  if (yo && yo.clase === 'cazador' && J.fase === 'caza' && ENTRADA.raton && !ENTRADA.tactil) {
    // la mira del ratón: verde si llegas, roja si no
    const [x, y] = aMundo(ENTRADA.raton[0], ENTRADA.raton[1]), llega = lejos(yo.x, yo.y - 6, x, y) <= AJUSTES.alcance && yo.enfria <= 0;
    c.strokeStyle = OL; c.lineWidth = 4; c.beginPath(); c.arc(x, y, 9, 0, TAU); c.stroke();
    c.strokeStyle = llega ? '#7ee04a' : '#ff4b5c'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 9, 0, TAU); c.moveTo(x - 14, y); c.lineTo(x - 5, y); c.moveTo(x + 5, y); c.lineTo(x + 14, y); c.moveTo(x, y - 14); c.lineTo(x, y - 5); c.moveTo(x, y + 5); c.lineTo(x, y + 14); c.stroke();
  }
}

// una flecha en el borde de la pantalla que señala algo que queda fuera (un silbido, un becario que se acerca)
function flechaBorde(c, x, y, color, alfa) {
  const [sx, sy] = aPantalla(x, y), m = 30, bajita = VH < 520, arriba = bajita ? 64 : 124, abajo = VH - (bajita ? 24 : 120);
  if (sx > m && sx < VW - m && sy > arriba && sy < abajo) return;
  const bx = limita(sx, m, VW - m), by = limita(sy, arriba, abajo), a = Math.atan2(sy - by, sx - bx);
  c.save(); c.translate(bx, by); c.rotate(a); c.globalAlpha = alfa;
  forma(c, poli(13, 0, -7, -11, -2, 0, -7, 11), color, 3);
  c.restore();
}
// la palanca que aparece bajo el dedo, las flechas del borde y el pincel o el cuentagotas en el taller (en píxeles de pantalla)
function pintaEncima(c, t) {
  if (!TALLER.abierto && J.fase === 'caza' && J.yo) {
    for (const f of FX.lista) if (f.k === 'onda') flechaBorde(c, f.x, f.y, '#ffcb3d', Math.min(1, (1 - f.t / f.dur) * 2));
    if (J.yo.clase === 'camaleon') for (const h of J.cazadores) { const d = lejos(h.x, h.y, J.yo.x, J.yo.y); if (!h.fuera && h.balas > 0 && d < 620) flechaBorde(c, h.x, h.y - 26, h.alerta >= 1 ? '#ff4b5c' : '#6fa8ff', limita(1.25 - d / 620, 0.25, 1)); }
  }
  const p = ENTRADA.palanca;
  if (p && !TALLER.abierto) {
    const dx = p.x - p.x0, dy = p.y - p.y0, d = Math.hypot(dx, dy) || 1, f = Math.min(44, d);
    c.globalAlpha = 0.5; c.fillStyle = 'rgba(255,246,234,0.25)'; c.strokeStyle = OL; c.lineWidth = 3; c.beginPath(); c.arc(p.x0, p.y0, 46, 0, TAU); c.fill(); c.stroke();
    c.globalAlpha = 0.85; c.fillStyle = '#fff6ea'; c.beginPath(); c.arc(p.x0 + dx / d * f, p.y0 + dy / d * f, 21, 0, TAU); c.fill(); c.stroke(); c.globalAlpha = 1;
  }
  if (TALLER.abierto && TALLER.puntero) {
    const [x, y] = TALLER.puntero, r = TALLER.herr === 'gota' ? 5 : TALLER.radio * CAM.z;
    c.lineWidth = 3; c.strokeStyle = 'rgba(32,16,44,0.9)'; c.beginPath(); c.arc(x, y, r + 1, 0, TAU); c.stroke();
    c.lineWidth = 1.4; c.strokeStyle = '#fff'; c.beginPath(); c.arc(x, y, r + 1, 0, TAU); c.stroke();
    if (TALLER.herr === 'gota') { c.beginPath(); c.moveTo(x - 12, y); c.lineTo(x + 12, y); c.moveTo(x, y - 12); c.lineTo(x, y + 12); c.stroke(); }
  }
}

function dibuja(t) {
  const c = ctx; calculaVista();
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  const x0 = -CAM.ox / CAM.esc, y0 = -CAM.oy / CAM.esc, vw = cv.width / CAM.esc, vh = cv.height / CAM.esc, capas = TALLER.abierto && TALLER.capas;
  if (capas) c.drawImage(TALLER.detras, 0, 0);
  else {
    c.fillStyle = COLOR_MURO; c.fillRect(0, 0, cv.width, cv.height);
    const sx = Math.max(0, x0), sy = Math.max(0, y0), sw = Math.min(ANCHO, x0 + vw) - sx, sh = Math.min(ALTO, y0 + vh) - sy;
    ponMundo(c);
    if (sw > 0 && sh > 0) c.drawImage(MAPA.fondo, sx * ESC_FONDO, sy * ESC_FONDO, sw * ESC_FONDO, sh * ESC_FONDO, sx, sy, sw, sh);
  }
  ponMundo(c);
  pintaFxSuelo(c);
  // muebles, puerta y personajes, de atrás adelante
  const cosas = [];
  if (!capas) for (const m of MAPA.porY) if (m.dib.x0 < x0 + vw && m.dib.x0 + m.dib.w > x0 && m.dib.y0 < y0 + vh && m.dib.y0 + m.dib.h > y0) cosas.push(m);
  for (const e of J.entes) if (!(e.fuera && e.tFuera > 3) && e.x > x0 - 60 && e.x < x0 + vw + 60 && e.y > y0 - 20 && e.y < y0 + vh + 90) cosas.push(e);
  if (PUERTA.abierta < 1) cosas.push(COSA_PUERTA);
  cosas.sort((a, b) => a.y - b.y);
  for (const k of cosas) {
    if (k.T) c.drawImage(k.dibujo.cv, k.dib.x0, k.dib.y0, k.dib.w, k.dib.h);
    else if (k.puerta) pintaPuerta(c, t);
    else if (k === J.yo && TALLER.abierto) pintaYoEnTaller(c, k, t);
    else { pintaAlubia(c, k, t); c.globalAlpha = 1; }
  }
  if (capas) { c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(TALLER.delante, 0, 0); ponMundo(c); }
  if (!TALLER.abierto) pintaLuces(c);
  ponMundo(c); pintaFx(c); pintaMarcas(c, t);
  c.setTransform(DPR, 0, 0, DPR, 0, 0); pintaEncima(c, t);
}
