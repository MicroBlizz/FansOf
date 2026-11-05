// Fans of Basement · Misiones y logros (solo pantalla, estilo Swipe): el botón MISIONES de la cabecera de tu mesa (con un globo si
// hay premios por cobrar) y su ventana, con dos pestañas: MISIONES (las 3 de hoy y las 2 de la semana) y LOGROS. Cada reto enseña
// su barra de progreso, el premio en monedas y, si está hecho, el botón COBRAR. Los datos y el sistema, en retos.js (RETOSL).
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const UI = B.ui, C = UI.C, T = UI.texto;
  UI.botonRetos = () => ({ x: 12, y: 10, w: 150, h: 44, accion: 'retos' });

  // el botón de la cabecera, con el globo rojo de los premios que esperan
  UI.retosCabecera = function (g, botones) {
    const b = UI.botonRetos(), n = BAS_RETOS.listosTodos();
    UI.boton(g, b, 'azul', '', 0);
    UI.textoCabe(g, tr('MISIONES'), b.x + b.w / 2, b.y + b.h / 2, 19, b.w - 16, '#ffffff', 'center', 4);
    if (n) { UI.panel(g, b.x + b.w - 20, b.y - 8, 28, 28, C.rojo, null, null, 3); T(g, String(n), b.x + b.w - 6, b.y + 6, 17, '#ffffff', 'center', 3); }
    botones.push(b);
  };

  // un reto: texto, barra, premio y, si está hecho, COBRAR (o «HECHO» si ya se cobró)
  function reto(g, x, y, w, h, m, p, botones) {
    UI.pergamino(g, x, y, w, h);
    UI.textoCabe(g, tr(m.txt), x + 20, y + h * 0.32, 19, w - 190, C.cafe, 'left', 0);
    UI.barra(g, x + 20, y + h * 0.58, w - 200, 16, m.prog / m.goal, m.listo ? C.verde : C.naranja);
    T(g, m.prog + '/' + m.goal, x + 20 + (w - 200) / 2, y + h * 0.58 + 8, 13, '#ffffff', 'center', 3);
    const b = { x: x + w - 162, y: y + h / 2 - 24, w: 146, h: 48, accion: 'cobrarReto', p, id: m.id };
    if (m.cobrada) { T(g, tr('HECHO'), b.x + b.w / 2, b.y + 24, 20, '#2e6a2a', 'center', 0); return; }
    UI.boton(g, b, m.listo ? 'verde' : 'apagado', '', 0);
    UI.moneda(g, b.x + 26, b.y + 24, 1.6);
    T(g, m.listo ? tr('COBRAR') : '+' + m.r, b.x + b.w / 2 + 14, b.y + 24, m.listo ? 18 : 20, '#ffffff', 'center', 4);
    if (m.listo) botones.push(b);
  }

  function misiones(g, W, y, alto, botones) {
    const h = Math.min(92, Math.floor((alto - 80) / 5) - 8);
    UI.franja(g, tr('HOY'), W / 2, y + 12, 17, 200);
    BAS_RETOS.lista('d').forEach((m, i) => reto(g, 20, y + 34 + i * (h + 8), W - 40, h, m, 'd', botones));
    const y2 = y + 34 + 3 * (h + 8) + 16;
    UI.franja(g, tr('ESTA SEMANA'), W / 2, y2 + 12, 17, 200);
    BAS_RETOS.lista('s').forEach((m, i) => reto(g, 20, y2 + 34 + i * (h + 8), W - 40, h, m, 's', botones));
  }

  function logros(g, W, y, alto, botones) {
    const lista = BAS_RETOS.lista('l'), h = Math.min(80, Math.floor(alto / lista.length) - 6);
    lista.forEach((m, i) => reto(g, 20, y + i * (h + 6), W - 40, h, m, 'l', botones));
  }

  // ---------- RANKING del Legacy (ranking.js) ----------
  function filaRanking(g, f, x, y, w, h) {
    UI.panel(g, x, y, w, h, f.yo ? C.naranja : '#2a1830', null, null, 3);
    T(g, '#' + f.puesto, x + 14, y + h / 2, 18, f.yo ? '#ffffff' : C.oro, 'left', 3);
    UI.textoCabe(g, f.nombre, x + 74, y + h / 2, 18, w - 200, '#ffffff', 'left', 3);
    T(g, tr('Planta') + ' -' + f.planta, x + w - 14, y + h / 2, 18, '#ffffff', 'right', 3);
  }
  const TABS = [['legacy', 'LEGACY'], ['hoy', 'DESAFÍO'], ['semana', 'EVENTO']];
  function cabeceraRanking(g, W, y, botones) {
    const R = BAS_RANKING, tw = (W - 40 - 16) / 3;
    TABS.forEach(([id, txt], i) => {
      const b = { x: 20 + i * (tw + 8), y, w: tw, h: 40, accion: 'tabRanking', id };
      UI.boton(g, b, R.tab === id ? 'naranja' : 'apagado', '', 0);
      UI.textoCabe(g, tr(txt), b.x + tw / 2, y + 19, 17, tw - 10, '#ffffff', 'center', 3);
      botones.push(b);
    });
    const mia = R.tab === 'legacy' ? (SAVE.marca ? SAVE.marca.planta : 0) : ((SAVE.retosModo || {})[basClaveDe(R.tab)] || {}).planta;
    const txt = R.tab === 'legacy' ? (mia ? tr('Tu mejor planta del Legacy: -{n}', { n: mia }) : tr('Llega al Código Legacy (planta -25) para entrar'))
      : (mia != null ? tr(R.tab === 'hoy' ? 'Tu mejor de hoy: planta -{n}' : 'Tu mejor de la semana: planta -{n}', { n: mia }) : tr('Juega el modo para entrar'));
    UI.franja(g, txt, W / 2, y + 62, 16, W - 40);
  }
  UI.ranking = function (g, W, y0, alto0, botones) {
    cabeceraRanking(g, W, y0, botones);
    const y = y0 + 54, alto = alto0 - 54, R = BAS_RANKING, d = R.datos[R.tab];
    const msg = (t, c) => UI.lineas(g, t, W / 2, y + 90, 20, W - 80, c || C.crema, 'center', 3);
    if (!basHayRanking()) return msg(tr('El ranking necesita conexión'));
    if (R.error) { msg(tr('No se ha podido cargar'), C.rojo); const b = { x: W / 2 - 100, y: y + 130, w: 200, h: 56, accion: 'reintentarRanking' }; UI.boton(g, b, 'azul', tr('REINTENTAR'), 22); botones.push(b); return; }
    if (!d) return msg(tr('Cargando…'));
    if (!d.lista.length) return msg(tr('Todavía no hay nadie: ¡sé el primero!'));
    const h = Math.min(46, Math.floor((alto - 100) / 12) - 4), n = Math.min(d.lista.length, Math.floor((alto - 100) / (h + 4)));
    d.lista.slice(0, n).forEach((f, i) => filaRanking(g, f, 20, y + 36 + i * (h + 4), W - 40, h));
    if (d.yo && d.yo.puesto > n) filaRanking(g, d.yo, 20, y + 46 + n * (h + 4), W - 40, h);
    T(g, tr('{n} becarios en el ranking', { n: d.total }), W / 2, y + alto - 14, 15, C.crema, 'center', 3);
  };

  // pestana = 'misiones' | 'logros' | 'ranking'
  UI.retos = function (g, W, H, pestana) {
    UI.fondoMenu(g, W, H, 'fondo-oficinas');
    g.fillStyle = 'rgba(10,5,20,0.75)'; g.fillRect(0, 0, W, H);
    UI.titulo(g, tr('MISIONES'), W / 2, 50, 42);
    const botones = [], tabs = [['misiones', 'MISIONES', BAS_RETOS.listos('d') + BAS_RETOS.listos('s')], ['logros', 'LOGROS', BAS_RETOS.listos('l')], ['ranking', 'RANKING', 0]];
    const tw = (W - 40 - 16) / 3;
    tabs.forEach(([id, txt, n], i) => {
      const b = { x: 20 + i * (tw + 8), y: 92, w: tw, h: 54, accion: 'pestanaRetos', id };
      UI.boton(g, b, pestana === id ? 'naranja' : 'azul', '', 0);
      UI.textoCabe(g, tr(txt) + (n ? ' (' + n + ')' : ''), b.x + tw / 2, b.y + 26, 20, tw - 12, '#ffffff', 'center', 4);
      botones.push(b);
    });
    const y = 166, alto = H - 120 - y;
    if (pestana === 'logros') logros(g, W, y, alto, botones); else if (pestana === 'ranking') UI.ranking(g, W, y, alto, botones); else misiones(g, W, y, alto, botones);
    const cerrar = { x: W / 2 - 120, y: H - 104, w: 240, h: 76, accion: 'cerrarRetos' };
    UI.boton(g, cerrar, 'azul', tr('VOLVER'), 30);
    return [...botones, cerrar];
  };
})(BAS);
