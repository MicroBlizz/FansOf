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
  return J.fase !== 'titulo' && J.modo === 'cazador' ? z * 0.92 * (zoomCazadorVale() ? ZOOMC.f : 1) : z;      // el zoom del cazador (zoom-cazador.js)
}
function avanzaCamara(dt, deGolpe) {
  let tx = CAM.x, ty = CAM.y, tz = zoomJuego();
  if (TALLER.abierto) [tx, ty, tz] = TALLER.cam;
  else if (J.fase === 'titulo') { const a = J.t * 0.07; tx = 840 + Math.cos(a) * 250; ty = 330 + Math.sin(a * 1.3) * 110; }
  else if (J.yo) {
    tx = J.yo.x; ty = J.yo.y - 26;
    if (J.fantasma && espectando()) { tx = J.fantasma.x; ty = J.fantasma.y; }      // el fantasma de un despedido lleva la cámara
  }
  const k = deGolpe ? 1 : Math.min(1, dt * 7);
  CAM.z += (tz - CAM.z) * (deGolpe ? 1 : Math.min(1, dt * 9)); CAM.x += (tx - CAM.x) * k; CAM.y += (ty - CAM.y) * k;
  if (!TALLER.abierto) {   // sin enseñar más allá del mundo (dejando sitio a los botones de arriba y de abajo)
    const mw = VW / CAM.z / 2, mh = VH / CAM.z / 2, lado = 30 / CAM.z, arriba = margenArriba() / CAM.z, abajo = 150 / CAM.z;
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
const COSA_PUERTA = { y: 0, puerta: true };   // su y la pone cargaMapa()
function pintaPuerta(c, t) {
  const x = PUERTA.x + PUERTA.w / 2, y0 = PUERTA.y + 6, y1 = PUERTA.y + PUERTA.h - 4, a = 1 - PUERTA.abierta;
  if (PUERTA.estilo === 'madera') {   // una puerta de madera vieja de canto, con su letrero de EXIT; al abrirse gira hacia dentro
    const w = PUERTA.w, h = PUERTA.h, giro = (1 - a) * 0.9;
    c.save(); c.translate(PUERTA.x + w / 2, PUERTA.y + 2); c.scale(1, Math.max(0.08, Math.cos(giro)));
    forma(c, caja(-w / 2 + 6, -4, w - 12, h, 3), '#8f6a3a', 3); c.fillStyle = '#6e4f28'; c.fillRect(-w / 2 + 12, 6, w - 24, h - 20);
    forma(c, caja(-w / 2 + 16, 10, w - 32, h / 2 - 16, 2), '#a67c48', 2); forma(c, caja(-w / 2 + 16, h / 2 + 2, w - 32, h / 2 - 16, 2), '#a67c48', 2);
    punto(c, w / 2 - 15, h / 2 - 2, 3.2, '#e9c46a'); c.restore();
    forma(c, caja(x - 20, PUERTA.y - 18, 40, 12, 2), '#191430', 2.5); rotulo(c, 'EXIT', x, PUERTA.y - 12, 9, a > 0.5 ? '#ff4b5c' : '#7ee04a');
    return;
  }
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
  pintaFiguraPrevia(c, yo);
  c.beginPath(); trazaAlubia(c, null, yo.postura); c.lineWidth = 0.8; c.setLineDash([2.5, 2.5]);
  c.lineDashOffset = -t * 6; c.strokeStyle = 'rgba(32,16,44,0.95)'; c.stroke();
  c.lineDashOffset = -t * 6 + 2.5; c.strokeStyle = 'rgba(255,255,255,0.95)'; c.stroke();
  c.setLineDash([]);
  if (TALLER.herr === 'senuelo') { c.beginPath(); c.arc(0, -20, SEN.alcance, 0, TAU); c.lineWidth = 1.4; c.setLineDash([6, 6]); c.lineDashOffset = -t * 8; c.strokeStyle = 'rgba(255,246,234,0.55)'; c.stroke(); c.setLineDash([]); }      // hasta dónde llega el brazo
  c.restore();
}

// un bocadillo pequeño con un signo encima de alguien
function pintaSigno(c, x, y, s, color, t) {
  const bote = Math.abs(Math.sin(t * 6)) * 2.5;
  forma(c, c => { rrPathRF(c, x - 11, y - 22 - bote, 22, 22, 7); }, '#fff6ea', 2.6);
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
        for (let k = 0; k < REGLAS.balas; k++) {   // la misma cartita de despido que en el panel del cazador: sobre oscuro con su raya roja, gris si ya se gastó
          const bx = e.x - 20 + k * 8, by = e.y - 78, viva = k < e.balas;
          c.fillStyle = OL; c.fillRect(bx, by, 7, 10); c.fillStyle = viva ? '#fff6ea' : '#5a5f7a'; c.fillRect(bx + 1, by + 1, 5, 8);
          if (viva) { c.fillStyle = '#ff4b5c'; c.fillRect(bx + 1, by + 4, 5, 2); }
        }
      }
      if (J.fase !== 'titulo') rotulo(c, e.jugador ? tr('TÚ') : e.nombre, e.x, e.y - 92, 10, e.jugador ? '#ffcb3d' : '#9fd0ff', OL, LETRA_UI);   // el cazador siempre enseña su nombre, a todos
      if (e.marca) pintaSigno(c, e.x, e.y - 106, e.marca, e.marca === '!' ? '#ff4b5c' : '#e8731a', t);
    } else if (!e.fuera && e.hielo < 0.4 && J.fase !== 'titulo' && !(e === yo && TALLER.abierto) && !invisible(e)) {
      c.globalAlpha = 1 - e.hielo / 0.4; rotulo(c, e.jugador ? tr('TÚ') : e.nombre, e.x, e.y - 76, 10, e.jugador ? '#ffcb3d' : '#fff6ea', OL, LETRA_UI); c.globalAlpha = 1;
    }
  }
  pintaFantasma(c, t);
  pintaGestos(c);      // los bocadillos de los gestos del armario (armario-partida.js)
  if (yo && yo.clase === 'cazador' && J.fase === 'caza') {
    // la ayuda del cazador: SOLO al camaleón que se pasa de listo (100 % de camuflaje, imposible de ver) y está cerca y en la luz le brilla el contorno; al 99 % ya no. Para el resto están los señuelos
    for (const k of J.camaleones) {
      if (k.fuera || invisible(k) || k.hielo < 0.85 || (k.camo || 0) < 100) continue;
      const d = lejos(yo.x, yo.y, k.x, k.y); if (d > 110 || !veCazador(yo, k.x, k.y - 8)) continue;
      c.save(); c.translate(k.x, k.y); c.beginPath(); trazaAlubia(c, null, k.postura); c.globalAlpha = (1 - d / 110) * (0.35 + 0.2 * Math.sin(t * 5));
      c.lineWidth = 1.6; c.setLineDash([3, 4]); c.lineDashOffset = -t * 6; c.strokeStyle = '#fff6ea'; c.stroke(); c.restore();
    }
    c.globalAlpha = 1; c.setLineDash([]);
  }
  if (yo && !yo.fuera && yo.clase === 'camaleon' && yo.hielo > 0.3 && !TALLER.abierto) {
    // congelado no te ves ni tú: una flecha y el borde de puntos te dicen dónde estás (solo los ves tú)
    const a = Math.min(1, (yo.hielo - 0.3) / 0.5), by = yo.y - 62 - Math.abs(Math.sin(t * 3.2)) * 5;
    c.globalAlpha = a; forma(c, poli(yo.x - 8, by - 9, yo.x + 8, by - 9, yo.x, by + 2), '#ffcb3d', 2.6);
    c.globalAlpha = a * 0.55; c.save(); c.translate(yo.x, yo.y); c.beginPath(); trazaAlubia(c, null, yo.postura); c.lineWidth = 1.2; c.setLineDash([3, 4]); c.lineDashOffset = -t * 5; c.strokeStyle = '#fff6ea'; c.stroke(); c.setLineDash([]); c.restore();
    c.globalAlpha = 1;
  }
  if (yo && yo.clase === 'cazador' && J.fase === 'caza' && ENTRADA.raton && !ENTRADA.tactil) {
    // la mira del ratón: verde si llegas, roja si no
    const [x, y] = aMundo(ENTRADA.raton[0], ENTRADA.raton[1]), llega = lejos(yo.x, yo.y - 6, x, y) <= REGLAS.alcance && yo.enfria <= 0;
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
  if (!TALLER.abierto && J.fase === 'caza' && J.yo && !extraOn('apagon')) {      // Apagón total: sin pistas en pantalla
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
    const cuadrado = TALLER.cabezal === 'cuadrado' && (TALLER.herr === 'pincel' || TALLER.herr === 'linea');      // el cursor es la punta elegida
    const forma = () => { c.beginPath(); if (cuadrado) c.rect(x - r - 1, y - r - 1, 2 * r + 2, 2 * r + 2); else c.arc(x, y, r + 1, 0, TAU); };
    c.lineWidth = 3; c.strokeStyle = 'rgba(32,16,44,0.9)'; forma(); c.stroke();
    c.lineWidth = 1.4; c.strokeStyle = '#fff'; forma(); c.stroke();
    if (TALLER.herr === 'gota') { c.beginPath(); c.moveTo(x - 12, y); c.lineTo(x + 12, y); c.moveTo(x, y - 12); c.lineTo(x, y + 12); c.stroke(); }
  }
}

