// Fans of Nova · Iconos de armas, módulos, capitanes y oficiales, dibujados en código (contorno grueso y colores de core).
// Provisionales: cuando lleguen los de arte final (docs/nova/encargo-iconos.md) se cargan como PNG y estos quedan de reserva.
'use strict';
const NV_TINTA = '#1a0f2e';
// Cada dibujo ocupa un cuadro de 64×64; `col` es el color de acento (la carga del arma, la facción...).
const NV_ICONOS = {
  arma: {
    railgun: (c, col) => { nvIcPoli(c, [[10, 40], [44, 12], [50, 18], [16, 46]], '#aab0e0'); nvIcPoli(c, [[20, 50], [54, 22], [58, 28], [26, 56]], '#7b82c8'); nvIcCirculo(c, 53, 15, 6, col); },
    flak: (c, col) => { for (const a of [-0.5, 0, 0.5]) { c.save(); c.translate(32, 54); c.rotate(a); nvIcRect(c, -5, -34, 10, 34, '#aab0e0'); nvIcCirculo(c, 0, -36, 4, col); c.restore(); } nvIcCirculo(c, 32, 54, 9, '#7b82c8'); },
    laser: (c, col) => { nvIcRect(c, 6, 22, 22, 20, '#7b82c8'); nvIcCirculo(c, 28, 32, 6, col); c.strokeStyle = col; c.lineWidth = 5; c.beginPath(); c.moveTo(34, 32); c.lineTo(60, 32); c.stroke(); c.lineWidth = 2; c.strokeStyle = '#fff'; c.beginPath(); c.moveTo(34, 32); c.lineTo(60, 32); c.stroke(); },
    lanzador: (c, col) => { c.save(); c.translate(32, 32); c.rotate(-0.78); nvIcPoli(c, [[-22, -7], [10, -7], [24, 0], [10, 7], [-22, 7]], '#d8dcf5'); nvIcPoli(c, [[-22, -7], [-30, -15], [-14, -7]], col); nvIcPoli(c, [[-22, 7], [-30, 15], [-14, 7]], col); nvIcCirculo(c, 6, 0, 4, col); c.restore(); },
    drones: (c, col) => { nvIcCirculo(c, 32, 32, 10, '#7b82c8'); nvIcCirculo(c, 32, 32, 4, col); for (const [x, y] of [[12, 12], [52, 12], [12, 52], [52, 52]]) { c.beginPath(); c.moveTo(32, 32); c.lineTo(x, y); c.lineWidth = 3; c.strokeStyle = NV_TINTA; c.stroke(); nvIcCirculo(c, x, y, 8, '#aab0e0'); } }
  },
  sis: {
    dano: c => nvIcPoli(c, nvIcEstrella(32, 32, 28, 12, 8), '#ff9a3c'),
    cadencia: c => { for (const x of [8, 24, 40]) nvIcPoli(c, [[x, 12], [x + 14, 32], [x, 52], [x + 8, 32]], '#ffd93d'); },
    robo: c => { c.beginPath(); c.moveTo(32, 6); c.bezierCurveTo(56, 30, 52, 56, 32, 56); c.bezierCurveTo(12, 56, 8, 30, 32, 6); nvIcRelleno(c, '#ff5b5b'); nvIcRect(c, 29, 28, 6, 18, '#fff'); nvIcRect(c, 23, 34, 18, 6, '#fff'); },
    casco: c => { nvIcPoli(c, nvIcEstrella(32, 32, 28, 28, 6, 0), '#9aa3d8'); nvIcPoli(c, nvIcEstrella(32, 32, 16, 16, 6, 0), '#5a63a8'); },
    regen: c => { nvIcCirculo(c, 32, 32, 22, '#5be36b'); nvIcRect(c, 28, 16, 8, 32, '#fff'); nvIcRect(c, 16, 28, 32, 8, '#fff'); },
    vel: c => { nvIcPoli(c, [[6, 24], [38, 24], [38, 12], [60, 32], [38, 52], [38, 40], [6, 40]], '#6fc4ff'); },
    iman: c => { c.lineWidth = 14; c.strokeStyle = NV_TINTA; c.beginPath(); c.arc(32, 34, 18, Math.PI, 0); c.lineTo(50, 52); c.moveTo(14, 34); c.lineTo(14, 52); c.stroke(); c.lineWidth = 8; c.strokeStyle = '#ff5b5b'; c.beginPath(); c.arc(32, 34, 18, Math.PI, 0); c.lineTo(50, 52); c.moveTo(14, 34); c.lineTo(14, 52); c.stroke(); nvIcRect(c, 8, 50, 12, 8, '#fff'); nvIcRect(c, 44, 50, 12, 8, '#fff'); },
    escudo: c => { nvIcCirculo(c, 32, 32, 26, 'rgba(74,168,255,.45)'); c.lineWidth = 3; c.strokeStyle = '#a8dcff'; c.beginPath(); c.arc(32, 32, 18, 0.6, 2.4); c.stroke(); },
    blindaje: c => { nvIcPoli(c, [[32, 6], [56, 14], [52, 42], [32, 58], [12, 42], [8, 14]], '#ff9a3c'); nvIcCirculo(c, 32, 30, 6, '#fff'); },
    fusion: c => { nvIcCirculo(c, 24, 32, 16, '#6fc4ff'); nvIcCirculo(c, 40, 32, 16, '#ff9a3c'); },
    mejora: c => { nvIcPoli(c, [[32, 6], [54, 32], [40, 32], [40, 58], [24, 58], [24, 32], [10, 32]], '#5be36b'); }
  },
  fac: {   // facetas de oficial
    fuego: c => { nvIcCirculo(c, 32, 32, 22, 'rgba(0,0,0,0)'); c.lineWidth = 4; c.strokeStyle = '#ff5b5b'; c.beginPath(); c.arc(32, 32, 20, 0, 6.283); c.moveTo(32, 4); c.lineTo(32, 20); c.moveTo(32, 44); c.lineTo(32, 60); c.moveTo(4, 32); c.lineTo(20, 32); c.moveTo(44, 32); c.lineTo(60, 32); c.stroke(); nvIcCirculo(c, 32, 32, 6, '#ffd93d'); },
    defensa: c => nvIcPoli(c, [[32, 4], [56, 14], [52, 42], [32, 60], [12, 42], [8, 14]], '#6fa8ff'),
    ingenieria: c => { nvIcPoli(c, nvIcEstrella(32, 32, 26, 20, 8, 0), '#aab0e0'); nvIcCirculo(c, 32, 32, 9, '#1a1f4a'); },
    tacticas: c => { nvIcRect(c, 14, 6, 6, 52, '#d8dcf5'); nvIcPoli(c, [[20, 8], [56, 18], [20, 32]], '#b46bff'); },
    navegacion: c => { nvIcCirculo(c, 32, 32, 26, '#2a2f5e'); nvIcPoli(c, [[32, 8], [40, 32], [32, 56], [24, 32]], '#ffd93d'); nvIcPoli(c, [[32, 8], [40, 32], [24, 32]], '#ff5b5b'); }
  },
  cap: {   // retratos provisionales: insignia con silueta y un rasgo propio
    progamer: (c, col) => { nvIcRetrato(c, col); c.lineWidth = 5; c.strokeStyle = NV_TINTA; c.beginPath(); c.arc(32, 22, 17, Math.PI, 0); c.stroke(); nvIcRect(c, 10, 22, 8, 12, '#6fc4ff'); nvIcRect(c, 46, 22, 8, 12, '#6fc4ff'); },
    bunny: (c, col) => { nvIcRetrato(c, col); nvIcElipse(c, 24, 6, 5, 14, '#fff'); nvIcElipse(c, 40, 6, 5, 14, '#fff'); },
    necrolord: (c, col) => { nvIcRetrato(c, col); nvIcPoli(c, [[14, 24], [32, 2], [50, 24], [44, 28], [20, 28]], '#2a1a4a'); nvIcCirculo(c, 26, 28, 3, '#9bff8a'); nvIcCirculo(c, 38, 28, 3, '#9bff8a'); },
    twitchking: (c, col) => { nvIcRetrato(c, col); nvIcPoli(c, [[16, 20], [20, 4], [26, 14], [32, 2], [38, 14], [44, 4], [48, 20]], '#ffd93d'); },
    epicchampion: (c, col) => { nvIcRetrato(c, col); nvIcPoli(c, [[16, 26], [18, 12], [46, 12], [48, 26]], '#c8ccdd'); nvIcPoli(c, [[32, 12], [28, -2], [40, 2], [36, 12]], '#ff5b5b'); }
  }
};
function nvIcRelleno(c, col) { c.fillStyle = col; c.fill(); c.lineWidth = 3; c.lineJoin = 'round'; c.strokeStyle = NV_TINTA; c.stroke(); }
function nvIcPoli(c, pts, col) { c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](p[0], p[1])); c.closePath(); nvIcRelleno(c, col); }
function nvIcRect(c, x, y, w, h, col) { c.beginPath(); c.rect(x, y, w, h); nvIcRelleno(c, col); }
function nvIcCirculo(c, x, y, r, col) { c.beginPath(); c.arc(x, y, r, 0, 6.283); nvIcRelleno(c, col); }
function nvIcElipse(c, x, y, rx, ry, col) { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 6.283); nvIcRelleno(c, col); }
function nvIcEstrella(x, y, R, r, n, giro) { const o = []; for (let i = 0; i < n * 2; i++) { const a = (giro === undefined ? -1.5708 : giro) + i * Math.PI / n, q = i % 2 ? r : R; o.push([x + Math.cos(a) * q, y + Math.sin(a) * q]); } return o; }
function nvIcRetrato(c, col) { nvIcCirculo(c, 32, 32, 29, col); nvIcCirculo(c, 32, 26, 12, '#f1d2b0'); nvIcPoli(c, [[10, 58], [16, 44], [48, 44], [54, 58]], '#26306a'); }

// Un lienzo de `tam` px con el icono (grupo: arma | sis | fac | cap). Si el icono no existe, queda un círculo del color.
function nvIcono(grupo, clave, col, tam) {
  const cv = document.createElement('canvas'), d = (tam || 52) * 2; cv.width = cv.height = d;
  const c = cv.getContext('2d'), f = NV_ICONOS[grupo] && NV_ICONOS[grupo][clave];
  c.scale(d / 64, d / 64);
  if (f) f(c, col || '#ffd93d'); else nvIcCirculo(c, 32, 32, 24, col || '#ffd93d');
  cv.style.width = cv.style.height = (tam || 52) + 'px';
  return cv;
}
// Pone el icono a la izquierda de un botón/tarjeta y deja el texto en columna a su lado.
function nvConIcono(b, grupo, clave, col, tam) {
  const t = document.createElement('div'); t.className = 'nv-ntxt';
  while (b.firstChild) t.appendChild(b.firstChild);
  b.classList.add('nv-cic'); b.appendChild(nvIcono(grupo, clave, col, tam)); b.appendChild(t);
}
