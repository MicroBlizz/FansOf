// Fans of Rouflage (prototipo) · EL TALLER: el modo de pintarse. La cámara se acerca a tu galleta y se pinta con el dedo (o el ratón):
// tocar el suelo coge su color (cuentagotas) y arrastrar sobre el cuerpo lo pinta, con cuatro gordos de pincel. También hay figuras
// (línea, cuadrado, círculo: se arrastra de un punto a otro), una paleta con los colores del mapa y la postura en la que te
// congelas (como en el juego original). Con el CALCO puesto la piel se ve medio transparente para seguir el dibujo del suelo. Mientras tanto, el fondo se vuelve a pintar ampliado (dos capas: lo de detrás
// y los muebles de delante) para que se vea nítido de cerca.
'use strict';

const RADIOS = [0.7, 2.2, 4.5, 8];   // muy fino (para detalles), fino, medio y gordo
const FIGURAS = ['linea', 'cuadro', 'circulo'];
const TALLER = { plegado: false, abierto: false, herr: 'pincel', radio: RADIOS[2], cabezal: 'redondo', figura: null, color: BLANCO_PIEL, recientes: [BLANCO_PIEL], calco: true,
  cam: [0, 0, 1], capas: false, fija: null, detras: null, delante: null, trazo: null, duda: null, puntero: null, sucio: 0 };

function abreTaller() {
  const yo = J.yo;
  if (TALLER.abierto || !yo || yo.fuera || yo.clase !== 'camaleon' || (J.fase !== 'prep' && J.fase !== 'caza') || J.pausa) return;
  yo.vx = yo.vy = 0; yo.x = Math.round(yo.x); yo.y = Math.round(yo.y); yo.moviendo = false;
  TALLER.abierto = true; TALLER.capas = false; TALLER.trazo = null; TALLER.figura = null; TALLER.duda = null; TALLER.puntero = null; if (TALLER.herr !== 'senuelo') TALLER.herr = 'pincel';      // el señuelo se queda puesto hasta que lo vuelvas a apretar
  ENTRADA.palanca = null; ENTRADA.toques.clear();
  muestraTaller(true); encuadraTaller(); mideTaller(); play('select');
}
// dónde tiene que ponerse la cámara para que la alubia quede grande en el hueco que deja el panel de herramientas
function encuadraTaller() {
  const yo = J.yo, p = document.getElementById('taller').getBoundingClientRect(), deLado = matchMedia('(orientation: landscape) and (max-height: 520px)').matches;   // móvil tumbado: el panel va a un lado
  const libreW = deLado ? VW - p.width : VW, arriba = 66, libreH = deLado ? VH - arriba : VH - p.height - arriba;
  // con el señuelo la cámara se abre para ver todo hasta donde llega el brazo (se pinta lejos de uno, no encima)
  // señuelo: la vista de entrada abarca el área entera del brazo (el panel puede tapar parte del área: se mueve la cámara con el ratón o los dedos)
  const z = TALLER.herr === 'senuelo' ? limita(Math.min(libreW, Math.max(libreH, 0.62 * (VH - arriba))) / (SEN.alcance * 2 + 16), 0.3, 2.4) : limita(Math.min(libreW / (CAJA_W + 36), libreH / (CAJA_H + 26)), 2.4, 7.5);
  const sx = libreW / 2, sy = arriba + libreH / 2;
  TALLER.libre = [sx, sy, libreW, libreH]; if (TALLER.herr === 'senuelo') SENCAM.z0 = z;   // la vista de entrada es la del área entera: de ahí solo se acerca
  TALLER.cam = [yo.x - (sx - VW / 2) / z, yo.y - 26 - (sy - VH / 2) / z, z];
  TALLER.capas = false;
}
// cuando la cámara ya ha llegado, se pinta el fondo ampliado una sola vez
function preparaCapas() {
  const yo = J.yo;
  CAM.x = TALLER.cam[0]; CAM.y = TALLER.cam[1]; CAM.z = TALLER.cam[2]; CAM.tiembla = 0;
  TALLER.capas = false; calculaVista(); TALLER.fija = [CAM.ox, CAM.oy, CAM.esc];
  const R = { x0: -CAM.ox / CAM.esc - 2, y0: -CAM.oy / CAM.esc - 2, x1: (cv.width - CAM.ox) / CAM.esc + 2, y1: (cv.height - CAM.oy) / CAM.esc + 2 };
  const cerca = m => m.dib.x0 < R.x1 && m.dib.x0 + m.dib.w > R.x0 && m.dib.y0 < R.y1 && m.dib.y0 + m.dib.h > R.y0;
  let g;
  [TALLER.detras, g] = lienzo(cv.width, cv.height); ponMundo(g); pintaMundo(g, R);
  for (const m of MAPA.porY) if (m.y <= yo.y && cerca(m)) pintaMueble(g, m);
  [TALLER.delante, g] = lienzo(cv.width, cv.height); ponMundo(g);
  for (const m of MAPA.porY) if (m.y > yo.y && cerca(m)) pintaMueble(g, m);
  TALLER.capas = true;
}
function cierraTaller() {
  if (!TALLER.abierto) return;
  TALLER.abierto = false; TALLER.capas = false; TALLER.detras = TALLER.delante = null; TALLER.trazo = null; TALLER.figura = null; TALLER.duda = null; TALLER.puntero = null;
  const yo = J.yo; if (yo) { mideCamuflaje(yo); yo.pasos.length = Math.min(yo.pasos.length, 4); if (J.pvp && yo.congelado) rfpCongela(yo); }   // por internet, si te retocas congelado, los demás reciben la piel nueva
  muestraTaller(false);
}
// cada fotograma: espera a que la cámara llegue para pintar las capas, y mide el camuflaje mientras se pinta (sin pasarse)
function avanzaTaller(dt) {
  if (!TALLER.abierto) return;
  if (!TALLER.capas) {
    const [tx, ty, tz] = TALLER.cam;
    if (Math.abs(CAM.z - tz) < tz * 0.004 && Math.abs(CAM.x - tx) < 0.3 && Math.abs(CAM.y - ty) < 0.3) preparaCapas();
  }
  senCamTeclas(dt);
  if (TALLER.sucio > 0) { TALLER.sucio -= dt; if (TALLER.sucio <= 0) mideTaller(); }
}
function mideTaller() { if (J.yo) pintaMedidor(mideCamuflaje(J.yo)); }