// un camaleón ya congelado (o congelándose) se comporta como el suelo al dibujar el orden de las cosas
const esSuelo = e => e.clase === 'camaleon' && !e.fuera && e.hielo > 0.3;
// mientras los colados se pintan, los becarios no ven nada fuera de su sala de espera
// el PvP, antes de abrirse la barrera: el becario solo ve su sala, con la pared de frente que tiene encima (el cartel de «Recursos Humanos», la del vestíbulo…) y el canto del muro que la rodea
function tapaFueraDeSala(c, x0, y0, vw, vh) {
  const z = salaEspera(); if (!z) return;
  const zi = ZONAS.indexOf(z); let arriba = z.py;
  for (let y = Math.max(0, z.y - ALTO_CARA); y < z.y; y++) for (let x = z.x; x < z.x + z.w; x++) if (ZONA_DE[y * MW + x] === zi && GRID[y * MW + x] === CARA) arriba = Math.min(arriba, y * CEL);
  const r = 10;      // lo que sobresale el contorno del canto (paredes.js); por arriba más: carteles y máquinas asoman sobre la pared
  ponMundo(c); c.fillStyle = '#0b0718'; c.beginPath(); c.rect(x0 - 60, y0 - 60, vw + 120, vh + 120); c.rect(z.px - r, arriba - 28, z.pw + 2 * r, z.py + z.ph - arriba + r + 28); c.fill('evenodd');
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
  pintaFxSuelo(c); pintaSenuelos(c); eventosPintaSuelo(c, t); botePinta(c, t);
  // muebles, puerta y personajes, de atrás adelante
  const cosas = [];
  if (!capas) for (const m of MAPA.porY) if (m.dib.x0 < x0 + vw && m.dib.x0 + m.dib.w > x0 && m.dib.y0 < y0 + vh && m.dib.y0 + m.dib.h > y0) cosas.push(m);
  for (const e of J.entes) if (!(e.fuera && e.tFuera > 3) && e.x > x0 - 60 && e.x < x0 + vw + 60 && e.y > y0 - 20 && e.y < y0 + vh + 90) cosas.push(e);
  for (const e of PRACTICA.munecos) cosas.push(e);      // los camaleones de prácticas de la sala de espera
  if (J.fase === 'paseo') cosas.push(HABITACION.armario);      // el armario de la habitación (habitacion.js)
  if (PUERTA.abierta < 1) cosas.push(COSA_PUERTA);
  // un camaleón congelado es «parte del suelo»: quien pase por detrás de él se pinta ENCIMA, no debajo. Si no, su pintura
  // de suelo quedaría sobre el becario y dejaría ver su silueta recortada (y sería facilísimo encontrarlo).
  for (const k of cosas) k.ordenY = k.y;
  for (const k of cosas) {
    if (k.T || k.puerta || k.armario || !esSuelo(k)) continue;
    for (const o of cosas) {
      if (o === k || o.T || o.puerta || o.armario || esSuelo(o) || o.y >= k.y) continue;
      if (Math.abs(o.x - k.x) < CAJA_W && k.y - o.y < CAJA_H + 4) o.ordenY = Math.max(o.ordenY, k.y + 0.5);
    }
  }
  cosas.sort((a, b) => a.ordenY - b.ordenY);
  for (const k of cosas) {
    if (k.T) c.drawImage(k.dibujo.cv, k.dib.x0, k.dib.y0, k.dib.w, k.dib.h);
    else if (k.puerta) pintaPuerta(c, t);
    else if (k.armario) pintaArmarioSala(c, k, t);
    else if (k === J.yo && TALLER.abierto) pintaYoEnTaller(c, k, t);
    else if (k.invis > 0) { if (J.yo && J.yo.clase === 'cazador') continue; pintaAlubia(c, k, t, k.invis < 2 && Math.sin(t * 18) > 0 ? 0.65 : 0.3); c.globalAlpha = 1; }      // granada: los becarios no lo ven; los suyos, como un fantasma
    else { pintaAlubia(c, k, t); c.globalAlpha = 1; }
  }
  if (capas) { c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(TALLER.delante, 0, 0); ponMundo(c); }
  if (!TALLER.abierto) {
    ponMundo(c); eventosPintaEncima(c, t); pintaLuces(c); ponMundo(c);
    for (const e of J.cazadores) if (conLuz(e)) { pintaAlubia(c, e, t); c.globalAlpha = 1; }      // el haz nace DETRÁS del becario: se repinta encima del velo y del borde del cono
    eventosPintaVelo(c, t);
  }
  ponMundo(c); pintaFx(c); pintaMarcas(c, t); idaPinta(c);
  if (J.pvp && J.yo && J.yo.clase === 'cazador' && (J.fase === 'prep' || J.fase === 'cuenta') && !capas) tapaFueraDeSala(c, x0, y0, vw, vh);
  c.setTransform(DPR, 0, 0, DPR, 0, 0); pintaEncima(c, t);
}
