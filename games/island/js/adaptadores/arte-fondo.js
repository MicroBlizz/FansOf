// Fans of Island · adaptadores/arte-fondo: ARTE DEL FONDO (dibujos planos, sin lonchas): el cielo en degradado tramado, las nubes, el sol, el barco,
// el pececito que salta y las islas lejanas con palmeras. Cuelgan de IS.arte; cielo(ctx, h) necesita el contexto para crear su patrón.
'use strict';
{
const { plano } = IS.Lonchas;
const CIELO = new Map(), BAYER = [[0, 2], [3, 1]];
function cielo(ctx, h) {   // patrón del cielo para una altura h (se guarda: solo cambia al girar el móvil)
  if (CIELO.has(h)) return CIELO.get(h);
  const A = [0x3f, 0xa9, 0xe6], B = [0xc8, 0xee, 0xf9], N = 12;
  const tono = i => '#' + A.map((a, k) => Math.round(a + (B[k] - a) * i / N).toString(16).padStart(2, '0')).join('');
  const c = plano(4, Math.max(1, h), (x, y) => {
    const t = y / Math.max(1, h) * N, i = Math.floor(t), f = t - i;
    return tono(Math.min(N, i + (f * 4 > BAYER[y % 2][x % 2] + 0.5 ? 1 : 0)));
  });
  const r = ctx.createPattern(c, 'repeat-x');
  CIELO.set(h, r); return r;
}
const NUBE = plano(56, 20, (x, y) => {
  for (const [bx, by, r] of [[14, 13, 7], [26, 9, 9], [39, 12, 8], [48, 14, 6]]) {
    const dx = x + 0.5 - bx, dy = y + 0.5 - by;
    if (dx * dx + dy * dy <= r * r) return y > 15 ? '#d6f0fb' : '#ffffff';
  }
  return null;
});
const SOL = plano(40, 40, (x, y) => {
  const r = Math.hypot(x + 0.5 - 20, y + 0.5 - 20);
  if (r < 11) return r < 8 ? '#fffbe0' : '#fff2a8';
  if (r < 14 && ((x + y) & 1)) return '#ffe9a0';
  return null;
});
function barcoCasco(x, y) {
  const m = y - 18;
  if (x < 2 + m || x > 23 - m) return null;
  return y === 18 ? '#e0aa78' : (y === 21 ? '#5e3a1e' : '#a0683a');
}
const barcoMastil = (x, y) => (x === 12 && y >= 1 ? '#5e3a1e' : (barcoBandera(x, y) ? '#f04b53' : null));
const barcoBandera = (x, y) => y >= 1 && y <= 3 && x >= 13 && x <= 16 - (y === 2 ? 0 : 1);
function barcoVelas(x, y) {
  if (y >= 4 && y <= 17 && x >= 13 && x <= 13 + (y - 4) * 0.62) return (y % 4 === 0) ? '#ffd6c2' : '#fff6e0';
  if (y >= 7 && y <= 17 && x < 12 && x >= 11 - (y - 7) * 0.55) return '#ffc531';
  return null;
}
const BARCO = plano(26, 24, (x, y) => (y >= 18 ? barcoCasco(x, y) : (barcoMastil(x, y) || barcoVelas(x, y))));
const PECECITO = plano(8, 5, (x, y) => {
  const m = ['..o..oo.', '.ooo.oo.', 'oooooo..', '.ooo.oo.', '..o..oo.'][y][x];
  return m === 'o' ? (y < 2 ? '#ffb38a' : '#ff7a59') : null;
});
function palmeraLejos(x, yb) {
  for (const px of [44, 102]) {
    const tx = px + Math.round((yb - 22) * 0.15), top = 26 * Math.pow(Math.sin(Math.PI * px / 150), 0.7) + 12;
    if (yb > 20 && yb <= top && x === tx) return true;
    if (Math.abs(yb - top) <= 1 && Math.abs(x - tx) <= 5 - Math.abs(yb - top) * 2) return true;
  }
  return false;
}
const LEJOS = plano(150, 40, (x, y) => {
  const h = 26 * Math.pow(Math.sin(Math.PI * (x + 0.5) / 150), 0.7) + 3 * Math.sin(x * 0.13), yb = 40 - y;
  if (palmeraLejos(x, yb)) return '#2f7f72';
  if (yb > h) return null;
  if (yb <= 3) return '#e8d09a';
  return yb > h - 3 ? '#4fb39a' : '#3f9f8c';
});
Object.assign(IS.arte, { cielo, NUBE, SOL, BARCO, PECECITO, LEJOS });
}
