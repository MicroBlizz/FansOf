// Fans of Basement · Pantallas de la bajada que paran el juego o lo tapan (solo pantalla, estilo Swipe): elegir 1 de 3 ventajas
// al entrar en cada zona (tres pergaminos con su dibujo y lo que dan) y el apagón (todo a oscuras salvo un círculo alrededor del
// becario). Las reglas de las ventajas están en campana.js.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const UI = B.ui, C = UI.C, T = UI.texto;
  const ICONO = { cafe: ['r-taza', 2.5], dano: ['r-grapadora', 2.5], cadencia: ['raton', 6], iman: ['r-iman', 2.5], caja: ['caja', 6],
    blindaje: ['r-auriculares', 2.5], valor: ['i-oro', 4], gasto: ['cafe', 6], rebote: ['raton', 6], espera: ['i-flecha', 4] };

  UI.eleccion = function (g, W, H, e, t) {
    g.fillStyle = 'rgba(10,5,20,0.82)'; g.fillRect(0, 0, W, H);
    UI.titulo(g, tr('ELIGE UNA VENTAJA'), W / 2, H * 0.14, 40);
    UI.franja(g, tr('Solo para esta bajada'), W / 2, H * 0.14 + 52, 18);
    const botones = [], h = Math.min(220, (H * 0.68) / 3 - 14);
    e.eleccion.forEach((id, i) => {
      const v = e.aj.ventajas.find((q) => q.id === id), k = Object.keys(v.ef)[0], y = H * 0.25 + i * (h + 14), b = { x: 30, y, w: W - 60, h, accion: 'ventaja', id };
      const sube = Math.max(0, 1 - (t - i * 0.08) * 5) * 60;
      g.save(); g.translate(0, sube);
      UI.pergamino(g, b.x, b.y, b.w, b.h);
      B.vista.pinta(g, ICONO[k][0], b.x + 80, y + h / 2, ICONO[k][1]);
      UI.textoCabe(g, tr(v.nombre), b.x + 160, y + h * 0.36, 30, b.w - 190, C.oro, 'left', 5);
      UI.lineas(g, UI.describe(v.ef).join(' · '), b.x + 160, y + h * 0.66, 20, b.w - 190, C.cafe, 'left', 0, 24);
      const combo = B.campana.comboCon(e, id);
      if (combo) UI.franja(g, tr('COMBO: {n}', { n: tr(combo.nombre) }), b.x + b.w / 2, y + h - 4, 16, b.w - 40);
      g.restore();
      botones.push(b);
    });
    return botones;
  };

  // El apagón: oscuro, con un círculo de luz alrededor del becario (y la cabina del ascensor y los carteles siguen arriba).
  UI.apagon = function (g, W, H, e) {
    if (!e.apagon) return;
    const x = B.vista.sx(e.jugador.x), y = B.vista.sy(e.jugador.y), r = e.aj.trucos.apagon.radio * B.vista.K;
    const gr = g.createRadialGradient(x, y, r * 0.6, x, y, r * 1.4);
    gr.addColorStop(0, 'rgba(5,3,12,0)'); gr.addColorStop(1, 'rgba(5,3,12,0.94)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
  };
})(BAS);
