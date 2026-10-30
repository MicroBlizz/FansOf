// Fans of Island · FÍSICA: cajas que se mueven contra plataformas. Las de plastelina son sólidas por los cuatro lados; las de hilo solo
// sostienen por arriba (se atraviesan desde abajo). Las plataformas móviles arrastran a quien va encima (dx, dy del fotograma).
'use strict';
const isSolapa = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function isMueve(c, plataformas, dt) {
  if (c.plataforma) { c.x += c.plataforma.dx; c.y += c.plataforma.dy; }
  c.x += c.vx * dt;
  for (const p of plataformas) if (p.solida && isSolapa(c, p)) {
    if (c.vx > 0) c.x = p.x - c.w; else if (c.vx < 0) c.x = p.x + p.w;
    c.vx = 0;
  }
  const piesAntes = c.y + c.h;
  c.y += c.vy * dt;
  const estaba = c.suelo; c.suelo = false; c.plataforma = null;
  for (const p of plataformas) if (isSolapa(c, p)) {
    if (c.vy >= 0 && (p.solida || piesAntes <= p.y - p.dy + 2)) { c.y = p.y - c.h; c.vy = 0; c.suelo = true; c.plataforma = p.mov ? p : null; }
    else if (c.vy < 0 && p.solida) { c.y = p.y + p.h; c.vy = 0; }
  }
  return !estaba && c.suelo;   // true justo al aterrizar
}
function isSueloBajo(x, y, plataformas, hasta = 4) {   // ¿hay dónde pisar justo debajo de ese punto?
  for (const p of plataformas) if (x >= p.x && x <= p.x + p.w && y <= p.y + 1 && y + hasta >= p.y) return p;
  return null;
}
function isMuroDelante(c, dir, plataformas, alcance = 28) {   // ¿hay un bloque sólido delante a la altura del cuerpo?
  const x = dir > 0 ? c.x + c.w + alcance : c.x - alcance;
  for (const p of plataformas) if (p.solida && x >= p.x && x <= p.x + p.w && c.y + c.h - 5 > p.y && c.y + 5 < p.y + p.h) return p;
  return null;
}
