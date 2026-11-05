// Fans of Basement · Marcador y portada (solo pantalla), al estilo de Fans of Swipe: arriba, la barra de madera con el café (tu
// oxígeno), la planta y la zona, y la caja del despedido; debajo, la barra del jefe si hay uno; abajo, el botón del ascensor de
// emergencia; la palanca que aparece donde pones el dedo. Y la portada con el becario en el vestíbulo de Microblizz.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const UI = B.ui, C = UI.C, T = UI.texto;

  UI.botonAscensor = (W, H) => ({ x: W / 2 - 120, y: H - 104, w: 240, h: 80 });

  function cafe(g, e) {
    const f = e.cafe / e.cafeMax, bajo = f < 0.25 && Math.floor(e.t * 4) % 2;
    UI.dibuja(g, 'r-taza', 36, 40, 2);
    UI.barra(g, 66, 22, 128, 32, f, bajo ? C.rojo : C.naranja);
    T(g, String(Math.ceil(e.cafe)), 130, 37, 22, bajo ? C.oro : '#ffffff', 'center', 4);
    T(g, tr('CAFÉ'), 66, 70, 14, C.crema, 'left', 3);
  }

  function planta(g, e, W) {
    T(g, tr('PLANTA') + ' ' + (e.planta ? '-' + e.planta : '0'), W / 2, 34, 30, C.oro, 'center', 5);
    T(g, tr(e.zona.nombre).toUpperCase(), W / 2, 68, 15, C.crema, 'center', 3);
  }

  function caja(g, e, W) {
    const llena = e.caja.peso >= e.caja.cap;
    B.dibujaSprite(g, 'caja', W - 168, 40, 4);
    UI.barra(g, W - 140, 22, 116, 32, e.caja.peso / e.caja.cap, llena ? C.rojo : C.verde);
    T(g, e.caja.peso + '/' + e.caja.cap, W - 82, 37, 20, '#ffffff', 'center', 4);
    T(g, tr('CAJA'), W - 24, 70, 14, C.crema, 'right', 3);
  }

  function ascensor(g, e, W, H) {
    const b = UI.botonAscensor(W, H);
    if (e.ascensorT >= 0) { UI.boton(g, b, 'verde', tr('LLEGA EN') + ' ' + Math.ceil(e.ascensorT), 30); return; }
    UI.boton(g, b, 'naranja', tr('ASCENSOR'), 32);
    T(g, tr('subir con la caja'), b.x + b.w / 2, b.y + b.h + 2, 13, C.crema, 'center', 3);
  }

  UI.marcador = function (g, e, W, H) {
    UI.panel(g, -6, -6, W + 12, 96, C.madera, '#c2432e', '#5a1714', 5);
    cafe(g, e); planta(g, e, W); caja(g, e, W);
    let y = 112;
    if (e.zona.crunch) { UI.boton(g, { x: W / 2 - 80, y: 92, w: 160, h: 32 }, 'rojo', tr('CRUNCH ZONE'), 16); y = 146; }
    B.vista.barraJefe(g, e, W, y);
    if (!e.fin) ascensor(g, e, W, H);
  };

  UI.palanca = function (g, joy) {
    if (!joy.activo) return;
    g.globalAlpha = 0.55;
    g.fillStyle = C.tinta; g.beginPath(); g.arc(joy.ox, joy.oy, 64, 0, 7); g.fill();
    g.fillStyle = C.crema; g.beginPath(); g.arc(joy.ox, joy.oy, 58, 0, 7); g.fill();
    g.globalAlpha = 0.95;
    const x = joy.ox + joy.dx * 56, y = joy.oy + joy.dy * 56;
    g.fillStyle = C.tinta; g.beginPath(); g.arc(x, y, 30, 0, 7); g.fill();
    g.fillStyle = C.naranja; g.beginPath(); g.arc(x, y, 25, 0, 7); g.fill();
    g.fillStyle = '#ffc07a'; g.fillRect(x - 12, y - 18, 24, 6);
    g.globalAlpha = 1;
  };

  // ---------- portada ----------
  UI.portada = function (g, W, H, t) {
    UI.fondoMenu(g, W, H);
    UI.titulo(g, 'FANS OF', W / 2, H * 0.11, 54);
    UI.titulo(g, 'BASEMENT', W / 2, H * 0.11 + 74, 88);
    T(g, tr('El sótano de Microblizz'), W / 2, H * 0.11 + 140, 24, C.crema);
    UI.dibuja(g, 'descargabot', W / 2 - 170, H * 0.47 + Math.sin(t * 3) * 8, 1.5);
    UI.dibuja(g, 'plusbot', W / 2 + 170, H * 0.4 + Math.sin(t * 2.4) * 8, 1.5);
    UI.dibuja(g, 'becario', W / 2, H * 0.5 + Math.sin(t * 2) * 6, 3);
    UI.franja(g, tr('Baja al sótano, llena la caja y sube antes de quedarte sin café.'), W / 2, H - 220, 17, 500);
    const b = { x: W / 2 - 150, y: H - 170, w: 300, h: 96, accion: 'portada' }, k = 1 + 0.04 * Math.round(Math.sin(t * 5.6));
    g.save(); g.translate(W / 2, b.y + b.h / 2); g.scale(k, k); g.translate(-W / 2, -(b.y + b.h / 2));
    UI.boton(g, b, 'naranja', tr('JUGAR'), 52);
    g.restore();
    return [{ x: 0, y: 0, w: W, h: H, accion: 'portada' }];
  };
})(BAS);
