// Fans of Rouflage · EL ARMARIO EN LA PARTIDA (tanda 2; la 1 está en armario.js: cuerpo, humo y fantasma). Lo que llevas puesto (ropaPartida/vistePartida)
// se ve también en: el rastro del silbido, el efecto al congelarte (1 s; los becarios no lo ven, para no delatar a nadie), el sello que deja el becario al
// despedir, el borde y el tono de la linterna, el marco y el título en la clasificación y los GESTOS (botón GESTO o tecla G: en la sala de espera de los
// becarios o de fantasma). En el PvP todo sale de lo que cada uno manda en su aviso `rp`; el gesto viaja en un aviso `gs`. De momento solo en la alfa.
'use strict';

const GESTO = { dura: 2.6, espera: 4, t: 0 };

// ---------- el rastro del silbido: unos cuantos dibujos del armario que suben desde donde se silba ----------
function fxRastro(x, y, e) {
  const tipo = e && e.ropa && e.ropa.silbido; if (!tipo || tipo === 'ondas') return;
  FX.lista.push({ k: 'rastro', x, y, tipo, t: 0, dur: 1.6 });
}
function pintaRastroFx(c, f, p) {
  if (extraOn('apagon')) return;      // Apagón total: solo se oye
  for (let k = 0; k < 3; k++) {
    const q = p * 1.4 - k * 0.2; if (q <= 0 || q >= 1) continue;
    const a = k * 2.1 + 0.6, d = 18 + q * 40, w = 30;
    c.save(); c.globalAlpha = (1 - q) * 0.95; c.translate(f.x + Math.cos(a) * d - w / 2, f.y - q * 46 + Math.sin(a) * d * 0.4 - w / 2);
    ARD.rastro(c, w, f.tipo); c.restore();
  }
}

// ---------- el efecto al congelarte: un segundo y nada más. Lo ven tú y los tuyos; los becarios, no ----------
function fxCongelar(e) {
  const tipo = e && e.ropa && e.ropa.congelar; if (!tipo || tipo === 'nada' || e.clase !== 'camaleon') return;
  if (J.yo && J.yo.clase === 'cazador' && e !== J.yo) return;
  FX.lista.push({ k: 'congela', x: e.x, y: e.y - 30, tipo, t: 0, dur: 1 });
}
function pintaCongelarFx(c, f, p) {
  const x = f.x, y = f.y, a = 1 - p;
  c.save(); c.globalAlpha = a;
  if (f.tipo === 'destello') for (let k = 0; k < 8; k++) { const g = k / 8 * TAU, r0 = 18 + p * 10, r1 = 34 + p * 26; raya(c, [x + Math.cos(g) * r0, y + Math.sin(g) * r0, x + Math.cos(g) * r1, y + Math.sin(g) * r1], '#ffffff', 2.6); }
  else if (f.tipo === 'escarcha') for (const [dx, dy] of [[-14, -14], [16, -2], [-6, 20]]) for (let k = 0; k < 3; k++) { const g = k * Math.PI / 3, r = 6 + p * 3; raya(c, [x + dx - Math.cos(g) * r, y + dy - Math.sin(g) * r, x + dx + Math.cos(g) * r, y + dy + Math.sin(g) * r], '#8fe3ff', 2.2); }
  else if (f.tipo === 'pegatina') { c.beginPath(); c.moveTo(x + 8, y - 22); c.lineTo(x + 22, y - 22); c.lineTo(x + 8, y - 8); c.closePath(); c.fillStyle = '#e0dbe8'; c.fill(); c.lineWidth = 1.6; c.strokeStyle = OL; c.stroke(); }
  else if (f.tipo === 'confeti') for (let k = 0; k < 18; k++) { c.save(); c.translate(x - 28 + (k * 37) % 56, y - 34 + (k * 53) % 50 + p * 26); c.rotate(k + p * 4); c.fillStyle = ['#ff4b5c', '#ffcb3d', '#7ee04a', '#39d5e8'][k % 4]; c.fillRect(-3, -1.5, 6, 3); c.restore(); }
  else if (f.tipo === 'flash') { c.globalAlpha = a * 0.6; punto(c, x, y, 30 + p * 14, '#ffffff'); }
  else if (f.tipo === 'tinta') for (let k = 0; k < 7; k++) punto(c, x - 20 + (k * 41) % 40, y - 26 + (k * 29) % 52, 3 + (k % 3) * 2, 'rgba(57,40,94,0.75)');
  c.restore();
}

// ---------- el sello del becario: el del armario en el suelo, en vez del tampón rojo de siempre ----------
function pintaSelloArmario(c, s) {
  const e = s.t < 0.16 ? 2.3 - (s.t / 0.16) * 1.3 : 1, w = 84;
  c.save(); c.translate(s.x, s.y); c.rotate(s.rot + 0.18); c.scale(e, e); c.globalAlpha = Math.min(1, s.t / 0.06) * 0.92; c.translate(-w / 2, -w / 2);
  ARD.sello(c, w, s.tipo); c.restore();
}

// ---------- la clasificación: marco (un borde de su color) y título bajo el nombre ----------
const marcoColor = id => (id && ARD.COLOR_MARCO[id]) || '';
function tituloHtml(t) { return t ? `<small class="titulo-ar" style="color:${t.color}">${esc(tr(t.texto))}</small>` : ''; }

// ---------- los gestos: un bocadillo con tu galleta haciendo el gesto, encima de ti ----------
const gestoPuede = () => { const yo = J.yo; return !!(yo && yo.ropa && yo.ropa.gesto) && !J.pausa && yo.clase === 'cazador' && (J.fase === 'prep' || J.fase === 'cuenta'); };
function accionGesto() {
  if (!gestoPuede() || RELOJ < GESTO.t) return;
  const yo = J.yo; GESTO.t = RELOJ + GESTO.espera;
  yo.gesto = { tipo: yo.ropa.gesto, hasta: RELOJ + GESTO.dura }; play('pop');
  if (J.pvp) rfpManda({ t: 'gs', g: yo.ropa.gesto });
}
function rfpGestoRecibido(sl, m) {
  const e = sl.ente; if (!e || e.fuera || typeof m.g !== 'string' || !arItem('gestos', m.g)) return;
  e.gesto = { tipo: m.g, hasta: RELOJ + GESTO.dura };
}
function pintaBocadillo(c, x, y, tipo, t) {
  const w = 58, s = 1 + Math.max(0, 1 - t * 6) * 0.25;
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); rrPathRF(c, -w / 2 - 4, -w - 8, w + 8, w + 8, 12); c.moveTo(-6, 0); c.lineTo(0, 9); c.lineTo(6, 0);
  c.fillStyle = '#fff6ea'; c.fill(); c.lineWidth = 3; c.strokeStyle = OL; c.stroke();
  c.translate(-w / 2, -w - 4); ARD.gesto(c, w, tipo); c.restore();
}
function pintaGestos(c) {
  for (const e of J.entes) {
    if (!e.gesto) continue;
    if (e.gesto.hasta < RELOJ || e.fuera) { e.gesto = null; continue; }
    pintaBocadillo(c, e.x, e.y - 104, e.gesto.tipo, GESTO.dura - (e.gesto.hasta - RELOJ));
  }
}
