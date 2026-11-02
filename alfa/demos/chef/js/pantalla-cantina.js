// Fans of Chef · PANTALLA DE LA CANTINA: la escena de la oficina-comedor, lo que hay en cada estación (ingredientes, ollas con su
// contenido y su barra, platos), el cocinero con lo que lleva, el rótulo de lo que hará el botón A, y el marcador: las comandas con su
// barra de paciencia, el reloj, los puntos y el combo, y la despensa.
'use strict';

// un ítem (lo que se lleva en las manos o hay en una estación): ingrediente crudo o cortado, plato vacío o con receta, lo quemado
function pintaItem(ctx, it, x, y, flota) {
  x = Math.round(x); y = Math.round(y);
  if (it.tipo === 'ing') {
    pintaSpr(ctx, 'ing_' + it.que, x, y + 6, { que: it.que });
    if (it.cortado) { caja(ctx, x - 6, y - 1, 12, 1, PALETA.W); caja(ctx, x - 1, y - 6, 1, 12, PALETA.W); }   // la cruz del corte
  } else if (it.tipo === 'plato') {
    circulo(ctx, x, y, 8, PALETA.K); circulo(ctx, x, y, 7, PALETA.w); circulo(ctx, x, y, 5, PALETA.W);
    if (it.receta) { const R = RECETAS[it.receta]; circulo(ctx, x, y, 4, R.color); circulo(ctx, x - 1, y - 1, 1, PALETA.W); }
  } else if (it.tipo === 'quemado') { circulo(ctx, x, y, 6, PALETA.K); circulo(ctx, x, y, 5, PALETA.N); caja(ctx, x - 2, y - 9, 1, 3, PALETA.s); caja(ctx, x + 1, y - 10, 1, 4, PALETA.s); }
  void flota;
}
function pintaEstaciones(ctx, cam) {
  const cerca = CANTINA.cerca;
  for (const e of CANTINA.estaciones) {
    const x0 = e.r[0] - cam.x, y0 = e.r[1] - cam.y, w = e.r[2] - e.r[0], h = e.r[3] - e.r[1], cx = x0 + w / 2;
    if (e === cerca) { ctx.globalAlpha = 0.6 + Math.sin(PAN.t * 8) * 0.2; cajaMarco(ctx, x0 - 2, y0 - 2, w + 4, h + 4, 'rgba(0,0,0,0)', PALETA.Y); ctx.globalAlpha = 1; }
    if (e.tipo === 'caja') { const n = JORNADA.despensa[e.que] || 0; pintaSpr(ctx, 'ing_' + e.que, cx, y0 + 14, { que: e.que }); letra(ctx, 'x' + n, cx, y0 + h - 2, n ? PALETA.W : PALETA.R, 'center', 7); }
    else if (e.tipo === 'tabla' || e.tipo === 'encimera') {
      if (e.item) { pintaItem(ctx, e.item, cx, y0 + h / 2 - 4); if (e.tipo === 'tabla' && !e.item.cortado && e.item.progreso > 0) barra(ctx, x0, y0 - 6, w, e.item.progreso, PALETA.G); }
    } else if (e.tipo === 'fuego') {
      // el contenido, en iconos pequeños sobre el fuego; la barra de cocción (naranja) o de quemado (roja)
      e.contenido.forEach((q, i) => pintaSpr(ctx, 'ing_' + q, x0 + 8 + i * 10, y0 - 2, { que: q }));
      if (e.estado === 'cocinando') { barra(ctx, x0, y0 - 14, w, e.tt / CIFRAS.cocinarSeg, PALETA.O); vapor(ctx, cx, y0, PAN.t); }
      else if (e.estado === 'hecha') { const q = e.tt / CIFRAS.quemarSeg; barra(ctx, x0, y0 - 14, w, q, q > 0.5 ? PALETA.R : PALETA.Y); letra(ctx, '!', cx, y0 - 16, q > 0.75 && Math.floor(PAN.t * 6) % 2 ? PALETA.R : PALETA.G, 'center', 8); vapor(ctx, cx, y0, PAN.t); }
      else if (e.estado === 'quemada') { humo(ctx, cx, y0, PAN.t); }
    } else if (e.tipo === 'platos') { for (let i = 0; i < 3; i++) { circulo(ctx, cx, y0 + h / 2 - i * 2, 7, PALETA.K); circulo(ctx, cx, y0 + h / 2 - i * 2, 6, PALETA.w); } }
    else if (e.tipo === 'ventanilla') { letra(ctx, tr('SERVIR'), cx, y0 - 4, PALETA.Y, 'center', 6); }
  }
}
function barra(ctx, x, y, w, f, color) { caja(ctx, x, y, w, 4, PALETA.K); caja(ctx, x + 1, y + 1, Math.round((w - 2) * clamp(f, 0, 1)), 2, color); }
function vapor(ctx, x, y, t) { for (let k = 0; k < 3; k++) { const p = (t * 0.8 + k * 0.33) % 1; ctx.globalAlpha = 0.5 * (1 - p); circulo(ctx, x - 6 + k * 6 + Math.sin(t * 2 + k) * 2, y - 18 - p * 14, 2, PALETA.w); } ctx.globalAlpha = 1; }
function humo(ctx, x, y, t) { for (let k = 0; k < 3; k++) { const p = (t * 0.6 + k * 0.33) % 1; ctx.globalAlpha = 0.6 * (1 - p); circulo(ctx, x - 6 + k * 6 + Math.sin(t * 3 + k) * 3, y - 16 - p * 18, 3, PALETA.N); } ctx.globalAlpha = 1; }

