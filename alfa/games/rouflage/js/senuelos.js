// Fans of Rouflage (prototipo) · LOS SEÑUELOS: un colado puede pintar en el SUELO, fuera de su cuerpo, con la herramienta «Señuelo» del taller. Cada uno tiene una tinta limitada (100) que gasta
// según lo largo y gordo que pinte, y no llega más lejos de su alcance. Lo pintado es de todos (se ve igual para quien juega y para los becarios) y los becarios de la máquina pueden picar:
// se acercan a mirar un garabato que les parece sospechoso y, si disparan, fallan y pierden una carta (como con un extintor). En el PvP se mandan los trazos (sz) a los demás.
'use strict';

const SEN = { teselas: new Map(), puntos: [], pinta: null, pend: [], tPend: 0, max: 100, alcance: 240 };
const SEN_ESC = 0.5;      // la capa se guarda a la mitad de tamaño
// la capa va en TESELAS (cuadrados de SEN_TES píxeles, cada uno su lienzo, solo donde se ha pintado): con un lienzo del tamaño del mapa, cada trazo
// nuevo obligaba al navegador a copiarlo entero para dibujarlo, y en el móvil se notaba mucho
const SEN_TES = 256, SEN_TES_W = SEN_TES / SEN_ESC;      // (en el mundo, 512 de lado)
function olvidaSenuelos() { limpiaSenuelos(); SEN.teselas.clear(); }   // al cambiar de mapa
function limpiaSenuelos() { SEN.puntos.length = 0; SEN.pend.length = 0; SEN.pinta = null; for (const t of SEN.teselas.values()) t.c.clearRect(0, 0, SEN_TES, SEN_TES); }
function senueloTesela(tx, ty) {
  const k = tx + ',' + ty; let t = SEN.teselas.get(k);
  if (!t) { const [cv, c] = lienzo(SEN_TES, SEN_TES); t = { cv, c, tx, ty }; SEN.teselas.set(k, t); }
  return t;
}

// un trazo entre dos puntos del mundo: se estampa solo donde hay suelo
function senueloTraza(x0, y0, x1, y1, r, col, cab) {
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / Math.max(0.6, r * 0.45))), sellos = []; let ult = null;
  for (let k = 0; k <= n; k++) {
    const x = x0 + (x1 - x0) * k / n, y = y0 + (y1 - y0) * k / n; if (celdaEn(x, y) !== SUELO) continue;
    sellos.push(x, y);
    if (!ult || lejos(ult[0], ult[1], x, y) > 22) { ult = [x, y]; SEN.puntos.push({ x, y, r, bots: new Set() }); }
  }
  if (SEN.puntos.length > 600) SEN.puntos.splice(0, SEN.puntos.length - 600);
  if (!sellos.length) return;
  let ax = Infinity, ay = Infinity, bx = -Infinity, by = -Infinity;
  for (let i = 0; i < sellos.length; i += 2) { ax = Math.min(ax, sellos[i]); bx = Math.max(bx, sellos[i]); ay = Math.min(ay, sellos[i + 1]); by = Math.max(by, sellos[i + 1]); }
  for (let ty = Math.max(0, Math.floor((ay - r - 1) / SEN_TES_W)); ty <= Math.floor((by + r + 1) / SEN_TES_W); ty++) {
    for (let tx = Math.max(0, Math.floor((ax - r - 1) / SEN_TES_W)); tx <= Math.floor((bx + r + 1) / SEN_TES_W); tx++) {
      const c = senueloTesela(tx, ty).c;
      c.save(); c.setTransform(SEN_ESC, 0, 0, SEN_ESC, -tx * SEN_TES, -ty * SEN_TES); c.fillStyle = col;
      for (let i = 0; i < sellos.length; i += 2) { const x = sellos[i], y = sellos[i + 1]; if (cab === 'cuadrado') c.fillRect(x - r, y - r, r * 2, r * 2); else { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); } }
      c.restore();
    }
  }
}
const senueloCoste = (dist, r) => dist * r * 0.05 + 0.12;

