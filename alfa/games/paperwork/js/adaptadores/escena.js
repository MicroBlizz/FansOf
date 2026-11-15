// Fans Of Paperwork · adaptador · ESCENA: lo que se dibuja en el lienzo cada fotograma. El fondo de la zona, la fila del equipo (el líder y los
// trabajadores, dibujos de core), el pasillo de archivadores con sus cajones (cada trabajador se ve en el suyo), el correo del CEO que cruza,
// la Trituradora cuando se la atasca y los efectos. El lienzo mide 540 de ancho y de alto lo que dé la pantalla (960 o más, PW.ui.alto): lo
// de arriba no se mueve y lo que sobra es para el panel. Solo lee la partida: los toques los traduce a órdenes principal.js (aquí solo se
// dice qué hay bajo el dedo).
'use strict';
// dónde va el pasillo de archivadores en el lienzo
PW.REJILLA = (() => {
  const cols = PW.AJ.planta.columnas, filas = PW.AJ.planta.filas, lado = 70, paso = 74;
  const ancho = cols * paso - (paso - lado);
  return { cols, filas, lado, paso, ancho, x: Math.round((540 - ancho) / 2), y: 160 };
})();
PW.escena = (() => {
  const R = PW.REJILLA, W = 540, ZONA_COLOR = ['#2a2140', '#14203a', '#1d2a1a'];
  const celda = i => ({ x: R.x + (i % R.cols) * R.paso, y: R.y + Math.floor(i / R.cols) * R.paso });
  // dónde está cada trabajador en la fila de arriba (k = 0 el líder)
  const enFila = k => (k ? { x: 150 + (k - 1) * 36, y: R.y - 6 - (k % 2) * 10, r: 20 } : { x: 78, y: R.y - 8, r: 40 });

  // el fondo cubre el lienzo sin deformarse (se recorta por los lados si la pantalla es más alta)
  function fondo(ctx, e, H) {
    const z = PW.curvas.zonaDe(e.r.planta.n), im = PW.arte.fondo(z);
    if (im) { const an = im.width * H / im.height; ctx.drawImage(im, (W - Math.max(W, an)) / 2, 0, Math.max(W, an), H); }
    else { ctx.fillStyle = ZONA_COLOR[z]; ctx.fillRect(0, 0, W, H); }
    ctx.fillStyle = 'rgba(10,6,20,0.45)';
    ctx.fillRect(0, 0, W, H);
    const esp = e.r.planta.especial;
    if (esp !== 'normal') {
      ctx.fillStyle = esp === 'jefe' ? 'rgba(255,210,63,0.16)' : `hsla(${(Date.now() / 20) % 360},90%,60%,0.16)`;
      ctx.fillRect(0, 0, W, H);
    }
  }
  // el archivador de repuesto, dibujado: mueble de metal con dos cajones y la etiqueta del color de su documento; según se vacía, el
  // cajón de abajo se va abriendo y asoman las hojas
  function mueble(ctx, x, y, color, parte) {
    const L = R.lado, abre = Math.round(parte * 12);
    ctx.fillStyle = '#7d8798'; ctx.fillRect(x, y, L, L);
    ctx.fillStyle = '#99a3b5'; ctx.fillRect(x + 6, y + 6, L - 12, 26);
    ctx.fillRect(x + 6 - abre / 2, y + 38 + abre / 3, L - 12 + abre, 26);
    if (abre > 2) { ctx.fillStyle = '#fff6ea'; ctx.fillRect(x + 10, y + 34 + abre / 3, L - 20, 6); ctx.fillStyle = color; ctx.fillRect(x + 14, y + 32 + abre / 3, L - 36, 4); }
    ctx.fillStyle = color;
    ctx.fillRect(x + 14, y + 11, 24, 12); ctx.fillRect(x + 14, y + 43 + abre / 3, 24, 12);
    ctx.fillStyle = OL;
    ctx.fillRect(x + 44, y + 15, 14, 5); ctx.fillRect(x + 44, y + 47 + abre / 3, 14, 5);
  }
  // un archivador: su imagen (o el mueble dibujado), la sacudida si alguien rebusca y la barra de lo que le queda
  function archivador(ctx, a, i) {
    const { x, y } = celda(i);
    if (!a || a.vida <= 0) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(x + 6, y + 6, R.lado - 12, R.lado - 12); return; }
    const sac = PW.efectos.rebuscado(i) < 0.12 ? (Math.random() - 0.5) * 6 : 0, im = PW.arte.archivador(a.m), parte = 1 - a.vida / a.max;
    if (im) ctx.drawImage(im, x + sac, y, R.lado, R.lado);
    else mueble(ctx, x + sac, y, PW.DOCUMENTOS[a.m].color, parte);
    ctx.lineWidth = 4; ctx.strokeStyle = OL; ctx.strokeRect(x + sac, y, R.lado, R.lado);
    if (parte > 0) { ctx.fillStyle = OL; ctx.fillRect(x + 6, y + R.lado - 12, R.lado - 12, 7); ctx.fillStyle = '#3ddc84'; ctx.fillRect(x + 7, y + R.lado - 11, (R.lado - 14) * (1 - parte), 5); }
  }
  // la fila del equipo encima del pasillo: el líder grande a la izquierda, los trabajadores en fila (el elegido, marcado) y el castor
  function equipo(ctx, e, B, t) {
    const lib = PW.bonos.liberadas(e), atascando = PW.trituradora.atascando(e);
    const ritmo = atascando ? 9 : 6 * B.vistazosSeg / PW.AJ.lider.vistazosSeg;
    const giro = Math.sin(t * Math.min(18, ritmo)) * 0.25, L = enFila(0);
    if (!PW.arte.personaje(ctx, PW.FACCIONES[0].arte, L.x, L.y, 0.95, giro)) { ctx.fillStyle = '#ff9a3c'; ctx.fillRect(56, R.y - 78, 44, 70); }
    for (let k = 1; k < lib; k++) {
      const p = enFila(k), bote = Math.abs(Math.sin(t * 5 + k)) * 6;
      if (PW.ui.elegido === k) { ctx.fillStyle = 'rgba(255,210,63,0.55)'; ctx.beginPath(); ctx.arc(p.x, p.y - 22, 24, 0, 7); ctx.fill(); }
      PW.arte.personaje(ctx, PW.FACCIONES[k].arte, p.x, p.y - bote, 0.62);
    }
    if (e.r.estanteria >= B.recargaEstanteria) PW.arte.personaje(ctx, 'beaver', 495, R.y - 6 - Math.abs(Math.sin(t * 4)) * 8, 0.75);
    if (PW.ui.elegido) texto(ctx, tr('Toca un archivador para mandar a {lider}', { lider: PW.FACCIONES[PW.ui.elegido].lider }), W / 2, R.y - 84, 18, '#ffd23f');
  }
  // quién está en cada archivador: el del líder, enmarcado; cada trabajador, dibujado en pequeño sobre el suyo
  function puestos(ctx, e, B, t) {
    if (PW.trituradora.atascando(e)) return;
    for (const s of PW.equipo.sitios(e, B)) {
      if (s.i < 0) continue;
      const { x, y } = celda(s.i);
      if (!s.k) { ctx.lineWidth = 4; ctx.strokeStyle = '#ff9a3c'; ctx.strokeRect(x - 3, y - 3, R.lado + 6, R.lado + 6); continue; }
      PW.arte.personaje(ctx, PW.FACCIONES[s.k].arte, x + R.lado - 20, y + R.lado - 8 - Math.abs(Math.sin(t * 7 + s.k)) * 4, 0.4);
    }
  }
  // el correo del CEO cruzando la pantalla de izquierda a derecha (dónde está ahora: o null)
  function sitioCorreo(e) {
    const k = e.c.correo;
    if (!(k.vuela > 0)) return null;
    const p = 1 - k.vuela / PW.AJ.correo.vuelo;
    return { x: -40 + p * (W + 80), y: 110 + k.x * 120 + Math.sin(p * 12) * 14, r: 34 };
  }
  function correo(ctx, e, t) {
    const c = sitioCorreo(e);
    if (!c) return;
    const im = PW.arte.icono('correo');
    if (im) { ctx.drawImage(im, c.x - c.r, c.y - c.r, c.r * 2, c.r * 2); return; }
    ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(Math.sin(t * 6) * 0.15);
    ctx.fillStyle = '#fff6ea'; ctx.strokeStyle = OL; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.rect(-30, -20, 60, 40); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-30, -20); ctx.lineTo(0, 4); ctx.lineTo(30, -20); ctx.stroke();
    ctx.fillStyle = '#e63946'; ctx.beginPath(); ctx.arc(0, 4, 8, 0, 7); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  // las hojas que el equipo le echa a la Trituradora durante el intento: salen de la fila de arriba y caen en la máquina
  function hojas(ctx, t) {
    for (let k = 0; k < 9; k++) {
      const p = (t * 1.6 + k / 9) % 1, x = 60 + k * 50 + (270 - 60 - k * 50) * p, y = R.y - 30 + (R.y + 60 - (R.y - 30)) * p - Math.sin(p * 3.14) * 50;
      ctx.save(); ctx.translate(x, y); ctx.rotate(t * 6 + k);
      ctx.fillStyle = k % 3 ? '#fff6ea' : '#ffd23f'; ctx.strokeStyle = OL; ctx.lineWidth = 2;
      ctx.fillRect(-7, -9, 14, 18); ctx.strokeRect(-7, -9, 14, 18);
      ctx.restore();
    }
  }
  // la Trituradora encima del pasillo mientras dura un intento: su imagen temblando, lo que le falta por atascarse, el bocado y el tiempo
  function trituradora(ctx, e, t) {
    if (!PW.trituradora.atascando(e)) return;
    const T = e.c.trituradora, cabe = PW.trituradora.capacidad(e), im = PW.arte.trituradora(), s = Math.sin(t * 30) * 3;
    ctx.fillStyle = 'rgba(10,0,10,0.6)'; ctx.fillRect(0, R.y - 20, W, R.filas * R.paso + 40);
    if (im) ctx.drawImage(im, 140 + s, R.y + 2, 260, 260);
    else { ctx.fillStyle = '#5b6578'; ctx.fillRect(160 + s, R.y + 20, 220, 220); }
    hojas(ctx, t);
    barra(ctx, 40, R.y + 264, 460, 26, T.atasco / cabe, '#ff4d5e');
    texto(ctx, tr('{p} atascada', { p: PW.txt.pct(T.atasco / cabe) }), W / 2, R.y + 285, 20, '#fff');
    texto(ctx, tr('Trituradora · nivel {n}', { n: T.nivel + 1 }), W / 2, R.y - 24, 24, '#ff4d5e');
    texto(ctx, PW.txt.tiempo(T.intento), 470, R.y + 40, 30, '#ffd23f');
    texto(ctx, tr('Bocado x{n}', { n: fmtV(Math.round(T.multi * 100) / 100) }), 80, R.y + 40, 20, T.multi < 1 ? '#9aa0a8' : '#3ddc84');
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
    const B = PW.bonos.calcula(e), [dx, dy] = PW.efectos.sacudida(), H = PW.ui.alto;
    ctx.save();
    ctx.translate(dx, dy);
    fondo(ctx, e, H);
    equipo(ctx, e, B, t);
    e.r.planta.archivadores.forEach((a, i) => archivador(ctx, a, i));
    puestos(ctx, e, B, t);
    trituradora(ctx, e, t);
    correo(ctx, e, t);
    ctx.restore();
    PW.efectos.pinta(ctx, t, W, H);
  }
  // qué hay bajo el dedo en (x, y) del lienzo: { que: 'correo' }, { que: 'trabajador', k }, { que: 'archivador', i } (i = -1 si no queda
  // ninguno lleno) o null
  function toque(e, x, y) {
    const c = sitioCorreo(e);
    if (c && Math.hypot(x - c.x, y - c.y) < c.r + 18) return { que: 'correo' };
    for (let k = PW.bonos.liberadas(e) - 1; k >= 1; k--) { const p = enFila(k); if (Math.hypot(x - p.x, y - (p.y - 22)) < p.r + 4) return { que: 'trabajador', k }; }
    const col = Math.floor((x - R.x) / R.paso), fila = Math.floor((y - R.y) / R.paso);
    if (col < 0 || col >= R.cols || fila < 0 || fila >= R.filas) return null;
    return { que: 'archivador', i: llenoCerca(e, fila * R.cols + col) };
  }
  // si el hueco tocado ya está vacío, el vistazo va al archivador lleno más cercano: cualquier toque en el pasillo rebusca
  function llenoCerca(e, i) {
    const ar = e.r.planta.archivadores, lleno = k => ar[k] && ar[k].vida > 0;
    if (lleno(i)) return i;
    const lejos = k => Math.hypot(k % R.cols - i % R.cols, Math.floor(k / R.cols) - Math.floor(i / R.cols));
    return ar.reduce((mejor, _, k) => (lleno(k) && (mejor < 0 || lejos(k) < lejos(mejor)) ? k : mejor), -1);
  }
  return { pinta, toque };
})();
