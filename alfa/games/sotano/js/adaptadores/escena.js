// Fans Of Sótano · adaptador · ESCENA: lo que se dibuja en el lienzo de 540 × 960 cada fotograma. El fondo de la zona, el equipo (el líder
// que pica y los ayudantes, dibujos de core), la rejilla de bloques con sus grietas, el correo del CEO que cruza, la Trituradora cuando se
// la ataca y los efectos. Solo lee la partida: los toques los traduce a órdenes principal.js (aquí solo se dice qué hay bajo el dedo).
'use strict';
// dónde va la rejilla de bloques en el lienzo
SO.REJILLA = (() => {
  const cols = SO.AJ.planta.columnas, filas = SO.AJ.planta.filas, lado = 78, paso = 82;
  const ancho = cols * paso - (paso - lado);
  return { cols, filas, lado, paso, ancho, x: Math.round((540 - ancho) / 2), y: 300 };
})();
SO.escena = (() => {
  const R = SO.REJILLA, W = 540, H = 960, ZONA_COLOR = ['#2a2140', '#14203a', '#1d2a1a'];

  function fondo(ctx, e) {
    const z = SO.curvas.zonaDe(e.r.planta.n), im = SO.arte.fondo(z);
    if (im) ctx.drawImage(im, 0, 0, W, H);
    else { ctx.fillStyle = ZONA_COLOR[z]; ctx.fillRect(0, 0, W, H); }
    ctx.fillStyle = 'rgba(10,6,20,0.45)';
    ctx.fillRect(0, 0, W, H);
    const esp = e.r.planta.especial;
    if (esp !== 'normal') {
      ctx.fillStyle = esp === 'dorada' ? 'rgba(255,210,63,0.16)' : `hsla(${(Date.now() / 20) % 360},90%,60%,0.16)`;
      ctx.fillRect(0, 0, W, H);
    }
  }
  // un bloque: su imagen (o su color), las grietas según el daño y la barra de vida
  function bloque(ctx, b, i, t) {
    const x = R.x + (i % R.cols) * R.paso, y = R.y + Math.floor(i / R.cols) * R.paso;
    if (!b || b.vida <= 0) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(x + 6, y + 6, R.lado - 12, R.lado - 12); return; }
    const sac = SO.efectos.golpeado(i) < 0.12 ? (Math.random() - 0.5) * 6 : 0, im = SO.arte.bloque(b.m), M = SO.MATERIALES[b.m];
    if (im) ctx.drawImage(im, x + sac, y, R.lado, R.lado);
    else { ctx.fillStyle = M.color; ctx.fillRect(x + sac, y, R.lado, R.lado); }
    ctx.lineWidth = 4; ctx.strokeStyle = OL; ctx.strokeRect(x + sac, y, R.lado, R.lado);
    const dano = 1 - b.vida / b.max;
    if (dano > 0) grietas(ctx, x + sac, y, dano, i);
    if (dano > 0) { ctx.fillStyle = OL; ctx.fillRect(x + 6, y + R.lado - 12, R.lado - 12, 7); ctx.fillStyle = '#3ddc84'; ctx.fillRect(x + 7, y + R.lado - 11, (R.lado - 14) * (1 - dano), 5); }
  }
  function grietas(ctx, x, y, dano, i) {
    ctx.strokeStyle = 'rgba(20,10,30,0.85)'; ctx.lineWidth = 3;
    const n = Math.ceil(dano * 4);
    for (let k = 0; k < n; k++) {
      const a = (i * 2.4 + k * 1.7) % 6.28, cx = x + R.lado / 2, cy = y + R.lado / 2;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * 16, cy + Math.sin(a) * 12);
      ctx.lineTo(cx + Math.cos(a + 0.4) * 34, cy + Math.sin(a + 0.4) * 30);
      ctx.stroke();
    }
  }
  // el equipo encima de la rejilla: el líder grande a la izquierda y los ayudantes en fila
  function equipo(ctx, e, B, t) {
    const lib = SO.bonos.liberadas(e), atacando = SO.trituradora.atacando(e);
    const ritmo = atacando ? 9 : 6 * B.golpesSeg / SO.AJ.pico.golpesSeg;
    const swing = Math.sin(t * Math.min(18, ritmo)) * 0.25;
    if (!SO.arte.personaje(ctx, SO.FACCIONES[0].arte, 92, 280, 1.25, swing)) { ctx.fillStyle = '#ff9a3c'; ctx.fillRect(70, 190, 44, 90); }
    for (let k = 1; k < lib; k++) {
      const x = 168 + (k - 1) * 38, y = 284 - (k % 2) * 14, bote = Math.abs(Math.sin(t * 5 + k)) * 6;
      SO.arte.personaje(ctx, SO.FACCIONES[k].arte, x, y - bote, 0.78);
    }
    if (e.r.dinamita >= B.recargaDinamita) SO.arte.personaje(ctx, 'beaver', 495, 282 - Math.abs(Math.sin(t * 4)) * 8, 0.85);
  }
  // el correo del CEO cruzando la pantalla de izquierda a derecha (dónde está ahora: o null)
  function sitioCorreo(e) {
    const k = e.c.correo;
    if (!(k.vuela > 0)) return null;
    const p = 1 - k.vuela / SO.AJ.correo.vuelo;
    return { x: -40 + p * (W + 80), y: 130 + k.x * 60 + Math.sin(p * 12) * 14, r: 34 };
  }
  function correo(ctx, e, t) {
    const c = sitioCorreo(e);
    if (!c) return;
    const im = SO.arte.icono('correo');
    if (im) { ctx.drawImage(im, c.x - c.r, c.y - c.r, c.r * 2, c.r * 2); return; }
    ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(Math.sin(t * 6) * 0.15);
    ctx.fillStyle = '#fff6ea'; ctx.strokeStyle = OL; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.rect(-30, -20, 60, 40); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-30, -20); ctx.lineTo(0, 4); ctx.lineTo(30, -20); ctx.stroke();
    ctx.fillStyle = '#e63946'; ctx.beginPath(); ctx.arc(0, 4, 8, 0, 7); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  // la Trituradora encima de la rejilla mientras dura un intento: su imagen temblando, la vida y el tiempo que queda
  function trituradora(ctx, e, t) {
    if (!SO.trituradora.atacando(e)) return;
    const T = e.c.trituradora, vida = SO.trituradora.vida(e), im = SO.arte.trituradora(), s = Math.sin(t * 30) * 3;
    ctx.fillStyle = 'rgba(10,0,10,0.6)'; ctx.fillRect(0, R.y - 20, W, R.filas * R.paso + 40);
    if (im) ctx.drawImage(im, 130 + s, R.y - 4, 280, 280);
    else { ctx.fillStyle = '#5b6578'; ctx.fillRect(150 + s, R.y + 20, 240, 240); }
    barra(ctx, 40, R.y + 284, 460, 26, 1 - T.dano / vida, '#ff4d5e');
    texto(ctx, SO.txt.num(vida - T.dano), W / 2, R.y + 305, 20, '#fff');
    texto(ctx, tr('Trituradora · nivel {n}', { n: T.nivel + 1 }), W / 2, R.y - 30, 24, '#ff4d5e');
    texto(ctx, SO.txt.tiempo(T.intento), 470, R.y + 40, 30, '#ffd23f');
  }
  function barra(ctx, x, y, w, h, parte, color) {
    ctx.fillStyle = OL; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color; ctx.fillRect(x + 3, y + 3, (w - 6) * Math.max(0, Math.min(1, parte)), h - 6);
  }
  function texto(ctx, s, x, y, tam, color) {
    ctx.font = tam + 'px ' + FONT_D; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(4, tam * 0.25); ctx.strokeStyle = OL; ctx.strokeText(s, x, y);
    ctx.fillStyle = color; ctx.fillText(s, x, y);
  }
  function pinta(ctx, e, t) {
    const B = SO.bonos.calcula(e), [dx, dy] = SO.efectos.sacudida();
    ctx.save();
    ctx.translate(dx, dy);
    fondo(ctx, e);
    equipo(ctx, e, B, t);
    e.r.planta.bloques.forEach((b, i) => bloque(ctx, b, i, t));
    trituradora(ctx, e, t);
    correo(ctx, e, t);
    ctx.restore();
    SO.efectos.pinta(ctx, t, W, H);
  }
  // qué hay bajo el dedo en (x, y) del lienzo: { que: 'correo' } o { que: 'bloque', i } o null
  function toque(e, x, y) {
    const c = sitioCorreo(e);
    if (c && Math.hypot(x - c.x, y - c.y) < c.r + 18) return { que: 'correo' };
    const col = Math.floor((x - R.x) / R.paso), fila = Math.floor((y - R.y) / R.paso);
    if (col < 0 || col >= R.cols || fila < 0 || fila >= R.filas) return null;
    return { que: 'bloque', i: fila * R.cols + col };
  }
  return { pinta, toque };
})();
