// Fans of Rumble: Tácticas · MAQUETA (capas): monta lo que se pinta una vez por mundo (el decorado ampliado con el desenfoque de
// maqueta y el resplandor, los rayos de luz, lo de delante de la cámara y la viñeta) y el polvo que flota en cada fotograma.
'use strict';
const MAQ = { id: null, def: null, fondo: null, rayos: null, delante: null, viñeta: null, polvo: [] };
const PIXELES = {};   // el decorado en píxeles de cada mundo (pequeño: se guarda)

function fondoMaqueta(def, tipo, n) {
  const pix = PIXELES[tipo] || (PIXELES[tipo] = def.pinta());
  const nitido = ampliar(pix, n), s = n / 2;
  const out = lienzo(nitido.width, nitido.height), x = out.getContext('2d'); x.drawImage(nitido, 0, 0);
  // profundidad de campo: lo de arriba (lejos) borroso; el suelo donde se pelea, nítido
  conMascara(out, desenfocar(nitido, 1.5 * s), [[0, 1], [0.16, 0.9], [0.28, 0.5], [0.4, 0], [0.8, 0], [1, 0.7]]);
  conMascara(out, desenfocar(nitido, 3.6 * s), [[0, 1], [0.12, 0.85], [0.25, 0]]);
  // resplandor: solo lo más brillante (ventanas, luna, focos, oro) se desenfoca mucho y se suma
  const luz = lienzo(nitido.width / 2, nitido.height / 2), lx = luz.getContext('2d');
  lx.drawImage(nitido, 0, 0, luz.width, luz.height); lx.globalCompositeOperation = 'multiply'; lx.drawImage(luz, 0, 0); lx.drawImage(luz, 0, 0);
  x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.6; x.drawImage(desenfocar(luz, 7 * s), 0, 0, out.width, out.height); x.globalAlpha = 1;
  // el color del ambiente
  x.globalCompositeOperation = 'soft-light';
  const g = x.createLinearGradient(0, 0, 0, out.height); for (const [y, c] of def.tinte) g.addColorStop(y, c);
  x.fillStyle = g; x.fillRect(0, 0, out.width, out.height);
  return out;
}
// una capa de 540 × 960 lógicos pintada a la mitad (lo borroso no necesita más) y desenfocada
function capaSuave(dibujo, borroso) {
  const c = lienzo(PW, PH), x = c.getContext('2d'); x.scale(0.5, 0.5); x.globalCompositeOperation = 'lighter';
  dibujo(x); return desenfocar(c, borroso);
}
function capaDelante(dibujo) { const c = lienzo(PW, PH), x = c.getContext('2d'); x.scale(0.5, 0.5); dibujo(x); return desenfocar(c, 3.5); }
function capaViñeta() {
  const c = lienzo(540, 960), x = c.getContext('2d');
  const g = x.createRadialGradient(270, 470, 260, 270, 470, 640); g.addColorStop(0, 'rgba(16,6,26,0)'); g.addColorStop(1, 'rgba(16,6,26,.62)');
  x.fillStyle = g; x.fillRect(0, 0, 540, 960);
  const a = x.createLinearGradient(0, 600, 0, 960); a.addColorStop(0, 'rgba(12,5,20,0)'); a.addColorStop(0.3, 'rgba(12,5,20,.5)'); a.addColorStop(1, 'rgba(12,5,20,.78)');
  x.fillStyle = a; x.fillRect(0, 600, 540, 360);
  const b = x.createLinearGradient(0, 0, 0, 110); b.addColorStop(0, 'rgba(12,5,20,.45)'); b.addColorStop(1, 'rgba(12,5,20,0)');
  x.fillStyle = b; x.fillRect(0, 0, 540, 110);
  return c;
}
// prepara (si hace falta) las capas del mundo `tipo` para un lienzo de n píxeles por píxel del decorado
function prepararMaqueta(tipo, n) {
  const id = tipo + n; if (MAQ.id === id) return MAQ;
  const def = MUNDOS_MAQUETA[tipo] || MUNDOS_MAQUETA.sede;
  if (!MAQ.def || MAQ.tipo !== tipo) {
    MAQ.rayos = capaSuave(def.rayos, 1.5); MAQ.delante = capaDelante(def.delante);
    MAQ.polvo = Array.from({ length: 46 }, () => motaNueva(def));
  }
  MAQ.viñeta = MAQ.viñeta || capaViñeta();
  MAQ.fondo = null; MAQ.fondo = fondoMaqueta(def, tipo, n);   // primero se suelta el anterior (ocupa memoria)
  Object.assign(MAQ, { id, def, tipo });
  return MAQ;
}
function motaNueva(def) {
  const [x, y] = def.mota(), col = Array.isArray(def.colMota) ? pick(def.colMota) : def.colMota;
  return { x, y, vy: rand(5, 14), f: rand(0.4, 1.1), s: rand(0, 6), a: rand(0.3, 0.9), tw: rand(1, 3), col, r: def.motaGrande ? rand(2, 4) : 2 };
}
function avanzaPolvo(dt, t) {
  for (const m of MAQ.polvo) { m.y -= m.vy * dt; m.x += Math.sin(t * m.f + m.s) * 6 * dt; if (m.y < 70) Object.assign(m, motaNueva(MAQ.def), { y: rand(560, 650) }); }
}
function pintaPolvo(c, t) {
  for (const m of MAQ.polvo) {
    const a = m.a * (0.55 + 0.45 * Math.sin(t * m.tw + m.s));
    if (m.r > 2) pintaBrillo(c, m.col, m.x, m.y, m.r * 4, a * 0.6);
    c.globalAlpha = a; c.fillStyle = m.col; c.fillRect(Math.round(m.x / 2) * 2, Math.round(m.y / 2) * 2, 2, 2);
  }
  c.globalAlpha = 1;
}