function cogeColor(x, y) {
  const color = cuentagotas(x, y);
  ponColor(color); TALLER.herr = 'pincel';
  fxAro(x, y, color); play('gota'); refrescaTaller();
}
function ponColor(color) {
  TALLER.color = color;
  const i = TALLER.recientes.indexOf(color); if (i > 0) TALLER.recientes.splice(i, 1);
  if (i !== 0) { TALLER.recientes.splice(1, 0, color); TALLER.recientes.length = Math.min(TALLER.recientes.length, 7); }   // el blanco se queda siempre el primero
}

/* ---------- el dedo o el ratón sobre el lienzo ---------- */
// Un toque suelto fuera del cuerpo coge el color de ese punto; arrastrar pinta siempre (aunque el trazo empiece fuera: así se
// puede repasar el borde sin cambiar de color sin querer). Con el cuentagotas elegido, cualquier toque coge color.
const enCaja = (yo, x, y) => [x - (yo.x - PIE_X), y - (yo.y - PIE_Y)];
function empiezaTrazo(id, bx, by) {
  const yo = J.yo; guardaPaso(yo); TALLER.trazo = { id, x: bx, y: by };
  trazo(yo, bx, by, bx, by, TALLER.radio, TALLER.color, TALLER.cabezal); yo.pintado = true; TALLER.sucio = 0.2; play('pincel');
}
function tallerAbajo(ev) {
  if (senCamPuntero(ev, 'abajo')) return;
  const yo = J.yo, [x, y] = aMundo(ev.clientX, ev.clientY);
  TALLER.puntero = [ev.clientX, ev.clientY]; TALLER.duda = null;
  if (TALLER.herr === 'gota') { cogeColor(x, y); return; }
  if (TALLER.herr === 'senuelo') { senueloAbajo(ev.pointerId, x, y); return; }
  if (FIGURAS.includes(TALLER.herr)) { const [bx, by] = enCaja(yo, x, y); TALLER.figura = { id: ev.pointerId, x0: bx, y0: by, x1: bx, y1: by }; return; }
  if (!dentroDeAlubia(yo, x, y, TALLER.radio + 1.5)) { TALLER.duda = { id: ev.pointerId, sx: ev.clientX, sy: ev.clientY, x, y }; return; }   // ¿toque o trazo? se sabe al mover o soltar
  const [bx, by] = enCaja(yo, x, y); empiezaTrazo(ev.pointerId, bx, by);
}
function tallerMueve(ev) {
  if (senCamPuntero(ev, 'mueve')) return;
  TALLER.puntero = [ev.clientX, ev.clientY];
  const yo = J.yo, [x, y] = aMundo(ev.clientX, ev.clientY), [bx, by] = enCaja(yo, x, y), d = TALLER.duda;
  if (SEN.pinta && SEN.pinta.id === ev.pointerId) { senueloMueve(x, y); return; }
  const f = TALLER.figura; if (f && f.id === ev.pointerId) { f.x1 = bx; f.y1 = by; return; }
  if (d && d.id === ev.pointerId && Math.hypot(ev.clientX - d.sx, ev.clientY - d.sy) > 9) { TALLER.duda = null; const [ix, iy] = enCaja(yo, d.x, d.y); empiezaTrazo(ev.pointerId, ix, iy); }
  const t = TALLER.trazo; if (!t || t.id !== ev.pointerId) return;
  trazo(yo, t.x, t.y, bx, by, TALLER.radio, TALLER.color, TALLER.cabezal); t.x = bx; t.y = by;
  if (TALLER.sucio <= 0) TALLER.sucio = 0.2;
  if (Math.random() < 0.06) play('pincel');
}
function tallerArriba(ev) {
  if (senCamPuntero(ev, 'arriba')) return;
  if (ev.pointerType !== 'mouse') TALLER.puntero = null;
  if (SEN.pinta && SEN.pinta.id === ev.pointerId) { senueloArriba(); return; }
  const f = TALLER.figura;
  if (f && f.id === ev.pointerId) {
    TALLER.figura = null;
    if (ev.type === 'pointerup' && Math.hypot(f.x1 - f.x0, f.y1 - f.y0) > 0.6) {
      const yo = J.yo; guardaPaso(yo); figura(yo, TALLER.herr, f.x0, f.y0, f.x1, f.y1, TALLER.radio, TALLER.color, TALLER.cabezal); yo.pintado = true; play('pincel'); mideTaller();
    }
    return;
  }
  const d = TALLER.duda;
  if (d && d.id === ev.pointerId) { TALLER.duda = null; if (ev.type === 'pointerup') cogeColor(d.x, d.y); }
  if (TALLER.trazo && TALLER.trazo.id === ev.pointerId) { TALLER.trazo = null; mideTaller(); }
}

