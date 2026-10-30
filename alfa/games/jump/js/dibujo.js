// Fans of Jump · El pincel suave: óvalos, cajas redondeadas, formas y trazos con el contorno morado de la serie, la paleta
// pastel del juego (lavanda, melocotón, menta y oro) y la letra Baloo 2 con borde. Todo se dibuja en G, el lienzo de la
// pantalla, en medidas del mundo (unos 200 de ancho).
'use strict';

const OLC = '#3d2a5c';   // el contorno de todo
// la paleta pastel de los menús y el marcador
const PASTEL = {
  papel: '#fbf4ff', sombra: '#e4d6f4', texto: '#4a3070', suave: '#7a62a0', flojo: '#a99cc0', raya: '#e6def2', fondo: '#f1e8fb',
  melocoton: '#ffb38a', melocotonO: '#e0703e', menta: '#bff0dc', mentaO: '#4fb88e', lila: '#cdb6f7', lilaO: '#8a68d8', oro: '#ffd86a', oroO: '#c99316',
};
const LW = 1.1;          // su grosor
const FUENTE = '"Baloo 2", "Arial Rounded MT Bold", "Trebuchet MS", system-ui, sans-serif';
const FUENTE_LOGO = '"Luckiest Guy", "Baloo 2", system-ui, sans-serif';
let G = null;

function pinta(fill, stroke, lw) {
  if (fill) { G.fillStyle = fill; G.fill(); }
  if (stroke) { G.lineWidth = lw; G.strokeStyle = stroke; G.lineJoin = 'round'; G.stroke(); }
}
function elipse(x, y, rx, ry, fill, stroke = OLC, lw = LW, rot = 0) {
  G.beginPath(); G.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, Math.PI * 2); pinta(fill, stroke, lw);
}
function caja(x, y, w, h, r, fill, stroke = OLC, lw = LW) {
  G.beginPath(); G.roundRect(x, y, w, h, r); pinta(fill, stroke, lw);
}
function forma(p, fill, stroke = OLC, lw = LW) {
  G.beginPath(); G.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) G.lineTo(p[i], p[i + 1]); G.closePath(); pinta(fill, stroke, lw);
}
// forma de curvas suaves que pasa por los puntos (cerrada)
function blanda(p, fill, stroke = OLC, lw = LW) {
  const n = p.length / 2, P = i => [p[((i + n) % n) * 2], p[((i + n) % n) * 2 + 1]];
  G.beginPath();
  for (let i = 0; i < n; i++) {
    const [x0, y0] = P(i), [x1, y1] = P(i + 1), mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    if (i === 0) { const [xp, yp] = P(-1); G.moveTo((xp + x0) / 2, (yp + y0) / 2); }
    G.quadraticCurveTo(x0, y0, mx, my);
  }
  G.closePath(); pinta(fill, stroke, lw);
}
function trazo(x1, y1, x2, y2, w, color, borde = OLC) {
  G.lineCap = 'round';
  if (borde) { G.beginPath(); G.moveTo(x1, y1); G.lineTo(x2, y2); G.lineWidth = w + LW * 2; G.strokeStyle = borde; G.stroke(); }
  G.beginPath(); G.moveTo(x1, y1); G.lineTo(x2, y2); G.lineWidth = w; G.strokeStyle = color; G.stroke();
}
// texto con la letra redonda; o: { alin, borde (color), bw (grosor del borde), peso, logo, base }
// o.max: el ancho máximo; si el texto no cabe (por ejemplo, en inglés), se encoge hasta caber
function letras(s, x, y, size, color, o = {}) {
  G.font = `${o.peso || 800} ${size}px ${o.logo ? FUENTE_LOGO : FUENTE}`;
  if (o.max) { const a = G.measureText(s).width; if (a > o.max) { const k = o.max / a; size *= k; if (o.bw) o = { ...o, bw: o.bw * k }; G.font = `${o.peso || 800} ${size}px ${o.logo ? FUENTE_LOGO : FUENTE}`; } }
  G.textAlign = o.alin || 'center'; G.textBaseline = o.base || 'middle';
  if (o.borde) { G.lineJoin = 'round'; G.lineWidth = o.bw || size * 0.22; G.strokeStyle = o.borde; G.strokeText(s, x, y); }
  G.fillStyle = color; G.fillText(s, x, y);
}
function anchoLetras(s, size, o = {}) { G.font = `${o.peso || 800} ${size}px ${o.logo ? FUENTE_LOGO : FUENTE}`; return G.measureText(s).width; }
// una pastilla del marcador (crema, con su sombra de abajo)
function pastilla(x, y, w, h, fill = PASTEL.papel, sombra = PASTEL.sombra) {
  caja(x, y + 1.2, w, h, h / 2, OLC, null);
  caja(x, y, w, h, h / 2, fill);
  G.save(); G.beginPath(); G.roundRect(x, y, w, h, h / 2); G.clip();
  G.fillStyle = sombra; G.fillRect(x, y + h - 2.2, w, 2.2);
  G.restore();
  caja(x, y, w, h, h / 2, null);
}
// en un sitio, girado y a escala: dentro de fn se dibuja con el origen en (x, y)
function aqui(x, y, ang, sx, sy, fn) { G.save(); G.translate(x, y); if (ang) G.rotate(ang); if (sx !== 1 || sy !== 1) G.scale(sx, sy); fn(); G.restore(); }
// el color con volumen: un degradado redondo con la luz arriba a la izquierda y la sombra abajo a la derecha (aire 3D)
function tono(hex, f) {
  const n = parseInt(hex.slice(1, 7), 16), c = s => { const v = (n >> s) & 255; return Math.round(f > 0 ? v + (255 - v) * f : v * (1 + f)); };
  return `rgb(${c(16)},${c(8)},${c(0)})`;
}
function vol(x, y, rx, ry, base, sombra) {
  const r = Math.max(rx, ry), gr = G.createRadialGradient(x - rx * 0.35, y - ry * 0.45, r * 0.05, x, y, r * 1.15);
  gr.addColorStop(0, tono(base, 0.45)); gr.addColorStop(0.5, base); gr.addColorStop(1, sombra || tono(base, -0.25));
  return gr;
}
