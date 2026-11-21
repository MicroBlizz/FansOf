// Fans of Island · adaptadores/dibujo-fondo: EL FONDO VIVO (IS.Dibujo.fondo y IS.Dibujo.creaFondo): cielo, sol, pájaros, nubes, el mar, las
// islas lejanas, el barco, la MechaVaca que cruza de vez en cuando echando humo y un pez que salta. El estado de lo que se mueve
// solo (humo, MechaVaca, pez) lo guarda la vista en v.fondo; el tiempo, en v.reloj.
'use strict';
{
  const { girada } = IS.Lonchas;
  const { vuelta } = IS.Dibujo;
  const { NUBE, SOL, BARCO, PECECITO, LEJOS, cielo, PILAS_MV } = IS.arte;
  const creaFondo = () => ({ humo: [], mv: { x: -999, t: 0, espera: 4 }, saltarin: null, tSalto: 2 });

  function pajaros(v, hy) {
    const { ctx, reloj } = v, VW = v.L.vw;
    ctx.fillStyle = '#2f5f80';
    for (let i = 0; i < 5; i++) {
      const per = VW + 200, x = Math.round((((i * 37 + 400 - reloj * 14 - v.cx * 0.06) % per) + per) % per - 40), y = hy - 96 + (i % 3) * 6 + Math.round(Math.sin(reloj + i) * 3);
      const ala = Math.floor(reloj * 6 + i) % 2;
      ctx.fillRect(x, y, 1, 1); ctx.fillRect(x - 2, y - ala, 2, 1); ctx.fillRect(x + 1, y - ala, 2, 1);
    }
  }
  function vuelaMechavaca(v, hy) {   // un fotograma de la MechaVaca en vuelo (y su humo nuevo)
    const { ctx, reloj, fondo } = v, mv = fondo.mv;
    mv.t += 1 / 60; mv.x += 34 / 60;
    const s = girada(PILAS_MV[Math.floor(reloj * 14) % 2], -Math.PI / 2 + 0.45 + Math.sin(mv.t * 0.9) * 0.55), alto = hy - 30 + Math.sin(mv.t * 1.7) * 8;
    ctx.drawImage(s.c, Math.round(mv.x) - (s.c.width >> 1), Math.round(alto) - s.suelo);
    if (Math.floor(reloj * 20) % 3 === 0) fondo.humo.push({ x: mv.x - 12, y: alto + 2, t: 0.8 });
    if (mv.x > v.L.vw + 80) { mv.x = -999; mv.espera = 14 + Math.random() * 8; }
  }
  function pintaHumo(v) {
    const { ctx, fondo } = v;
    ctx.fillStyle = '#ffffff';
    fondo.humo = fondo.humo.filter(h => {
      h.t -= 1 / 60; h.x -= 0.2; h.y -= 0.15;
      if (h.t > 0.3 || (Math.floor(h.t * 20) & 1)) ctx.fillRect(Math.round(h.x), Math.round(h.y), h.t > 0.5 ? 2 : 1, h.t > 0.5 ? 2 : 1);
      return h.t > 0;
    });
  }
  function mechavacaFondo(v, hy) {   // vuela al fondo de vez en cuando, echando humo
    const mv = v.fondo.mv;
    if (mv.x < -900) { mv.espera -= 1 / 60; if (mv.espera <= 0) { mv.x = -60; mv.t = 0; } }
    else vuelaMechavaca(v, hy);
    pintaHumo(v);
  }
  function pezSaltarin(v, hy) {
    const { ctx, fondo } = v, VW = v.L.vw;
    fondo.tSalto -= 1 / 60;
    if (!fondo.saltarin && fondo.tSalto <= 0) fondo.saltarin = { x: 20 + Math.random() * (VW - 40), y: hy + 10 + Math.random() * 26, t: 0 };
    const f = fondo.saltarin; if (!f) return;
    f.t += 1 / 60;
    const k = f.t / 0.9, alto = Math.sin(Math.PI * k) * 16;
    if (k < 1) { ctx.save(); ctx.translate(Math.round(f.x + k * 24), Math.round(f.y - alto)); ctx.scale(1, k < 0.5 ? 1 : -1); ctx.drawImage(PECECITO, -4, -2); ctx.restore(); }
    ctx.fillStyle = '#ffffff';
    if (k < 0.15) ctx.fillRect(Math.round(f.x) - 2, Math.round(f.y), 5, 1);
    if (k > 0.85 && k < 1.2) ctx.fillRect(Math.round(f.x + 24) - 3, Math.round(f.y), 7, 1);
    if (k > 1.3) { fondo.saltarin = null; fondo.tSalto = 2 + Math.random() * 3; }
  }
  function cieloYMar(v, hy) {   // el cielo con sus nubes y el sol, y el mar liso hasta abajo
    const { ctx, reloj } = v, { vw: VW, vh: VH } = v.L;
    if (hy > 0) { ctx.fillStyle = cielo(ctx, hy); ctx.fillRect(0, 0, VW, hy); }
    ctx.drawImage(SOL, VW - 70, Math.max(4, hy - 120));
    pajaros(v, hy);
    for (let i = 0; i < 6; i++) ctx.drawImage(NUBE, Math.round(vuelta(i * 211 - v.cx * 0.12 - reloj * 4, VW + 120, 60)), hy - 46 - (i % 3) * 20 - Math.round(v.cz * 0.1));
    ctx.fillStyle = '#2f8fd0'; ctx.fillRect(0, hy, VW, VH - hy);
    ctx.fillStyle = '#57aee0'; ctx.fillRect(0, hy, VW, 3);
  }
  function fondo(v) {
    const { ctx, reloj, cx } = v, { vw: VW, vh: VH } = v.L, hy = v.L.base - 78 + Math.round(v.cz * 0.3);
    cieloYMar(v, hy);
    for (let i = 0; i < 4; i++) ctx.drawImage(LEJOS, Math.round(vuelta(i * 300 + 40 - cx * 0.3, 600, 160)), hy - LEJOS.height + 3);
    ctx.drawImage(BARCO, Math.round(vuelta(900 - cx * 0.18 + reloj * 3, VW + 400, 60)), hy - 18 + Math.round(Math.sin(reloj * 1.6)));   // el barco, por delante de las islas lejanas
    mechavacaFondo(v, hy);
    pezSaltarin(v, hy);
    ctx.fillStyle = '#7cc6ee';
    for (let i = 0; i < 40; i++) {
      const x = vuelta(i * 53 - cx * 0.45 + Math.floor(reloj * 5) * (i % 2 ? 1 : -1), VW + 20, 10);
      ctx.fillRect(Math.round(x), hy + 6 + ((i * 37) % Math.max(8, VH - hy - 6)), 3 + (i % 3) * 2, 1);
    }
  }
  Object.assign(IS.Dibujo, { fondo, creaFondo });
}
