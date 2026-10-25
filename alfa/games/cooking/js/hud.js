// Fans of Cooking · HUD: lo que se pinta encima de la partida en el lienzo: las tarjetas de los pedidos (con su tiempo), el reloj, los puntos,
// el combo, la franja de abajo con quién lleva a quién y los avisos flotantes (puntos al servir, «¡Fuego!», IAhorro…).
'use strict';
const HUD = (() => {
  const T = COOK.tile; let avisos = [];
  const rr = (c, x, y, w, h, r) => { c.beginPath(); rrPath(c, x, y, w, h, r); };
  const trazo = (c, lw = 2.5) => { c.lineWidth = lw; c.strokeStyle = OL; c.stroke(); };
  function aviso(texto, x, y, color = '#fff', tam = 18) { avisos.push({ texto, x, y, color, tam, t: 0 }); }

  function tarjeta(c, p, x, y, w, nuevo) {
    const r = RECETA[p.receta], k = clamp(p.t / p.dura, 0, 1), fin = recetaFinal(r);
    c.save(); if (nuevo > 0) c.translate(0, -nuevo * 60);
    rr(c, x, y, w, 84, 10); c.fillStyle = 'rgba(38,20,60,.96)'; c.fill(); trazo(c, 3);
    c.font = '800 12px ' + '"Baloo 2", system-ui, sans-serif'; c.fillStyle = '#fff'; c.textAlign = 'left'; c.textBaseline = 'top';
    const nombre = tr(r.nombre); let tam = 13; c.font = `800 ${tam}px "Baloo 2", system-ui, sans-serif`; while (c.measureText(nombre).width > w - 14 && tam > 9) { tam--; c.font = `800 ${tam}px "Baloo 2", system-ui, sans-serif`; }
    c.fillText(nombre, x + 7, y + 5);
    const n = fin.length, paso = Math.min(30, (w - 16) / n), ix = x + w / 2 - ((n - 1) * paso) / 2;
    fin.forEach(([ing, est], i) => PINTAR.ingrediente(c, ing, est, ix + i * paso, y + 42, 0.62));
    if (r.olla) { c.fillStyle = '#cdb9ea'; c.font = '700 10px "Baloo 2", system-ui, sans-serif'; c.textAlign = 'center'; c.fillText(tr('OLLA') + ': ' + r.olla.map(i => tr(INGREDIENTES[i].nombre)).join(' + '), x + w / 2, y + 56); }
    else if (r.horno) { c.fillStyle = '#cdb9ea'; c.font = '700 10px "Baloo 2", system-ui, sans-serif'; c.textAlign = 'center'; c.fillText(tr('MONTAR Y AL HORNO'), x + w / 2, y + 56); }
    rr(c, x + 6, y + 70, w - 12, 8, 4); c.fillStyle = 'rgba(0,0,0,.5)'; c.fill(); trazo(c, 1.5);
    rr(c, x + 7, y + 71, (w - 14) * k, 6, 3); c.fillStyle = k > 0.5 ? '#9be58a' : k > 0.25 ? '#ffcb3d' : '#ff5a1a'; c.fill();
    c.restore();
  }
  function frame(c, P, dt) {
    const V = PINTAR.V;
    // la franja de arriba: pedidos a la izquierda, reloj y puntos a la derecha
    c.fillStyle = '#20102c'; c.fillRect(0, 0, V.w, COOK.hud);
    const w = 150; P.pedidos.forEach((p, i) => tarjeta(c, p, 10 + i * (w + 8), 10, w, p.nuevo));
    if (!P.pedidos.length) { c.font = '800 16px "Baloo 2", system-ui, sans-serif'; c.fillStyle = '#cdb9ea'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(tr('Sin pedidos… de momento.'), 14, 52); }
    const m = Math.floor(P.tiempo / 60), s = Math.floor(P.tiempo % 60), prisa = P.tiempo < 20;
    otxt(c, `${m}:${s < 10 ? '0' : ''}${s}`, V.w - 80, 30, 34, prisa && Math.sin(P.t * 10) > 0 ? '#ff5a1a' : '#fff');
    otxt(c, String(P.puntos), V.w - 80, 70, 28, '#ffcb3d');
    c.font = '800 12px "Baloo 2", system-ui, sans-serif'; c.fillStyle = '#cdb9ea'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(tr('PUNTOS'), V.w - 80, 92);
    if (P.combo > 1) otxt(c, 'x' + Math.min(P.combo, COOK.pedidos.comboMax) + ' ' + tr('COMBO'), V.w - 190, 70, 18, '#9be58a');
    // las estrellas del nivel, según los puntos
    const E = P.nivel.estrellas; for (let i = 0; i < 3; i++) { const on = P.puntos >= E[i]; c.beginPath(); starPath(c, V.w - 215 + i * 24, 30, 10, 4.5); c.fillStyle = on ? '#ffcb3d' : 'rgba(255,255,255,.12)'; c.fill(); trazo(c, 1.6); }
    c.font = '700 11px "Baloo 2", system-ui, sans-serif'; c.fillStyle = '#cdb9ea'; c.fillText(tr('siguiente') + ': ' + (E.find(u => P.puntos < u) || tr('¡todas!')), V.w - 191, 50);
    // la franja de abajo: quién lleva a quién
    const by = COOK.hud + P.alto * T + 2; c.fillStyle = '#20102c'; c.fillRect(0, by, V.w, V.h - by);
    c.font = '800 14px "Baloo 2", system-ui, sans-serif'; c.textBaseline = 'middle';
    P.cocineros.forEach((k, i) => {
      const x = i ? V.w - 20 : 20; c.textAlign = i ? 'right' : 'left';
      const activo = P.modo === 'dobles' || P.activo === i;
      c.fillStyle = activo ? k.color : '#5a4a74';
      const teclas = P.modo === 'dobles' ? (i ? tr('FLECHAS · INTRO coge · MAYÚS der. usa') : tr('WASD · ESPACIO coge · Q usa')) : (activo ? tr('WASD o FLECHAS · ESPACIO coge · Q usa · TAB cambia') : tr('esperando (TAB para cambiar)'));
      c.fillText((k.nombre || tr('Jugador {n}', { n: i + 1 })) + ' · ' + teclas, x, by + 24);
    });
    // los avisos flotantes
    for (const a of avisos) { a.t += dt; const u = a.t / 1.4; c.globalAlpha = 1 - Math.max(0, u - 0.6) / 0.4; otxt(c, a.texto, a.x, a.y - u * 40, a.tam, a.color); }
    c.globalAlpha = 1; avisos = avisos.filter(a => a.t < 1.4);
  }
  // los sucesos de la partida: sonidos y avisos
  function procesa(P, sucesos) {
    const V = PINTAR.V, pos = s => [V.ox + (s.x !== undefined ? (s.x > 20 ? s.x : (s.x + 0.5) * T) : V.w / 2), V.oy + (s.y !== undefined ? (s.y > 20 ? s.y : s.y * T) : 200)];
    for (const s of sucesos) {
      const [x, y] = pos(s);
      switch (s.t) {
        case 'sirve': play('crown'); aviso('+' + s.puntos + (s.combo > 1 ? '  x' + Math.min(s.combo, COOK.pedidos.comboMax) : ''), x, y - 60, '#ffcb3d', 24); break;
        case 'caduca': play('womp'); aviso(tr('¡Se ha ido sin comer!') + ' ' + COOK.pedidos.caduca, V.w / 2, 140, '#ff5a1a', 20); break;
        case 'rechazo': play('deny'); aviso(tr('Nadie ha pedido eso'), x, y - 60, '#ff5a1a', 16); break;
        case 'falta': play('deny'); aviso(tr('Le falta algo'), x, y - 20, '#cdb9ea', 14); break;
        case 'corta': play('clank'); break;
        case 'lava': play('blip'); break;
        case 'coge': play('pop'); break;
        case 'suelta': case 'junta': play('card'); break;
        case 'tira': play('trash'); break;
        case 'lanza': play('jump'); break;
        case 'listo': play('note'); aviso(tr('¡Listo!'), x, y - 24, '#9be58a', 14); break;
        case 'quema': play('womp'); aviso(tr('¡Quemado!'), x, y - 24, '#ff5a1a', 14); break;
        case 'fuego': play('boom'); aviso(tr('¡FUEGO!'), x, y - 30, '#ff5a1a', 20); break;
        case 'apagado': play('heal'); break;
        case 'apagon': play('hack'); aviso(tr('IAhorro ha apagado esto «para ahorrar luz»'), V.w / 2, 150, '#7fd0ff', 16); break;
        case 'enciende': play('zap'); break;
        case 'pedido': play('tick'); break;
        case 'cambio': play('select'); break;
        case 'platoVuelve': play('clank'); break;
        case 'fin': play(P.estrellas ? 'win' : 'lose'); break;
        default: break;
      }
    }
  }
  return { frame, procesa, aviso, limpia: () => { avisos = []; } };
})();