/* ---------- los botones del panel ---------- */
// plegar el panel: se queda solo el medidor, el color y LISTO, para ver más el cuerpo (sobre todo en el móvil); la cámara se recoloca en el hueco que queda
function tallerPlegar() {
  TALLER.plegado = !TALLER.plegado; play('select'); refrescaTaller();
  if (TALLER.abierto) encuadraTaller();
}
function tallerHerramienta(h) {
  if (TALLER.herr === 'senuelo' && h !== 'senuelo') { pista(tr('Estás en señuelo: vuelve a pulsar SEÑUELO para usar otra herramienta'), 2.4); play('deny'); return; }      // fijado hasta volver a apretarlo
  TALLER.herr = TALLER.herr === h ? 'pincel' : h; if (TALLER.herr === 'senuelo') { tutoDi('cam-senuelo'); if (J.t >= PISTA.hasta) pista(tr('Zoom: rueda, + / - o pellizco. Mover cámara: WASD, botón derecho o dos dedos'), 3.2); } play('select'); refrescaTaller(); if (TALLER.abierto) encuadraTaller(); }      // el señuelo abre la cámara, el resto la cierra
function tallerRadio(i) { const antes = TALLER.herr; TALLER.radio = RADIOS[i]; if (TALLER.herr !== 'linea' && TALLER.herr !== 'senuelo') TALLER.herr = 'pincel'; play('select'); refrescaTaller(); if (antes !== TALLER.herr && TALLER.abierto) encuadraTaller(); }   // la línea usa el gordo del pincel
function tallerRellena() { const yo = J.yo; guardaPaso(yo); rellena(yo, TALLER.color); yo.pintado = true; play('cubo'); mideTaller(); }
function tallerDeshace() { if (deshace(J.yo)) { play('pop'); mideTaller(); } else play('deny'); }
function tallerCalco() { TALLER.calco = !TALLER.calco; play('select'); refrescaTaller(); }
function tallerFigura(h) { tallerHerramienta(h); }
// el cabezal del pincel y de las líneas: redondo o cuadrado
function tallerCabezal(c) { TALLER.cabezal = c === 'cuadrado' ? 'cuadrado' : 'redondo'; play('select'); refrescaTaller(); }
// la postura en la que te congelas: la piel toma la forma nueva (lo pintado se queda donde coincide)
function tallerPostura(k) {
  const yo = J.yo; if (!yo) return;
  if (cambiaPostura(yo, k)) { yo.pz = null; play('select'); mideTaller(); } else play('select');
  refrescaTaller();
}
// la vista previa de una figura mientras se arrastra (sobre la galleta, sin salirse)
function pintaFiguraPrevia(c, yo) {
  const f = TALLER.figura; if (!f) return;
  c.save(); c.beginPath(); trazaAlubia(c, null, yo.postura); c.clip();
  c.translate(-PIE_X, -PIE_Y); trazaFigura(c, TALLER.herr, f.x0, f.y0, f.x1, f.y1);
  c.globalAlpha = 0.85;
  if (TALLER.herr === 'linea') { c.strokeStyle = TALLER.color; c.lineWidth = TALLER.radio * 2; c.lineCap = TALLER.cabezal === 'cuadrado' ? 'square' : 'round'; c.stroke(); } else { c.fillStyle = TALLER.color; c.fill(); }
  c.restore();
  // y su borde, para verla aunque el color sea casi el del suelo
  c.save(); c.translate(-PIE_X, -PIE_Y); trazaFigura(c, TALLER.herr, f.x0, f.y0, f.x1, f.y1);
  c.setLineDash([1.6, 1.6]); c.lineWidth = 0.5; c.strokeStyle = '#ffffff'; c.stroke(); c.restore();
}