function pintaCantina(ctx, W, H) {
  enfoca();
  const cam = { x: Math.round(CAM.x), y: Math.round(CAM.y), w: W, h: H };
  pintaSala(ctx, cam);
  const lista = cosasConAltura(cam);
  lista.push({ y: J.y + 1, pinta: c => pintaJugador(c, cam) });
  lista.sort((a, b) => a.y - b.y); for (const o of lista) o.pinta(ctx);
  pintaEstaciones(ctx, cam);
  pintaParticulas(ctx, cam); pintaNumeros(ctx, cam);
  // el rótulo de la acción
  const a = accionDe(CANTINA.cerca);
  if (a) { marcoMadera(ctx, W / 2 - 64, H - 36, 128, 13); letraCabe(ctx, (ENTRADA.tactil ? 'A: ' : 'J: ') + a.txt, W / 2, H - 26, 120, a.no ? PALETA.r : PALETA.Y, 'center', 7); }
  else if (CANTINA.cerca && CANTINA.cerca.tipo === 'tabla' && CANTINA.cerca.item && !CANTINA.cerca.item.cortado && !J.mano) { marcoMadera(ctx, W / 2 - 64, H - 36, 128, 13); letraCabe(ctx, (ENTRADA.tactil ? tr('Mantén B: cortar') : tr('Mantén K: cortar')), W / 2, H - 26, 120, PALETA.Y, 'center', 7); }
  pintaMarcadorCantina(ctx, W, H);
  pintaMandos(ctx, W, H);
}
function pintaMarcadorCantina(ctx, W, H) {
  // las comandas, arriba a la izquierda: receta, iconos de lo que lleva y la barra de paciencia
  const n = CANTINA.comandas.length, ancho = Math.min(W - 64, 124);
  marcoMadera(ctx, 2, 2, ancho, 14 + Math.max(1, n) * 20);
  letra(ctx, tr('COMANDAS'), 6, 12, PALETA.Y, 'left', 8, false);
  if (!n) letra(ctx, tr('(nadie espera)'), 6, 26, PALETA.s, 'left', 7, false);
  CANTINA.comandas.forEach((c, i) => {
    const y = 16 + i * 20, R = RECETAS[c.receta], f = c.t / c.dur;
    cajaMarco(ctx, 5, y, ancho - 6, 18, i === 0 ? 'rgba(90,60,20,0.9)' : 'rgba(30,18,8,0.9)', i === 0 ? PALETA.Y : PALETA.K);
    letraCabe(ctx, tr(R.nombre), 8, y + 8, ancho - 44, PALETA.W, 'left', 6);
    let ix = ancho - 36; for (const k in R.lleva) for (let j = 0; j < R.lleva[k]; j++) { pintaSpr(ctx, 'ico_' + k, ix, y + 11, { que: k }); ix += 10; }
    caja(ctx, 8, y + 12, ancho - 14, 4, PALETA.K); caja(ctx, 9, y + 13, Math.round((ancho - 16) * f), 2, f > 0.5 ? PALETA.G : f > 0.25 ? PALETA.Y : PALETA.R);
  });
  // arriba a la derecha: reloj, puntos y combo
  marcoMadera(ctx, W - 58, 2, 56, 36);
  const seg = Math.max(0, Math.ceil(CIFRAS.servicioSeg - CANTINA.t)), m = Math.floor(seg / 60), s = ('0' + seg % 60).slice(-2);
  letra(ctx, m + ':' + s, W - 30, 13, seg <= 10 && Math.floor(PAN.t * 4) % 2 ? PALETA.R : PALETA.Y, 'center', 8, false);
  letra(ctx, String(CANTINA.puntos), W - 30, 24, PALETA.W, 'center', 8, false);
  letra(ctx, 'x' + CANTINA.combo, W - 30, 34, CANTINA.combo > 1 ? PALETA.G : PALETA.s, 'center', 7, false);
  // abajo a la izquierda: la despensa
  const tipos = Object.keys(INGREDIENTES);
  marcoMadera(ctx, 2, H - 40, 6 + tipos.length * 26, 18);
  tipos.forEach((k, i) => { pintaSpr(ctx, 'ico_' + k, 10 + i * 26, H - 25, { que: k }); letra(ctx, 'x' + (JORNADA.despensa[k] || 0), 16 + i * 26, H - 27, PALETA.W, 'left', 7, false); });
  if (CANTINA.aviso) { ctx.globalAlpha = Math.min(1, CANTINA.aviso.t * 2); letraCabe(ctx, CANTINA.aviso.txt, W / 2, H * 0.22, W - 8, CANTINA.aviso.color, 'center', 7); ctx.globalAlpha = 1; }
}
