// Fans of Rouflage · LOS DIBUJOS DE LAS HABILIDADES (talentos): uno por habilidad, con el contorno grueso y los colores del juego, en el mismo formato que
// los de las misiones (DIBUJOS_MIS de misiones-iconos.js: centrados en 0,0, de unos 34 de lado; `sombra` pinta solo la silueta oscura de detrás).
// Se añaden ahí con la clave 'tal_<id>' para usar la misma medalla (pintaInsignia) en la pantalla de TALENTOS, y pintaHabIcono los pinta sueltos (botones).
'use strict';
Object.assign(TONOS_MIS, { becario: ['#9fd0ff', '#2e6ad0'], colado: ['#a6f2be', '#22a063'], bloq: ['#8d97ad', '#4a5470'] });
(() => {
  let S = false;
  const f = (c, col, lw = 2.6) => { c.fillStyle = S ? OL : col; c.fill(); if (!S) { c.lineWidth = lw; c.strokeStyle = OL; c.stroke(); } };
  const st = (c, col, lw) => { c.lineWidth = lw; c.strokeStyle = S ? OL : col; c.stroke(); };
  const brillo = (c, ...p) => { if (S) return; c.beginPath(); c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.75)'; c.stroke(); };
  const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
  const circ = (c, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, TAU); };
  const ondas = (c, x, y, a0, a1, rs, col = '#fff6ea') => { if (S) return; for (const r of rs) { c.beginPath(); c.arc(x, y, r, a0, a1); c.lineWidth = 2.4; c.strokeStyle = col; c.stroke(); } };
  // una galleta pequeña (para el señuelo, el cambiazo y el maestro), de frente
  const galleta = (c, x, y, k, col, discontinua) => {
    c.save(); c.translate(x, y); c.scale(k, k);
    c.beginPath(); c.arc(0, -9, 7.5, 0, TAU); c.moveTo(-5.5, -3); c.lineTo(5.5, -3); c.lineTo(7, 11); c.lineTo(-7, 11); c.closePath();
    if (discontinua && !S) { c.setLineDash([3, 2.4]); c.fillStyle = 'rgba(255,255,255,.18)'; c.fill(); c.lineWidth = 2.2; c.strokeStyle = '#fff6ea'; c.stroke(); c.setLineDash([]); }
    else { f(c, col, 2.6 / k); if (!S) { c.fillStyle = OL; circ(c, -2.6, -9.5, 1.3); c.fill(); circ(c, 2.6, -9.5, 1.3); c.fill(); } }
    c.restore();
  };
  const D = {
    tal_contador(c) {      // el contador de mano: cuerpo de metal, ventanita con el número, el botón y la anilla
      c.beginPath(); c.arc(-1, 13, 6.5, 0.15 * Math.PI, 0.85 * Math.PI, true); st(c, OL, 6); c.beginPath(); c.arc(-1, 13, 6.5, 0.15 * Math.PI, 0.85 * Math.PI, true); st(c, '#c9d2e2', 2.6);
      rr(c, 6, -17, 7, 7, 2); f(c, '#ff4b5c', 2.4);
      circ(c, -1, 1, 13); f(c, '#9fb3d6', 3); circ(c, -1, 1, 9.5); f(c, '#e8eef8', 2);
      rr(c, -9, -4, 16, 9, 2.5); f(c, '#20283c', 2);
      if (!S) { c.font = '400 9px ' + LETRA_GORDA; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#7ee04a'; c.fillText('02', -1, 1.2); }
      brillo(c, -10, -6, -6, -9);
    },
    tal_dron(c) {      // el dron: cuerpo con su ojo, cuatro brazos y hélices, la luz roja
      for (const [x, y] of [[-12, -7], [12, -7]]) { c.beginPath(); c.moveTo(x * 0.3, 0); c.lineTo(x, y); st(c, OL, 6); c.beginPath(); c.moveTo(x * 0.3, 0); c.lineTo(x, y); st(c, '#5d6a8a', 2.6); }
      for (const x of [-12, 12]) { c.beginPath(); c.ellipse(x, -9, 8, 2.6, 0, 0, TAU); f(c, 'rgba(220,235,255,.9)', 2); rr(c, x - 1.5, -9, 3, 4, 1); f(c, '#3d4063', 1.6); }
      rr(c, -10, -4, 20, 11, 5); f(c, '#f4f1fa', 2.8);
      circ(c, 0, 2, 4.2); f(c, '#20283c', 2); if (!S) { c.fillStyle = '#39d5e8'; circ(c, 0, 2, 2.2); c.fill(); c.fillStyle = '#fff'; circ(c, -0.8, 1.2, 0.8); c.fill(); }
      circ(c, 7, -1, 1.8); f(c, '#ff4b5c', 1.4);
      c.beginPath(); c.moveTo(-6, 7); c.lineTo(-8, 12); c.moveTo(6, 7); c.lineTo(8, 12); st(c, OL, 2.6);
      if (!S) { c.setLineDash([2, 3]); c.beginPath(); c.moveTo(-4, 14); c.lineTo(-10, 19); c.moveTo(4, 14); c.lineTo(10, 19); c.lineWidth = 1.6; c.strokeStyle = 'rgba(255,90,90,.9)'; c.stroke(); c.setLineDash([]); }
      brillo(c, -6, -2, 2, -2);
    },
    tal_silbato(c) {      // el silbato del jefe: plateado, con cordón rojo y el pitido
      c.beginPath(); c.moveTo(-14, -4); c.lineTo(3, -4); c.arc(5, 5, 9.5, -Math.PI / 2, Math.PI * 1.5); c.lineTo(-14, 5); c.closePath(); f(c, '#dfe5f0');
      circ(c, 5, 5, 3.8); f(c, '#9aa6bc', 2); brillo(c, -11, -1, 0, -1);
      c.beginPath(); c.moveTo(-14, 5); c.quadraticCurveTo(-17, 15, -6, 16); st(c, OL, 4.4); c.beginPath(); c.moveTo(-14, 5); c.quadraticCurveTo(-17, 15, -6, 16); st(c, '#ff4b5c', 2.2);
      ondas(c, -15, -8, -2.5, -1.2, [6, 10.5, 15], '#ffcb3d');
      if (!S) { c.font = '400 11px ' + LETRA_GORDA; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 3; c.strokeStyle = OL; c.strokeText('!', 12, -12); c.fillStyle = '#ffcb3d'; c.fillText('!', 12, -12); }
    },
    tal_uv(c) {      // la linterna ultravioleta: el haz morado y la pintura que brilla
      if (!S) { c.beginPath(); c.moveTo(-2, -2); c.lineTo(17, -16); c.lineTo(17, 12); c.closePath(); const g = c.createLinearGradient(-2, 0, 17, 0); g.addColorStop(0, 'rgba(200,120,255,.95)'); g.addColorStop(1, 'rgba(200,120,255,.15)'); c.fillStyle = g; c.fill(); }
      c.save(); c.rotate(0.06); rr(c, -17, -5, 14, 9, 2.5); f(c, '#3d4063'); c.beginPath(); c.moveTo(-3, -6.5); c.lineTo(2, -8.5); c.lineTo(2, 6.5); c.lineTo(-3, 4.5); c.closePath(); f(c, '#b45cff', 2.4); c.restore();
      brillo(c, -14, -2.5, -7, -2.5);
      if (!S) for (const [x, y, r, col] of [[10, -6, 2.6, '#7effc8'], [13, 4, 2, '#ff8ce8'], [7, 1, 1.6, '#fff97e']]) { c.shadowColor = col; c.shadowBlur = 6; c.fillStyle = col; circ(c, x, y, r); c.fill(); c.shadowBlur = 0; }
      if (!S) chispa(c, 14, -12, 3.2);
    },
    tal_cafe(c) {      // el café doble: la taza con su «×2», el vapor y las rayas de correr
      if (!S) for (const [y, l] of [[-2, 7], [3, 9], [8, 6]]) { c.beginPath(); c.moveTo(-17, y); c.lineTo(-17 + l, y); c.lineWidth = 2.2; c.strokeStyle = '#fff6ea'; c.stroke(); }
      c.beginPath(); c.arc(11, 3, 4.6, -Math.PI / 2, Math.PI / 2); st(c, OL, 5.5); c.beginPath(); c.arc(11, 3, 4.6, -Math.PI / 2, Math.PI / 2); st(c, '#fff6ea', 2.4);
      c.beginPath(); c.moveTo(-8, -5); c.lineTo(10, -5); c.lineTo(8, 12); c.quadraticCurveTo(1, 15, -6, 12); c.closePath(); f(c, '#fff6ea');
      c.beginPath(); c.ellipse(1, -5, 9, 2.2, 0, 0, TAU); f(c, '#7a4a22', 1.8);
      if (!S) { c.font = '400 8px ' + LETRA_GORDA; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ff7a1a'; c.fillText('×2', 1, 4); }
      if (!S) for (const x of [-2, 4]) { c.beginPath(); c.moveTo(x, -9); c.bezierCurveTo(x - 3, -12, x + 3, -14, x, -18); c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.85)'; c.stroke(); }
    },
    tal_jefe(c) {      // el título de jefe: la corbata con su corona
      c.beginPath(); c.moveTo(-4, -6); c.lineTo(4, -6); c.lineTo(2, -2); c.lineTo(6, 13); c.lineTo(0, 17); c.lineTo(-6, 13); c.lineTo(-2, -2); c.closePath(); f(c, '#ff4b5c');
      if (!S) { c.beginPath(); c.moveTo(-3, 4); c.lineTo(3, 0); c.moveTo(-4, 10); c.lineTo(4, 6); c.lineWidth = 1.6; c.strokeStyle = 'rgba(255,255,255,.5)'; c.stroke(); }
      c.beginPath(); c.moveTo(-11, -9); c.lineTo(-12, -18); c.lineTo(-6, -13); c.lineTo(0, -20); c.lineTo(6, -13); c.lineTo(12, -18); c.lineTo(11, -9); c.closePath(); f(c, '#ffcb3d');
      if (!S) { c.fillStyle = '#39d5e8'; circ(c, 0, -12.5, 1.8); c.fill(); }
      brillo(c, -8, -11, -9, -15);
    },
    tal_senuelo(c) {      // el señuelo: tu galleta pintada y, al lado, la falsa (de puntos), con la pintura
      galleta(c, 8, 4, 1.05, '#7ee04a', true);
      galleta(c, -7, 4, 1.05, '#7ee04a');
      if (!S) { c.save(); c.beginPath(); c.arc(-7, -5.5, 7.5, 0, TAU); c.moveTo(-12.5, 1); c.lineTo(-1.5, 1); c.lineTo(0, 15); c.lineTo(-14, 15); c.clip(); c.fillStyle = '#39a0e8'; c.fillRect(-15, 4, 16, 4); c.fillStyle = '#ffcb3d'; c.fillRect(-15, 10, 16, 3); c.restore(); }
      if (!S) { c.font = '400 12px ' + LETRA_GORDA; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 3; c.strokeStyle = OL; c.strokeText('?', 15, -13); c.fillStyle = '#ffcb3d'; c.fillText('?', 15, -13); }
    },
    tal_rapida(c) {      // la pintura rápida mejorada: el rodillo con el rayo y su «+»
      c.beginPath(); c.moveTo(4, 2); c.lineTo(4, 7); c.lineTo(-4, 9); c.lineTo(-4, 16); st(c, OL, 5); c.beginPath(); c.moveTo(4, 2); c.lineTo(4, 7); c.lineTo(-4, 9); c.lineTo(-4, 16); st(c, '#c9d2e2', 2.2);
      rr(c, -7, 12, 6, 8, 2); f(c, '#3d4063', 2);
      rr(c, -14, -10, 22, 11, 4); f(c, '#ff7a1a'); if (!S) { c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-11, -8, 16, 2.5); }
      c.beginPath(); c.moveTo(13, -18); c.lineTo(6, -6); c.lineTo(10, -6); c.lineTo(7, 4); c.lineTo(16, -9); c.lineTo(12, -9); c.closePath(); f(c, '#ffcb3d', 2.2);
      if (!S) { c.lineWidth = 3.2; c.strokeStyle = OL; c.beginPath(); c.moveTo(13, 7); c.lineTo(13, 15); c.moveTo(9, 11); c.lineTo(17, 11); c.stroke(); c.lineWidth = 1.6; c.strokeStyle = '#7ee04a'; c.stroke(); }
    },
    tal_gato(c) {      // los pasos de gato: la huella con sus almohadillas rosas y el sigilo
      c.save(); c.rotate(-0.2);
      c.beginPath(); c.ellipse(0, 6, 8.5, 7, 0, 0, TAU); f(c, '#f4f1fa', 2.8);
      for (const [x, y, rx] of [[-9, -4, 3.4], [-3.5, -9.5, 3.6], [3.5, -9.5, 3.6], [9, -4, 3.4]]) { c.beginPath(); c.ellipse(x, y, rx, 4.4, x * 0.04, 0, TAU); f(c, '#f4f1fa', 2.4); }
      if (!S) { c.fillStyle = '#ff9cc4'; c.beginPath(); c.ellipse(0, 7, 4.4, 3.4, 0, 0, TAU); c.fill(); for (const [x, y] of [[-9, -4], [-3.5, -9.5], [3.5, -9.5], [9, -4]]) { c.beginPath(); c.ellipse(x, y + 0.6, 1.6, 2, 0, 0, TAU); c.fill(); } }
      c.restore();
      if (!S) { c.font = '400 8px ' + LETRA_GORDA; c.textAlign = 'center'; c.fillStyle = '#c9d2e2'; c.fillText('z', 14, -12); c.fillText('z', 17, -17); }
    },
    tal_cambiazo(c) {      // el cambiazo: dos galletas y las flechas que se cruzan
      galleta(c, -10, 6, 0.8, '#ffcb3d'); galleta(c, 10, 6, 0.8, '#39d5e8');
      const flecha = (a0, a1, y, col, abajo) => {
        c.beginPath(); c.arc(0, y, 10, a0, a1, abajo); st(c, OL, 5.4); c.beginPath(); c.arc(0, y, 10, a0, a1, abajo); st(c, col, 2.6);
        const a = a1, x2 = Math.cos(a) * 10, y2 = y + Math.sin(a) * 10, d = abajo ? -1 : 1;
        c.beginPath(); c.moveTo(x2 + 4 * d, y2 - 3); c.lineTo(x2, y2 + (abajo ? -1 : 1)); c.lineTo(x2 + 4.5 * d, y2 + 3.5 * (abajo ? -1 : 1)); c.closePath(); f(c, col, 2);
      };
      flecha(Math.PI * 1.1, Math.PI * 1.85, -2, '#ff7a1a', false);
      flecha(Math.PI * 0.1, Math.PI * 0.85, -4, '#7ee04a', false);
    },
    tal_maestro(c) {      // el título de maestro del camuflaje: una galleta a medio pintar con su corona
      galleta(c, 0, 6, 1.25, '#f4f1fa');
      if (!S) { c.save(); c.translate(0, 6); c.scale(1.25, 1.25); c.beginPath(); c.arc(0, -9, 7.5, 0, TAU); c.moveTo(-5.5, -3); c.lineTo(5.5, -3); c.lineTo(7, 11); c.lineTo(-7, 11); c.clip();
        for (let i = 0; i < 4; i++) { c.fillStyle = ['#7ee04a', '#39d5e8', '#ffcb3d', '#ff7a1a'][i]; c.fillRect(0, -18 + i * 8, 10, 8); } c.restore();
        c.beginPath(); c.moveTo(0, -11); c.lineTo(0, 20); c.lineWidth = 1.4; c.strokeStyle = OL; c.stroke(); }
      c.beginPath(); c.moveTo(-8, -10); c.lineTo(-9, -18); c.lineTo(-4, -14); c.lineTo(0, -20); c.lineTo(4, -14); c.lineTo(9, -18); c.lineTo(8, -10); c.closePath(); f(c, '#ffcb3d', 2.4);
    },
  };
  for (const k in D) { const g = D[k]; DIBUJOS_MIS[k] = (c, sombra) => { S = !!sombra; c.save(); c.lineJoin = 'round'; c.lineCap = 'round'; g(c); c.restore(); S = false; }; }
  DIBUJOS_MIS.tal_granada = DIBUJOS_MIS.humo;      // la granada: la misma de la misión de la granada
})();
// el dibujo de una habilidad suelto (en los botones de la partida y las fichas pequeñas): con su sombra, escalado a w
function pintaHabIcono(c, w, id, apagado) {
  const g = DIBUJOS_MIS['tal_' + id]; if (!g) return;
  c.save(); c.scale(w / 40, w / 40); c.translate(20, 20.5);
  c.save(); c.globalAlpha = 0.4; c.translate(1.2, 2.2); g(c, true); c.restore();
  g(c, false);
  if (apagado) { c.globalCompositeOperation = 'source-atop'; c.fillStyle = 'rgba(40,46,70,.62)'; c.fillRect(-22, -22, 44, 44); }
  c.restore();
}
