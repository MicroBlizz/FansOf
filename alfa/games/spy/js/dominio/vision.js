// Fans of Spy · DOMINIO · La visión: el cono de un vigía (un guardia o una cámara). Un vigía es { x, y, dir, alcance, apertura }:
// ve las casillas que están dentro de su alcance, dentro de su ángulo (apertura, en grados a cada lado de hacia donde mira) y sin
// nada que tape la vista por medio. Por la espalda no ve. Lo usan las reglas (¿me ven?) y la pantalla (pintar el cono).
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
(function (S) {
  const R = S.rejilla;

  // ¿La casilla `c` cae dentro del cono, sin mirar todavía si hay algo por medio?
  function enCono(v, c) {
    const dx = c.x - v.x, dy = c.y - v.y, lejos = Math.hypot(dx, dy);
    if (!lejos || lejos > v.alcance + 0.01) return false;
    const d = R.DIRS[v.dir], coseno = (dx * d.x + dy * d.y) / (lejos * Math.hypot(d.x, d.y));
    return coseno >= Math.cos(v.apertura * Math.PI / 180) - 1e-9;
  }

  const ve = (planta, v, c) => enCono(v, c) && R.lineaLibre(v, c, planta.opaca);

  // Todas las casillas que ve el vigía y en las que podría estar el agente (para pintar el cono y para saber por dónde no pasar).
  function celdas(planta, v) {
    const lista = [], r = Math.ceil(v.alcance);
    for (let y = v.y - r; y <= v.y + r; y++) {
      for (let x = v.x - r; x <= v.x + r; x++) {
        if (planta.pisaAgente(x, y) && ve(planta, v, { x, y })) lista.push({ x, y });
      }
    }
    return lista;
  }

  S.vision = Object.freeze({ enCono, ve, celdas });
})(SPY);
