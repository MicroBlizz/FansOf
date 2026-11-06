// Fans of Basement · Vista de los jefes, los becarios y los ayudantes (solo pantalla): el jefe (la Directora de Producto,
// SurvivalBot, ServidorBot o el Presidente, dibujos de Yoshi de Swipe) con su destello al recibir golpes y su escudo de PowerPoint,
// la cinta de PRECAUCIÓN que cierra el paso, los proyectiles (diapositivas, sellos de DESPEDIDO y monedas), los becarios atrapados
// en su fotocopiadora o su reunión pidiendo socorro, y la mascota y los becarios que te siguen. Y la barra de vida del jefe.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const UI = B.ui, V = B.vista, T = UI.texto;
  const JEFE = { producto: ['ladirectora', 2.5], rrhh: ['survivalbot', 2.5], lanzamiento: ['servidorbot', 2.5], accionistas: ['presidente', 2.2], ceo: ['ceo', 2.4],
    becario2004: ['becario', 2.2, 'sepia(1) saturate(1.6) brightness(0.9)'], fantasma: ['servidorbot', 2.5, 'grayscale(1) brightness(1.6) opacity(0.75)'], impresora: ['fotocopiadora', 9, 'hue-rotate(-40deg) saturate(3)'] };
  const VERDE = 'hue-rotate(-90deg) saturate(1.2)';   // los becarios atrapados y rescatados: el becario de Swipe, en verde

  V.jefe = function (g, e) {
    const jf = e.jefe;
    if (!jf) return;
    const x = V.sx(jf.x), y = V.sy(jf.y) + Math.sin(e.t * 3) * 4, d = JEFE[jf.id];
    V.pinta(g, d[0], x, y, d[1], { blanco: jf.golpeT > 0.08, filtro: jf.golpeT > 0.08 ? undefined : d[2] });   // sin voltear; los secretos, con su filtro
    if (jf.escudoT <= 0) return;
    g.save(); g.globalAlpha = 0.85; g.translate(x, y);
    UI.panel(g, -84, -62, 168, 118, '#ffffff', '#ffffff', '#d8dee8', 4);
    g.fillStyle = UI.C.rojo; g.fillRect(-78, -56, 156, 18);
    g.fillStyle = UI.C.azul; g.fillRect(-58, -18, 26, 58); g.fillRect(-20, 2, 26, 38); g.fillRect(18, 18, 26, 22);
    g.restore();
  };

  // la cinta amarilla y negra en el suelo de la planta del jefe, mientras vive
  V.barrera = function (g, e, W) {
    const jf = e.jefe;
    if (!jf) return;
    const y = V.sy(jf.suelo) - 14;
    g.fillStyle = '#1a0f1f'; g.fillRect(0, y - 3, W, 26);
    for (let x = -36 + ((e.t * 60) % 36); x < W; x += 36) {
      g.fillStyle = '#ffd23a'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 18, y); g.lineTo(x + 36, y + 20); g.lineTo(x + 18, y + 20); g.fill();
    }
    UI.franja(g, tr('PRECAUCIÓN'), W / 2, y + 10, 14, 220);
  };

  const PROY = {
    diapositiva(g) { UI.panel(g, -13, -10, 26, 20, '#ffffff', null, null, 2); g.fillStyle = UI.C.rojo; g.fillRect(-10, -7, 20, 5); },
    sello(g) { g.fillStyle = '#1a0f1f'; g.beginPath(); g.arc(0, 0, 13, 0, 7); g.fill(); g.fillStyle = UI.C.rojo; g.beginPath(); g.arc(0, 0, 10, 0, 7); g.fill(); g.fillStyle = '#ffffff'; g.fillRect(-6, -2, 12, 4); },
    moneda(g) { UI.dibuja(g, 'i-oro', 0, 0, 2); },
    escombro(g) { g.fillStyle = '#1a0f1f'; g.fillRect(-13, -11, 26, 22); g.fillStyle = '#8a7a68'; g.fillRect(-10, -8, 20, 16); g.fillStyle = '#b8a48a'; g.fillRect(-10, -8, 8, 6); },
  };
  V.proyectiles = function (g, e) {
    for (const p of e.proyectiles) { g.save(); g.translate(V.sx(p.x), V.sy(p.y)); g.rotate(p.tipo === 'moneda' ? 0 : e.t * 4); PROY[p.tipo](g); g.restore(); }
  };

  V.becarios = function (g, e) {
    for (const b of e.becarios) {
      const x = V.sx(b.x), y = V.sy(b.y), tiembla = Math.sin(e.t * 20 + b.id) * 2;
      V.pinta(g, 'becario', x + tiembla, y - 22, 1.2, { filtro: VERDE });
      V.pinta(g, b.trampa === 'fotocopiadora' ? 'fotocopiadora' : 'reunion', x, y + 30, 5);
      if (Math.floor(e.t * 3 + b.id) % 2) T(g, tr('¡SOCORRO!'), x, y - 90, 18, '#ffd84a', 'center', 4);
    }
  };

  // un compañero: más pequeño que los bichos de verdad y con su chapa verde debajo, para no confundirlo con un enemigo
  const ESC_COMP = { reunion: 0.35, critico: 0.5 };
  function companero(g, a, x, y) {
    g.fillStyle = '#4fc25a'; g.beginPath(); g.ellipse(x, y + 18, 22, 8, 0, 0, 7); g.fill();
    g.strokeStyle = '#1a1a1a'; g.lineWidth = 4; g.stroke();
    V.pintaCosa(g, a.id, x, y, null, ESC_COMP[a.id] || 0.65);
  }
  V.ayudantes = function (g, e) {
    for (const a of e.ayudantes) {
      const x = V.sx(a.x), y = V.sy(a.y) + Math.sin(e.t * 5 + a.off.x) * 3;
      if (a.tipo === 'becario') V.pinta(g, 'becario', x, y, 0.9, { filtro: VERDE });
      else if (a.tipo === 'companero') companero(g, a, x, y);
      else V.pintaCosa(g, a.id, x, y);
    }
  };

  // la barra de vida del jefe, arriba en el marcador
  V.barraJefe = function (g, e, W, y) {
    const jf = e.jefe;
    if (!jf) return;
    UI.textoCabe(g, tr(e.aj.jefes[jf.id].nombre).toUpperCase(), W / 2, y, 20, W - 60, '#ffffff');
    UI.barra(g, 30, y + 16, W - 60, 22, jf.vida / jf.vidaMax, jf.escudoT > 0 ? UI.C.azul : UI.C.rojo);
  };
})(BAS);
