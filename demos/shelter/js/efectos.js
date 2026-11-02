// Fans of Shelter · EFECTOS: chispas de píxel, números que suben (daño y recursos), temblor de pantalla y avisos flotantes.
'use strict';

const FX = { part: [], nums: [], temblor: 0, avisos: [] };

function chispas(x, y, color, n = 6, fuerza = 40) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = rand(fuerza * 0.4, fuerza);
    FX.part.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, t: rand(0.25, 0.5), color });
  }
}
// un número (o texto corto) que sube desde (x, y)
function numero(x, y, txt, color = PALETA.W) { FX.nums.push({ x, y, txt, color, t: 0.8 }); }
function tiembla(f = 1) { FX.temblor = Math.max(FX.temblor, f); }
// un aviso grande en medio de la pantalla («¡CAE LA NOCHE!»)
function aviso(txt, seg = 2, color = PALETA.Y) { FX.avisos.push({ txt, t: seg, color }); }

function avanzaEfectos(dt) {
  for (const p of FX.part) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 120 * dt; p.t -= dt; }
  FX.part = FX.part.filter(p => p.t > 0);
  for (const n of FX.nums) { n.y -= 18 * dt; n.t -= dt; }
  FX.nums = FX.nums.filter(n => n.t > 0);
  FX.temblor = Math.max(0, FX.temblor - dt * 4);
  for (const a of FX.avisos) a.t -= dt;
  FX.avisos = FX.avisos.filter(a => a.t > 0);
}
function pintaParticulas(ctx, cam) {
  for (const p of FX.part) caja(ctx, p.x - cam.x, p.y - cam.y, 1, 1, p.color);
}
function pintaNumeros(ctx, cam) {
  ctx.font = '8px "Press Start 2P", monospace'; ctx.textAlign = 'center';
  for (const n of FX.nums) {
    const x = Math.round(n.x - cam.x), y = Math.round(n.y - cam.y);
    ctx.fillStyle = PALETA.K; ctx.fillText(n.txt, x + 1, y + 1);
    ctx.fillStyle = n.color; ctx.fillText(n.txt, x, y);
  }
}
