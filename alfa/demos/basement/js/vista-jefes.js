// Fans of Basement · Vista de los jefes, los becarios y los ayudantes (solo pantalla): el jefe con su destello al recibir golpes y
// su escudo de PowerPoint, la cinta de PRECAUCIÓN que cierra el paso, los proyectiles (diapositivas, sellos de DESPEDIDO y
// monedas), los becarios atrapados en su fotocopiadora o su reunión pidiendo socorro, y la mascota y los becarios que te siguen.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const V = B.vista, PXJ = 5;

  V.jefe = function (g, e) {
    const jf = e.jefe;
    if (!jf) return;
    const bote = Math.sin(e.t * 3) * 3;
    B.dibujaSprite(g, 'jefe_' + jf.id, jf.x, jf.y + bote, PXJ, { blanco: jf.golpeT > 0.08 });   // sin voltear: el sello no cambia de mano
    if (jf.escudoT <= 0) return;
    g.save(); g.globalAlpha = 0.75; g.translate(jf.x, jf.y + bote);
    g.fillStyle = '#161616'; g.fillRect(-52, -40, 104, 74);
    g.fillStyle = '#ffffff'; g.fillRect(-49, -37, 98, 68);
    g.fillStyle = '#e5322d'; g.fillRect(-49, -37, 98, 12);
    g.fillStyle = '#3b8de0'; g.fillRect(-38, -14, 18, 34); g.fillRect(-14, -2, 18, 22); g.fillRect(10, 8, 18, 12);
    g.restore();
  };

  // La cinta amarilla y negra en el suelo de la planta del jefe, mientras vive.
  V.barrera = function (g, e, texto) {
    const jf = e.jefe;
    if (!jf) return;
    const y = jf.suelo - 8, W = e.aj.ancho;
    g.fillStyle = '#161616'; g.fillRect(0, y - 2, W, 16);
    for (let x = -24 + ((e.t * 40) % 24); x < W; x += 24) {
      g.fillStyle = '#ffe14a'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 12, y); g.lineTo(x + 24, y + 12); g.lineTo(x + 12, y + 12); g.fill();
    }
    texto(g, tr('PRECAUCIÓN'), W / 2, y + 6, 11, '#ffffff', 'center', true);
  };

  const PROY = {
    diapositiva(g) { g.fillStyle = '#161616'; g.fillRect(-9, -7, 18, 14); g.fillStyle = '#ffffff'; g.fillRect(-7, -5, 14, 10); g.fillStyle = '#e5322d'; g.fillRect(-7, -5, 14, 3); },
    sello(g) { g.fillStyle = '#161616'; g.beginPath(); g.arc(0, 0, 9, 0, 7); g.fill(); g.fillStyle = '#e5322d'; g.beginPath(); g.arc(0, 0, 7, 0, 7); g.fill(); g.fillStyle = '#ffffff'; g.fillRect(-4, -1, 8, 2); },
    moneda(g) { g.fillStyle = '#161616'; g.beginPath(); g.arc(0, 0, 8, 0, 7); g.fill(); g.fillStyle = '#ffe14a'; g.beginPath(); g.arc(0, 0, 6, 0, 7); g.fill(); },
  };
  V.proyectiles = function (g, e) {
    for (const p of e.proyectiles) { g.save(); g.translate(Math.round(p.x), Math.round(p.y)); g.rotate(e.t * 4); PROY[p.tipo](g); g.restore(); }
  };

  V.becarios = function (g, e, texto) {
    for (const b of e.becarios) {
      const tiembla = Math.sin(e.t * 20 + b.id) * 1.5;
      B.dibujaSprite(g, 'becario', b.x + tiembla, b.y - 10, 3);
      B.dibujaSprite(g, b.trampa === 'fotocopiadora' ? 'fotocopiadora' : 'reunion', b.x, b.y + 14, 3);
      if (Math.floor(e.t * 3 + b.id) % 2) texto(g, tr('¡SOCORRO!'), b.x, b.y - 42, 12, '#ffe14a', 'center', true);
    }
  };

  V.ayudantes = function (g, e) {
    for (const a of e.ayudantes) {
      const bote = Math.sin(e.t * 5 + a.off.x) * 2;
      B.dibujaSprite(g, a.tipo === 'becario' ? 'becario' : a.id, a.x, a.y + bote, a.tipo === 'becario' ? 2 : 3, { izq: e.jugador.x < a.x });
    }
  };

  // La barra de vida del jefe, arriba en el marcador.
  V.barraJefe = function (g, e, W, texto) {
    const jf = e.jefe;
    if (!jf) return;
    const x = 30, y = 96, w = W - 60;
    texto(g, tr(e.aj.jefes[jf.id].nombre).toUpperCase(), W / 2, y - 2, 14, '#ffffff', 'center', true);
    g.fillStyle = '#161616'; g.fillRect(x - 3, y + 8, w + 6, 14);
    g.fillStyle = jf.escudoT > 0 ? '#3b8de0' : '#e5322d'; g.fillRect(x, y + 11, w * Math.max(0, jf.vida / jf.vidaMax), 8);
  };
})(BAS);
