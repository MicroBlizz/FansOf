// Fans of Rouflage · RETRATO ROBOT (modo «retrato», modos.js): antes de salir a buscar, los becarios ven la ficha de cada colado (su pintura y su
// postura, tal como se congeló) en una tira debajo del reloj, y la tira se queda durante la caza (los despedidos se tachan). La cuenta atrás dura
// más para poder estudiarlas. No hay bandos: gana una sola persona, quien más puntos suma (cada becario cobra sus propios despidos; cada colado,
// lo que aguanta). En el PvP las pieles llegan como siempre (rfpMandaPiel al congelarse), así que la ficha enseña lo último que se sabe de cada uno.
'use strict';

const RETRATO = { cuenta: 8, t: 0, lista: [] };

// la tira: una ficha por colado (solo para los becarios)
function retratoPinta(fuerza) {
  const caja = E('retratos'); if (!caja) return;
  const ver = modoEs('retrato') && J.yo && J.yo.clase === 'cazador' && (J.fase === 'cuenta' || J.fase === 'caza');
  if (caja.hidden === ver) caja.hidden = !ver;
  if (!ver) { RETRATO.lista = []; E('ranking').style.top = ''; return; }
  // justo debajo de la fila de CARTAS / COLADOS (que puede ocupar dos filas si sale el silbato caliente), y la clasificación debajo de la tira
  const abajo = E('estado').getBoundingClientRect().bottom + 6; caja.style.top = Math.round(abajo) + 'px';
  E('ranking').style.top = Math.round(abajo + (caja.getBoundingClientRect().height || 84) + 6) + 'px';
  const colados = J.camaleones.filter(e => e.pintado || e.jugador || e.humano);
  if (fuerza || RETRATO.lista.length !== colados.length) {
    RETRATO.lista = colados;
    caja.innerHTML = colados.map((e, i) => `<figure data-i="${i}"><canvas width="64" height="76"></canvas><figcaption>${String(e.nombre).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))}</figcaption></figure>`).join('');
  }
  colados.forEach((e, i) => {
    const f = caja.children[i]; if (!f) return;
    f.classList.toggle('fuera', !!e.fuera);
    const cv = f.querySelector('canvas'), c = cv.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
    c.fillStyle = '#2a1842'; c.fillRect(0, 0, cv.width, cv.height);
    c.setTransform(1.15, 0, 0, 1.15, 32, 70);
    const falso = Object.assign({}, e, { x: 0, y: 0, fuera: false, tFuera: 0, hielo: 1, tiembla: 0, invis: 0, pz: null, mira: 1 });
    pintaAlubia(c, falso, 0);
  });
}
// cada fotograma: en la cuenta atrás las fichas se refrescan (en el PvP aún pueden estar llegando pieles); en la caza, cuando alguien cae
function retratoAvanza(dt) {
  if (!modoEs('retrato')) return;
  RETRATO.t += dt;
  if (J.fase === 'cuenta' && RETRATO.t > 0.5) { RETRATO.t = 0; retratoPinta(false); }
  else if (J.fase === 'caza' && RETRATO.t > 1) { RETRATO.t = 0; retratoPinta(false); }
  else if (J.fase !== 'cuenta' && J.fase !== 'caza' && !E('retratos').hidden) retratoPinta(false);
}
