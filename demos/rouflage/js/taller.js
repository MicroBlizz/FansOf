// Fans of Rouflage (prototipo) · EL TALLER: el modo de pintarse. La cámara se acerca a tu alubia y se pinta con el dedo (o el ratón):
// tocar el suelo coge su color (cuentagotas) y arrastrar sobre el cuerpo lo pinta. Con el CALCO puesto la piel se ve medio
// transparente para seguir el dibujo del suelo. Mientras tanto, el fondo se vuelve a pintar ampliado (dos capas: lo de detrás
// y los muebles de delante) para que se vea nítido de cerca.
'use strict';

const RADIOS = [2.2, 4.5, 8];
const TALLER = { abierto: false, herr: 'pincel', radio: RADIOS[1], color: BLANCO_PIEL, recientes: [BLANCO_PIEL], calco: true,
  cam: [0, 0, 1], capas: false, fija: null, detras: null, delante: null, trazo: null, duda: null, puntero: null, sucio: 0 };

function abreTaller() {
  const yo = J.yo;
  if (TALLER.abierto || !yo || yo.fuera || yo.clase !== 'camaleon' || (J.fase !== 'prep' && J.fase !== 'caza') || J.pausa) return;
  yo.vx = yo.vy = 0; yo.x = Math.round(yo.x); yo.y = Math.round(yo.y); yo.moviendo = false;
  TALLER.abierto = true; TALLER.capas = false; TALLER.trazo = null; TALLER.duda = null; TALLER.puntero = null; TALLER.herr = 'pincel';
  ENTRADA.palanca = null; ENTRADA.toques.clear();
  muestraTaller(true); encuadraTaller(); mideTaller(); play('select');
}
// dónde tiene que ponerse la cámara para que la alubia quede grande en el hueco que deja el panel de herramientas
function encuadraTaller() {
  const yo = J.yo, p = document.getElementById('taller').getBoundingClientRect(), deLado = p.height > VH * 0.7;
  const libreW = deLado ? VW - p.width : VW, arriba = 66, libreH = deLado ? VH - arriba : VH - p.height - arriba;
  const z = limita(Math.min(libreW / (CAJA_W + 36), libreH / (CAJA_H + 26)), 2.4, 7.5);
  const sx = libreW / 2, sy = arriba + libreH / 2;
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
  TALLER.abierto = false; TALLER.capas = false; TALLER.detras = TALLER.delante = null; TALLER.trazo = null; TALLER.duda = null; TALLER.puntero = null;
  const yo = J.yo; if (yo) { mideCamuflaje(yo); yo.pasos.length = Math.min(yo.pasos.length, 4); }
  muestraTaller(false);
}
// cada fotograma: espera a que la cámara llegue para pintar las capas, y mide el camuflaje mientras se pinta (sin pasarse)
function avanzaTaller(dt) {
  if (!TALLER.abierto) return;
  if (!TALLER.capas) {
    const [tx, ty, tz] = TALLER.cam;
    if (Math.abs(CAM.z - tz) < tz * 0.004 && Math.abs(CAM.x - tx) < 0.3 && Math.abs(CAM.y - ty) < 0.3) preparaCapas();
  }
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
  trazo(yo, bx, by, bx, by, TALLER.radio, TALLER.color); yo.pintado = true; TALLER.sucio = 0.2; play('pincel');
}
function tallerAbajo(ev) {
  const yo = J.yo, [x, y] = aMundo(ev.clientX, ev.clientY);
  TALLER.puntero = [ev.clientX, ev.clientY]; TALLER.duda = null;
  if (TALLER.herr === 'gota') { cogeColor(x, y); return; }
  if (!dentroDeAlubia(yo, x, y, TALLER.radio + 1.5)) { TALLER.duda = { id: ev.pointerId, sx: ev.clientX, sy: ev.clientY, x, y }; return; }   // ¿toque o trazo? se sabe al mover o soltar
  const [bx, by] = enCaja(yo, x, y); empiezaTrazo(ev.pointerId, bx, by);
}
function tallerMueve(ev) {
  TALLER.puntero = [ev.clientX, ev.clientY];
  const yo = J.yo, [x, y] = aMundo(ev.clientX, ev.clientY), [bx, by] = enCaja(yo, x, y), d = TALLER.duda;
  if (d && d.id === ev.pointerId && Math.hypot(ev.clientX - d.sx, ev.clientY - d.sy) > 9) { TALLER.duda = null; const [ix, iy] = enCaja(yo, d.x, d.y); empiezaTrazo(ev.pointerId, ix, iy); }
  const t = TALLER.trazo; if (!t || t.id !== ev.pointerId) return;
  trazo(yo, t.x, t.y, bx, by, TALLER.radio, TALLER.color); t.x = bx; t.y = by;
  if (TALLER.sucio <= 0) TALLER.sucio = 0.2;
  if (Math.random() < 0.06) play('pincel');
}
function tallerArriba(ev) {
  if (ev.pointerType !== 'mouse') TALLER.puntero = null;
  const d = TALLER.duda;
  if (d && d.id === ev.pointerId) { TALLER.duda = null; if (ev.type === 'pointerup') cogeColor(d.x, d.y); }
  if (TALLER.trazo && TALLER.trazo.id === ev.pointerId) { TALLER.trazo = null; mideTaller(); }
}

/* ---------- los botones del panel ---------- */
function tallerHerramienta(h) { TALLER.herr = TALLER.herr === h ? 'pincel' : h; play('select'); refrescaTaller(); }
function tallerRadio(i) { TALLER.radio = RADIOS[i]; TALLER.herr = 'pincel'; play('select'); refrescaTaller(); }
function tallerRellena() { const yo = J.yo; guardaPaso(yo); rellena(yo, TALLER.color); yo.pintado = true; play('cubo'); mideTaller(); }
function tallerDeshace() { if (deshace(J.yo)) { play('pop'); mideTaller(); } else play('deny'); }
function tallerCalco() { TALLER.calco = !TALLER.calco; play('select'); refrescaTaller(); }
