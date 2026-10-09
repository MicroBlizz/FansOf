// Fans of Rumble · La garra del CEO: el estilo de la máquina de Cartas en el gashapón animado (core/js/sistema/gachapon-anim.js, flag 'gashapon-nuevo').
// Una máquina de gancho: la garra va hasta una cápsula, baja, la coge, la sube y la lleva a la salida. Si viene algo bueno (o de farol), por el camino tiembla
// y «¡QUE SE CAE!». Se dibuja en un espacio de 360 de ancho. Fases: mueve → baja → coge → sube1 → (tensa) → sube2 → vuelve → suelta → cae → trampilla → fuera.
'use strict';
(() => {
  const { TAU, BOLAS, fs, cir, rec, texto, capsula, brillo, easeIn, easeIO, back, lerp, rnd, chispas } = GACHA_FX.util;
  const CASA = 263, ARRIBA = 140;   // donde descansa la garra: encima de la salida
  const DUR = { mueve: 0.6, baja: 0.5, coge: 0.2, sube1: 0.35, tensa: 0.85, sube2: 0.3, vuelve: 0.6, suelta: 0.2, cae: 0.35, trampilla: 0.3 };
  const SIG = { mueve: 'baja', baja: 'coge', coge: 'sube1', tensa: 'sube2', sube2: 'vuelve', vuelve: 'suelta', suelta: 'cae', cae: 'trampilla', trampilla: 'fuera' };
  const G = { pila: null, cx: CASA, cy: ARRIBA, a: 0.6 };   // a: lo abiertas que están las pinzas
  function garra(c, x, y, a) {
    fs(c, rec(x - 16, 104, 32, 14, 5), '#c9d2e3', 3);
    c.beginPath(); c.moveTo(x, 118); c.lineTo(x, y - 14); c.lineWidth = 4; c.strokeStyle = OL; c.stroke(); c.lineWidth = 2; c.strokeStyle = '#9ca3af'; c.stroke();
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * 7, y - 2); c.lineTo(x + s * (10 + Math.sin(a) * 18), y + 14); c.lineTo(x + s * (4 + Math.sin(a) * 10), y + 28); c.lineWidth = 7; c.strokeStyle = OL; c.stroke(); c.lineWidth = 3.5; c.strokeStyle = '#ffcb3d'; c.stroke(); }
    fs(c, rec(x - 13, y - 18, 26, 18, 6), '#ffcb3d', 3.5); fs(c, cir(x, y - 9, 3), OL, 0);
  }
  GACHA_FX.estilo('garra', {
    primera: 'mueve', vista: { es: 0.7, dx: 24, dy: -9.8 }, salida: [263, 414],
    inicia() { if (G.pila) return; G.pila = []; for (let r = 0; r < 3; r++) for (let i = 0; i < 6 - (r % 2); i++) G.pila.push({ x: 78 + i * 28 + (r % 2) * 14 + rnd(-3, 3), y: 352 - r * 22 + rnd(-2, 2), col: BOLAS[(i + r * 2) % 6], rot: rnd(-0.6, 0.6) }); },
    acaba(S) { if (S.cogida) { G.pila.push(S.p); S.cogida = false; } G.a = 0.6; },   // la cápsula vuelve al montón
    actualiza(dt, S) {
      if (!S) { G.cy = ARRIBA; G.cx = CASA + Math.sin(performance.now() / 700) * 3; return; }   // en reposo se balancea un poco
      if (!S.p) { const arriba = G.pila.filter(p => p.y < 335), de = arriba.length ? arriba : G.pila; S.p = de[Math.floor(rnd(0, de.length))]; S.col = S.p.col; S.x0 = G.cx; }
      const P = S.p, k = Math.min(1, S.t / DUR[S.f]);
      if (S.f === 'mueve') G.cx = lerp(S.x0, P.x, easeIO(k));
      else if (S.f === 'baja') G.cy = lerp(ARRIBA, P.y - 16, easeIO(k));
      else if (S.f === 'coge') G.a = lerp(0.6, 0.1, k);
      else if (S.f === 'sube1') G.cy = lerp(P.y - 16, 220, easeIO(k));
      else if (S.f === 'tensa') {   // se le escurre: las pinzas se abren y cierran, la cápsula baila
        G.a = 0.1 + Math.abs(Math.sin(S.t * 14)) * 0.18; G.cx = P.x + Math.sin(S.t * 40) * 2.5;
        if (Math.floor(S.t / 0.28) !== S.clic) { S.clic = Math.floor(S.t / 0.28); play('gwobble', S.clic); if (S.aviso) chispas(G.cx, G.cy + 20, 2, [S.aviso, '#fff6ea'], 60, 'estrella'); }
      }
      else if (S.f === 'sube2') { G.a = 0.1; G.cx = P.x; G.cy = lerp(220, ARRIBA, easeIO(k)); }
      else if (S.f === 'vuelve') G.cx = lerp(P.x, CASA, easeIO(k));
      else if (S.f === 'suelta') G.a = lerp(0.1, 0.6, k);
      if (['mueve', 'baja', 'vuelve'].includes(S.f) && Math.floor(S.t / 0.15) !== S.clic) { S.clic = Math.floor(S.t / 0.15); play('gcrank'); }   // el motor
      if (['sube1', 'tensa', 'sube2', 'vuelve'].includes(S.f)) { S.hx = G.cx; S.hy = G.cy + 18; }
      if (k < 1) return;
      if (S.f === 'coge') { G.pila.splice(G.pila.indexOf(P), 1); S.cogida = true; S.hx = G.cx; S.hy = G.cy + 18; play('clank'); }
      const sig = S.f === 'sube1' ? (S.aviso ? 'tensa' : 'sube2') : SIG[S.f];
      if (sig === 'tensa') play('gtension');
      if (sig === 'cae') play('pop');
      if (sig === 'trampilla') play('land');
      S.f = sig; S.t = 0; S.clic = -1;
      if (sig === 'fuera') S.llega();
    },
    dibuja(c, X, tab, t, S) {
      const MC = X ? X.maquina : ['#8b3dff', '#5b21b6', '#4c1d95'];
      fs(c, cc => cc.ellipse(180, 514, 140, 12, 0, 0, TAU), 'rgba(0,0,0,.35)', 0);
      fs(c, rec(40, 82, 280, 422, 20), MC[0], 4); fs(c, rec(48, 90, 10, 400, 5), 'rgba(255,255,255,.15)', 0);
      // el cartel, con bombillas que parpadean (deprisa al tirar)
      fs(c, rec(34, 22, 292, 64, 16), MC[2], 4);
      for (let i = 0; i < 16; i++) { const on = (Math.floor(t * (S ? 10 : 3)) + i) % 2 === 0, x = 46 + i * 17.8; fs(c, cir(x, 29, 3.4), on ? '#fff6a8' : 'rgba(0,0,0,.3)', 1.6); fs(c, cir(x, 79, 3.4), on ? 'rgba(0,0,0,.3)' : '#fff6a8', 1.6); }
      c.save(); c.shadowColor = '#ff5fa8'; c.shadowBlur = 14 + 6 * Math.sin(t * 6); texto(c, 'LA GARRA DEL CEO', 180, 55, 22, '#ffe14d', 6); c.restore();
      // la vitrina: el montón de cápsulas, la salida y la garra
      fs(c, rec(58, 100, 244, 274, 12), '#160b2e', 3.5);
      fs(c, rec(62, 104, 236, 8, 3), '#c9d2e3', 2.5);
      for (const p of G.pila) capsula(c, p.x, p.y, 14, p.col, p.rot);
      fs(c, rec(234, 268, 60, 104, 8), MC[2], 3.5); texto(c, 'SALIDA', 264, 288, 11, '#e9c4ff', 0);
      if (S && S.cogida && S.hx != null && ['sube1', 'tensa', 'sube2', 'vuelve'].includes(S.f)) capsula(c, S.hx + (S.f === 'tensa' ? Math.sin(t * 30) * 2 : 0), S.hy + (S.f === 'tensa' ? Math.abs(Math.sin(t * 14)) * 4 : 0), 14, S.col, S.f === 'tensa' ? Math.sin(t * 22) * 0.3 : 0);
      if (S && S.f === 'suelta') capsula(c, CASA, lerp(G.cy + 18, 250, easeIn(S.t / DUR.suelta)), 14, S.col, 0);
      if (S && S.f === 'cae') { c.save(); c.beginPath(); c.rect(234, 100, 60, 168); c.clip(); capsula(c, CASA, lerp(250, 300, easeIn(S.t / DUR.cae)), 14, S.col, S.t * 6); c.restore(); }
      garra(c, G.cx, G.cy, G.a);
      if (S && S.f === 'tensa') { const k = back(S.t / 0.3); c.save(); c.translate(150, 170); c.scale(k, k); c.rotate(-0.08 + Math.sin(t * 30) * 0.03); texto(c, '¡QUE SE CAE!', 0, 0, 22, '#ff8a8a', 6); c.restore(); if (S.aviso) brillo(c, G.cx, G.cy + 18, 40, S.aviso, 0.35 + 0.2 * Math.sin(t * 20)); }
      c.fillStyle = 'rgba(190,230,255,.08)'; c.fillRect(60, 102, 240, 270); c.beginPath(); c.moveTo(80, 104); c.lineTo(100, 104); c.lineTo(70, 360); c.lineTo(62, 360); c.closePath(); c.fillStyle = 'rgba(255,255,255,.12)'; c.fill();
      // el panel: palanca (se inclina hacia donde va la garra), botón (se hunde al bajar) y trampilla
      fs(c, rec(52, 384, 256, 110, 14), MC[1], 3.5);
      const jx = S && S.f === 'mueve' ? -8 : S && S.f === 'vuelve' ? 8 : 0;
      fs(c, cc => cc.ellipse(96, 446, 24, 10, 0, 0, TAU), OL, 0);
      c.beginPath(); c.moveTo(96, 446); c.lineTo(96 + jx, 418); c.lineWidth = 7; c.strokeStyle = OL; c.stroke(); c.lineWidth = 4; c.strokeStyle = '#c9d2e3'; c.stroke(); fs(c, cir(96 + jx, 414, 11), '#ff3348', 3.5);
      fs(c, cc => cc.ellipse(156, 446, 20, 9, 0, 0, TAU), OL, 0); fs(c, cc => cc.ellipse(156, S && S.f === 'baja' ? 444 : 440, 17, 8, 0, 0, TAU), '#ffcb3d', 3);
      fs(c, rec(232, 392, 62, 50, 12), OL, 0);
      if (S && S.f === 'trampilla') { const k = S.t / DUR.trampilla, b = Math.abs(Math.sin(k * Math.PI * 2)) * (1 - k) * 10; capsula(c, CASA, 418 - b, 14, S.col, k * 3); }
      fs(c, rec(234, 392, 58, S && (S.f === 'trampilla' || (S.f === 'fuera' && !S.hecho)) ? 6 : 22, 8), MC[0], 3);
      texto(c, X ? X.nombre : 'CARTAS', 180, 478, 13, 'rgba(255,255,255,.8)', 0);
    },
  });
})();
