// Fans of Merge · PINTAR (Aventura): lo que solo sale en un nivel. Los turnos que quedan, el objetivo del nivel con su progreso
// y el bocadillo del tutorial (con la flecha a la reserva cuando el guion pide usarla).
'use strict';
function mgPintaTurnos(c, t) {
  const P = MG_P, pocos = P.movs <= 3, s = pocos ? 1 + Math.abs(Math.sin(t * 6)) * 0.08 : 1;
  c.save(); c.translate(64, 40); c.scale(s, s);
  if (!mgImg(c, 'ESTRELLA', -42, -42, 84, 84)) { c.beginPath(); c.arc(0, 0, 34, 0, MG_TAU); c.fillStyle = pocos ? '#ff5a4f' : '#ff9a3c'; c.fill(); c.lineWidth = 4; c.strokeStyle = OL; c.stroke(); }
  mgTexto(c, String(Math.max(0, P.movs)), 0, 3, 30, '#fff', 'center', OL);
  c.restore();
  mgTexto(c, tr('TURNOS'), 64, 86, 12, '#fff', 'center', OL);
}
// el objetivo del nivel: una píldora por objetivo (hasta dos), con su cuenta y una marca cuando está hecho
function mgPintaObjNivel(c) {
  const N = MG_P.nivel, n = N.obj.length, w = n > 1 ? 196 : 300, x0 = n > 1 ? 122 : 120;
  mgTexto(c, tr('Nivel {n}', { n: N.id }), 270, 70, 13, '#fff6c8', 'center', 'rgba(0,0,0,.5)', MG_FB);
  N.obj.forEach((o, i) => {
    const [a, b] = mgObjValor(o), hecho = a >= b, x = x0 + i * (w + 6);
    if (!mgImg(c, 'TABLON', x - 4, 76, w + 8, 40) || hecho) mgPanel(c, x, 80, w, 32, 14, hecho ? 'rgba(60,140,40,.9)' : MG_PILDORA, null);
    const txt = o.puntos ? fmt(a) + ' / ' + fmt(b) : a + ' / ' + b;
    if (o.crear) mgDibujaPieza(c, o.crear, x + 18, 95, 30, mgK());
    mgTexto(c, (o.crear ? '' : mgObjTexto(o) + ': ') + txt, x + (o.crear ? 38 : 10), 97, 14, '#fff', 'left', null, MG_FB);
    if (hecho) mgTexto(c, '✓', x + w - 16, 96, 18, '#c8ff8a', 'center', null);
  });
}
// el bocadillo del tutorial: encima de la barra de abajo, con el texto partido en líneas
function mgPintaGuion(c, t) {
  const G = mgPaso(); if (!G || MG_P.estado !== 'jugando') return;
  const ancho = 470, lineas = mgLineas(c, tr(G.txt), ancho - 30, 17);
  const h = 22 + lineas.length * 24, y = MG_V.by + MG_V.cs * MG_CFG.lado + 8 + Math.sin(t * 2) * 2;   // tapa la barra de abajo mientras dura
  mgPanel(c, 270 - ancho / 2, y, ancho, h, 18, '#fff8e6', OL, 4);
  lineas.forEach((l, i) => mgTexto(c, l, 270, y + 22 + i * 24, 17, '#5a3a20', 'center', null, MG_FB));
  if (G.reserva) {   // la flecha apunta a la reserva
    const b = MG_HUD.botones.find(x => x.id === 'reserva0');
    if (b) { c.save(); c.translate(b.x + b.w / 2, b.y + b.h + 26 + Math.abs(Math.sin(t * 4)) * 8); c.rotate(Math.PI); mgFlecha(c, 0, 0); c.restore(); }
  }
}
// parte un texto en líneas que quepan en `ancho` con la letra pequeña de `tam`
function mgLineas(c, txt, ancho, tam) {
  c.font = `800 ${tam}px ${MG_FB}`;
  const out = []; let l = '';
  for (const p of txt.split(' ')) { const prueba = l ? l + ' ' + p : p; if (c.measureText(prueba).width > ancho && l) { out.push(l); l = p; } else l = prueba; }
  if (l) out.push(l);
  return out;
}