/* ---------- la paleta: los colores que más se repiten en los suelos y las paredes del mapa (con lo que haya encima), calculados una vez ---------- */
let PALETA = null;
function olvidaPaleta() { PALETA = null; }   // al cambiar de mapa: la paleta sale de sus colores
function paletaDelMapa() {
  if (PALETA) return PALETA;
  const F = MAPA.px, cuenta = new Map();
  for (let i = 0; i < F.length; i += 4 * 7) {
    const px = (i >> 2) % ANCHO, py = ((i >> 2) / ANCHO) | 0, celda = GRID[((py / CEL) | 0) * MW + ((px / CEL) | 0)];
    if (celda !== SUELO && celda !== CARA) continue;   // solo suelos y paredes de frente: los muros por arriba no sirven para esconderse
    const clave = ((F[i] >> 4) << 8) | ((F[i + 1] >> 4) << 4) | (F[i + 2] >> 4), v = cuenta.get(clave);
    if (v) { v.n++; v.r += F[i]; v.g += F[i + 1]; v.b += F[i + 2]; } else cuenta.set(clave, { n: 1, r: F[i], g: F[i + 1], b: F[i + 2] });
  }
  const todos = [...cuenta.values()].sort((a, b) => b.n - a.n), elegidos = [];
  for (const v of todos) {
    const r = v.r / v.n, g = v.g / v.n, b = v.b / v.n;
    if (elegidos.every(o => difColor(r, g, b, o[0], o[1], o[2]) > 46)) elegidos.push([r, g, b]);
    if (elegidos.length >= 18) break;
  }
  // de oscuro a claro, para encontrar el tono enseguida
  elegidos.sort((a, b) => (a[0] * 0.3 + a[1] * 0.59 + a[2] * 0.11) - (b[0] * 0.3 + b[1] * 0.59 + b[2] * 0.11));
  return (PALETA = elegidos.map(([r, g, b]) => rgbHex(r, g, b)));
}
