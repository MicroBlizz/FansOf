// Fans Of · Gashapón animado: la máquina clásica (la de todas las máquinas que no traen otro estilo). Cúpula con bolas que se mueven de verdad (física),
// manivela y bombillas; al tirar, las bolas se revuelven y una cae por dentro (se ve por la ventanita) hasta la trampilla. Se dibuja en un espacio de 360 de ancho.
// Es un estilo de GACHA_FX (gachapon-anim.js): fases gira → compuerta → tubo → bandeja → fuera.
'use strict';
(() => {
  const { TAU, BOLAS, fs, cir, rec, texto, capsula, brillo, ease, easeIn, lerp, rnd, chispas } = GACHA_FX.util;
  const GX = 180, GY = 168, GR = 104;
  const COLORES = { ab: ['#e63946', '#b0213a', '#8a1f30'], eq: ['#2e6fd8', '#1d3f8a', '#173d8f'] };   // cuerpo, detalles, base (las máquinas de un juego traen las suyas: X.maquina)
  let bolas = null, manivela = 0;
  const nuevaBola = (x, y) => ({ x, y, vx: rnd(-40, 40), vy: 0, r: 14, col: BOLAS[Math.floor(rnd(0, 6))], rot: rnd(0, 6) });
  function fisica(dt) {
    const n = bolas.length;
    for (const b of bolas) {
      b.vy += 1000 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vx * dt * 0.05;
      const dx = b.x - GX, dy = b.y - GY, d = Math.hypot(dx, dy), lim = GR - b.r - 4;
      if (d > lim) { const nx = dx / d, ny = dy / d; b.x = GX + nx * lim; b.y = GY + ny * lim; const vn = b.vx * nx + b.vy * ny; if (vn > 0) { b.vx -= 1.45 * vn * nx; b.vy -= 1.45 * vn * ny; } b.vx *= 0.985; }
    }
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const a = bolas[i], b = bolas[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), m = a.r + b.r;
      if (d < m && d > 0.01) { const nx = dx / d, ny = dy / d, o = (m - d) / 2; a.x -= nx * o; a.y -= ny * o; b.x += nx * o; b.y += ny * o; const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny; if (rv < 0) { const im = -1.25 * rv / 2; a.vx -= im * nx; a.vy -= im * ny; b.vx += im * nx; b.vy += im * ny; } }
    }
  }
  GACHA_FX.estilo('clasica', {
    primera: 'gira', vista: { es: 0.74, dx: 16.8, dy: -28.9 }, salida: [180, 440],
    inicia() { if (!bolas) { bolas = []; for (let i = 0; i < 24; i++) bolas.push(nuevaBola(GX + rnd(-60, 60), 120 + rnd(0, 90))); } },
    acaba(S) { if (S.quitada) { bolas.push(nuevaBola(GX + rnd(-10, 10), 80)); S.quitada = false; } },   // la bola que salió vuelve a caer en la cúpula
    actualiza(dt, S) {
      for (let s = 0; s < 3; s++) fisica(dt / 3);
      if (!S) return;
      if (S.f === 'gira') {
        manivela += dt * 9; if (Math.floor(S.t / 0.2) !== S.clic) { S.clic = Math.floor(S.t / 0.2); play('gcrank'); }
        for (const b of bolas) if (Math.random() < 0.25) { b.vy -= rnd(500, 1100); b.vx += rnd(-420, 420); }
        if (S.aviso && S.t > 0.35 && Math.random() < 0.55) { const a = rnd(0, TAU), r = rnd(0, 80); chispas(GX + Math.cos(a) * r, GY + Math.sin(a) * r, 1, [S.aviso, '#fff6ea'], 40, 'estrella'); }
        if (S.t > 0.9) { let k = 0; bolas.forEach((b, i) => { if (b.y > bolas[k].y) k = i; }); const b = bolas.splice(k, 1)[0]; S.quitada = true; S.bx = b.x; S.by = b.y; S.f = 'compuerta'; S.t = 0; }
      } else if (S.f === 'compuerta') { if (S.t > 0.22) { S.f = 'tubo'; S.t = 0; play('clank'); } }
      else if (S.f === 'tubo') { if (S.t > 0.42) { S.f = 'bandeja'; S.t = 0; play('land'); } }
      else if (S.f === 'bandeja') { if (S.t > 0.32) { S.f = 'fuera'; S.llega(); } }
    },
    dibuja(c, X, tab, t, S) {
      const MC = X ? X.maquina : COLORES[tab] || COLORES.ab, nombre = X ? X.nombre : tab === 'eq' ? 'EQUIPO' : 'HABILIDADES';
      fs(c, cc => cc.ellipse(180, 506, 118, 12, 0, 0, TAU), 'rgba(0,0,0,.35)', 0);
      fs(c, rec(78, 468, 204, 32, 12), MC[2], 4);
      fs(c, rec(84, 276, 192, 200, 24), MC[0], 4); fs(c, rec(92, 286, 14, 180, 7), 'rgba(255,255,255,.16)', 0);
      fs(c, rec(104, 290, 152, 32, 11), OL, 0); texto(c, nombre, 180, 307, nombre.length > 10 ? 14 : 17, '#ffcb3d', 0);
      for (let i = 0; i < 9; i++) {   // bombillas: despacio en reposo, deprisa al tirar; con aviso dorado se encienden todas
        const x = 100 + i * 20, on = S && S.f === 'gira' ? (Math.floor(t * 16) + i) % 3 === 0 : (Math.floor(t * 3) + i) % 3 === 0, oro = S && S.aviso === '#ffcb3d' && S.f === 'gira' && S.t > 0.5;
        fs(c, cir(x, 333, 4.5), oro ? '#ffcb3d' : on ? '#fff6a8' : 'rgba(0,0,0,.28)', 2); if (on || oro) brillo(c, x, 333, 12, oro ? '#ffcb3d' : '#fff6a8', 0.5);
      }
      fs(c, rec(102, 350, 42, 62, 11), MC[1], 3.5); fs(c, rec(118, 360, 10, 30, 4), OL, 0);
      c.save(); c.translate(238, 380); fs(c, cir(0, 0, 25), '#ffcb3d', 4); c.rotate(manivela); fs(c, rec(-21, -6, 42, 12, 6), '#e0a92a', 3.5); fs(c, cir(17, 0, 7), '#fff6ea', 3); c.restore();
      fs(c, rec(158, 338, 44, 74, 14), 'rgba(20,10,34,.85)', 4);
      if (S && S.f === 'tubo') { c.save(); c.beginPath(); rrPath(c, 160, 340, 40, 70, 12); c.clip(); capsula(c, 180, lerp(300, 430, easeIn(S.t / 0.42)), 14, S.col, S.t * 8); c.restore(); }
      c.save(); c.beginPath(); rrPath(c, 160, 340, 40, 70, 12); c.clip(); c.fillStyle = 'rgba(190,230,255,.16)'; c.fillRect(160, 340, 40, 70); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(165, 342, 6, 66); c.restore();
      fs(c, rec(138, 420, 84, 44, 14), OL, 0);
      const flap = S && (S.f === 'bandeja' || (S.f === 'fuera' && !S.hecho)) ? 1 : S && S.f === 'tubo' ? ease((S.t - 0.3) / 0.12) : 0;
      if (S && S.f === 'bandeja') { const k = S.t / 0.32, b = Math.abs(Math.sin(k * Math.PI * 2.2)) * (1 - k) * 14; capsula(c, 180, 440 - b, 14, S.col, k * 3); }
      fs(c, rec(140, 420, 80, 20 * (1 - flap) + 3, 7), MC[1], 3);
      texto(c, 'MICROBLIZZ', 180, 486, 11, 'rgba(255,255,255,.7)', 0);
      fs(c, rec(126, 252, 108, 32, 12), '#c9d2e3', 4); c.fillStyle = '#9ca3af'; c.fillRect(128, 262, 104, 8);
      if (S && S.f === 'compuerta') { const k = easeIn(S.t / 0.22); capsula(c, lerp(S.bx, 180, k), lerp(S.by, 268, k), 14, S.col, S.t * 6); }
      fs(c, cir(GX, GY, GR + 4), 'rgba(160,210,255,.14)', 0);
      c.save(); c.beginPath(); c.arc(GX, GY, GR, 0, TAU); c.clip(); for (const b of bolas) capsula(c, b.x, b.y, b.r, b.col, b.rot); c.restore();
      c.beginPath(); c.arc(GX, GY, GR + 4, 0, TAU); c.lineWidth = 5; c.strokeStyle = OL; c.stroke();
      c.beginPath(); c.arc(GX - 4, GY - 4, GR - 14, Math.PI * 1.12, Math.PI * 1.42); c.lineWidth = 9; c.strokeStyle = 'rgba(255,255,255,.55)'; c.stroke();
      fs(c, cir(GX + 52, GY - 58, 6), 'rgba(255,255,255,.6)', 0);
      fs(c, rec(148, 54, 64, 18, 7), MC[0], 4); fs(c, cir(180, 50, 9), '#ffcb3d', 3.5);
    },
  });
})();