// ---------- pintar desde el taller (x, y ya son del mundo) ----------
function senueloAbajo(id, x, y) {
  const yo = J.yo; if (!yo || !senueloDentro(yo, x, y)) { pista(tr('Ahí no llegas: acércate'), 1.6); play('deny'); return; }
  if (yo.tinta <= 0) { pista(tr('Sin tinta'), 1.6); play('deny'); return; }
  SEN.pinta = { id, x, y }; senueloPunto(yo, x, y, x, y);
}
function senueloMueve(x, y) {
  const p = SEN.pinta, yo = J.yo; if (!p || !yo) return;
  if (yo.tinta <= 0 || !senueloDentro(yo, x, y)) return;
  senueloPunto(yo, p.x, p.y, x, y); p.x = x; p.y = y;
}
function senueloArriba() { SEN.pinta = null; senueloFlush(); refrescaTinta(); }
const senueloDentro = (yo, x, y) => lejos(yo.x, yo.y - 20, x, y) <= alcanceSen(yo);      // (con el señuelo pintado de los talentos, más lejos)
function senueloPunto(yo, x0, y0, x1, y1) {
  const coste = senueloCoste(Math.hypot(x1 - x0, y1 - y0), TALLER.radio); if (coste > yo.tinta) { yo.tinta = 0; refrescaTinta(); return; }
  yo.tinta -= coste; senueloTraza(x0, y0, x1, y1, TALLER.radio, TALLER.color, TALLER.cabezal);
  SEN.pend.push([Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), TALLER.radio, TALLER.color, TALLER.cabezal === 'cuadrado' ? 1 : 0]);
  if (Math.random() < 0.05) play('pincel'); refrescaTinta();
}
// los trazos que faltan por contar a los demás (cada medio segundo y al soltar)
function senueloFlush() {
  if (!SEN.pend.length) return;
  const l = SEN.pend.splice(0, 80);
  if (J.pvp && RFP.activo && !RFP.vuelta) rfpManda({ t: 'sz', l });
  if (SEN.pend.length) senueloFlush();
}
function senueloPaso(dt) { SEN.tPend -= dt; if (SEN.tPend <= 0) { SEN.tPend = 0.5; senueloFlush(); } }
// trazos que llegan de otro jugador (se comprueba que sean números, colores y pocos)
function senueloRecibe(l) {
  if (!Array.isArray(l)) return;
  for (const s of l.slice(0, 80)) {
    if (!Array.isArray(s) || s.length < 7 || s.slice(0, 5).some(n => typeof n !== 'number' || !isFinite(n)) || !/^#[0-9a-f]{6}$/i.test(s[5])) continue;
    senueloTraza(s[0], s[1], s[2], s[3], limita(s[4], 0.5, 9), s[5], s[6] ? 'cuadrado' : 'redondo');
  }
}

// ---------- verlos (sobre el suelo, por debajo de los personajes) ----------
// solo las teselas que se ven
function pintaSenuelos(c) {
  if (!SEN.teselas.size || !SEN.puntos.length) return;
  const x0 = -CAM.ox / CAM.esc, y0 = -CAM.oy / CAM.esc, x1 = (cv.width - CAM.ox) / CAM.esc, y1 = (cv.height - CAM.oy) / CAM.esc;
  for (const t of SEN.teselas.values()) {
    const wx = t.tx * SEN_TES_W, wy = t.ty * SEN_TES_W;
    if (wx < x1 && wx + SEN_TES_W > x0 && wy < y1 && wy + SEN_TES_W > y0) c.drawImage(t.cv, wx, wy, SEN_TES_W, SEN_TES_W);
  }
}

// ---------- los becarios de la máquina pican: un garabato a la vista les resulta sospechoso ----------
function senueloGarabato(e) {
  const b = e.bot;
  for (const p of SEN.puntos) {
    if (p.bots.has(e) || lejos(e.x, e.y, p.x, p.y) < 60 || !veCazador(e, p.x, p.y - 4)) continue;
    for (const q of SEN.puntos) if (lejos(p.x, p.y, q.x, q.y) < 70) q.bots.add(e);      // el que ha mirado ese garabato no vuelve a picar con él
    if (Math.random() > 0.65) return null;
    return { senuelo: true, x: p.x, y: p.y, hielo: 1, nombre: tr('un garabato') };
  }
  return null;
}
