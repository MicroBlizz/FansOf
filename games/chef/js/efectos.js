// Fans of Chef · EFECTOS: chispas, números que suben, el temblor de la cámara y los avisos del centro de la pantalla.
'use strict';

const FX = { part: [], nums: [], temblor: 0, avisos: [] };

function chispas(x, y, color, n = 6, fuerza = 40) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, 6.283), v = rand(fuerza * 0.4, fuerza);
    FX.part.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, t: rand(0.3, 0.6), color, tam: rand(1, 2.6) });
  }
}
function numero(x, y, txt, color = PALETA.W) { FX.nums.push({ x, y, txt, color, t: 0.8 }); }
function tiembla(f = 1) { FX.temblor = Math.max(FX.temblor, f); }
function aviso(txt, seg = 2, color = PALETA.Y) { FX.avisos.push({ txt, t: seg, color }); }

function avanzaEfectos(dt) {
  for (const p of FX.part) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 90 * dt; p.t -= dt; }
  FX.part = FX.part.filter(p => p.t > 0);
  for (const n of FX.nums) { n.y -= 18 * dt; n.t -= dt; }
  FX.nums = FX.nums.filter(n => n.t > 0);
  FX.temblor = Math.max(0, FX.temblor - dt * 3);
  for (const a of FX.avisos) a.t -= dt;
  FX.avisos = FX.avisos.filter(a => a.t > 0);
}
function pintaParticulas(ctx, cam) { for (const p of FX.part) caja(ctx, p.x - cam.x, p.y - cam.y, p.tam, p.tam, p.color); }
function pintaNumeros(ctx, cam) { for (const n of FX.nums) letra(ctx, n.txt, n.x - cam.x, n.y - cam.y, n.color, 'center', 8); }
function pintaAvisos(ctx, W, H) {
  let y = Math.round(H * 0.3);
  for (const a of FX.avisos.slice(-2)) { ctx.globalAlpha = Math.min(1, a.t * 2); letraCabe(ctx, a.txt, W / 2, y, W - 16, a.color, 'center', 8); y += 14; }
  ctx.globalAlpha = 1;
}
