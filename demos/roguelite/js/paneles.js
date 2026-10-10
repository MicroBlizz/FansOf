// Fans of Roguelite · Los paneles de premios: elegir 1 de 3 habilidades (nueva o de más nivel), un objeto nuevo (equiparlo o
// venderlo, comparado con el que llevas) y el resumen al acabar la partida.
'use strict';

function panelHabilidad(habs, cofre) {
  Object.assign(PANEL, { modo: 'habilidad', habs, cofre, t0: RELOJ.t, elegida: -1 });
  return esperaEleccion().then(i => { PANEL.modo = 'log'; return i; });
}
function panelObjeto(id) {
  Object.assign(PANEL, { modo: 'objeto', obj: id, t0: RELOJ.t, elegida: -1 });
  return esperaEleccion().then(i => { PANEL.modo = 'log'; return i; });
}
function panelHabs(ctx, W, y0) {
  const t = RELOJ.t - PANEL.t0, L = medidaHabs(W);
  let y = y0 + 8;
  ondula(ctx, tr(PANEL.cofre ? '¡Premio! Elige una habilidad' : 'Elige una habilidad'), W / 2, y, 1, COL.oro, COL.naranja, 0, 1);
  y += LINEA + 4;
  const fh = L.fh;
  PANEL.habs.forEach((id, i) => {
    const hb = HABILIDADES[id], r = RAREZA[hb.rar], nv = nivelHab(H, id) + 1, k = sale(Math.max(0, Math.min(1, (t - i * 0.1) / 0.3)));
    const x = 6 + Math.round((1 - k) * W), w = W - 12, elegida = PANEL.elegida === i, otra = PANEL.elegida >= 0 && !elegida;
    BOTONES.push({ x, y, w, h: fh, f: () => escoge(i) });
    const dy = pulsado(x, y) ? 1 : 0;
    marco(ctx, x, y + dy, w, fh, otra ? COL.trayHi : elegida ? mezcla(r[2], '#ffffff', 0.25) : '#1c0f2e', elegida ? '#ffffff' : r[1]);
    ctx.fillStyle = r[2]; ctx.fillRect(x + 1, y + dy + 1, w - 2, 1);
    iconoCosa(ctx, id, x + 4, y + dy + Math.round((fh - 22) / 2), 22, nv - 1);
    escribe(ctx, tr(hb.n), x + 31, y + dy + 4, { c: r[1] });
    // «¡Nueva!» o el nivel, arriba a la derecha (en pequeño si con la letra normal pisa el nombre)
    const tag = nv > 1 ? formatea(tr('Nv {n}'), { n: nv }) : tr('¡Nueva!'), tagC = nv > 1 ? COL.oro : mezcla(r[1], '#26143c', 0.2), libre = w - 35 - anchoTexto(tr(hb.n));
    if (anchoTexto(tag) + 8 <= libre) escribe(ctx, tag, x + w - 4, y + dy + 4, { c: tagC, alin: 'der' });
    else escribeMini(ctx, tag, x + w - 4 - anchoMini(tag), y + dy + 2, tagC);
    L.cajas[i].forEach((l, j) => L.fd.pinta(ctx, l, x + 31, y + dy + 14 + j * L.fd.linea, COL.tinta));
    if (hb.rar === 'legendary' || hb.rar === 'epic') { const p = ((t * 0.7 + i * 0.3) % 1) * (w + fh) | 0, px = p < w ? x + p : x + w - 1, py = p < w ? y + dy : y + dy + (p - w); ctx.fillStyle = '#ffffff'; ctx.fillRect(px, py, 2, 1); ctx.fillRect(px, py, 1, 2); }
    y += fh + 3;
  });
  return y;
}
// con la letra normal si caben las tres enteras; si no, las explicaciones en pequeño
function medidaHabs(W, ideal) {
  const prueba = fd => {
    const cajas = PANEL.habs.map(id => fd.env(descHab(id, nivelHab(H, id) + 1), W - 48));
    const fh = Math.max(26, 16 + Math.max(...cajas.map(c => c.length)) * fd.linea);
    return { fd, cajas, fh, alto: 8 + LINEA + 4 + 3 * (fh + 3) + 3 };
  };
  if (ideal) return prueba(LETRAS.n);
  return eligeMedida([() => prueba(LETRAS.n), () => prueba(LETRAS.m)], 'Elige una habilidad');
}

// la ficha de un objeto: icono, nombre, hueco y lo que da (fd: la letra de la explicación)
const altoFicha = (id, w, fd) => Math.max(26, 15 + fd.env(descObjeto(id), w - 32).length * fd.linea);
function fichaObjeto(ctx, id, x, y, w, tenue, fd = LETRAS.n) {
  const o = OBJETOS[id], r = RAREZA[o.rar], ls = fd.env(descObjeto(id), w - 32), h = altoFicha(id, w, fd);
  marco(ctx, x, y, w, h, tenue ? '#1c0f2e' : mezcla(r[2], '#1c0f2e', 0.7), tenue ? '#3a2058' : r[1]);
  iconoCosa(ctx, id, x + 3, y + Math.round((h - 22) / 2), 22);
  escribe(ctx, tr(o.n), x + 29, y + 3, { c: tenue ? mezcla(r[1], '#26143c', 0.3) : r[1] });
  ls.forEach((l, j) => fd.pinta(ctx, l, x + 29, y + 13 + j * fd.linea, tenue ? COL.tenue : COL.tinta));
  return h;
}
function panelObj(ctx, W, y0) {
  const id = PANEL.obj, o = OBJETOS[id], viejo = H.objs[o.tipo], L = medidaObj(W);
  let y = y0 + 7;
  ondula(ctx, tr('¡Objeto nuevo!'), W / 2, y, 1, COL.oro, COL.naranja, 0, 1);
  y += LINEA + 3;
  escribe(ctx, tr(NOMBRE_HUECO[o.tipo]) + ' · ' + tr(RAREZA[o.rar][0]), W / 2, y, { alin: 'centro', c: COL.tenue }); y += LINEA + 1;
  y += fichaObjeto(ctx, id, 6, y, W - 12, false, L.fn) + 4;
  if (viejo) {
    escribe(ctx, tr('Ahora llevas:'), 8, y, { c: COL.tenue }); y += LINEA;
    y += fichaObjeto(ctx, viejo, 6, y, W - 12, true, L.fv) + 4;
  }
  const by = y + 1, bw = Math.floor((W - 18) / 2), venta = Math.round(precioVenta(id) * (1 + H.botin)), el = PANEL.elegida;
  let dy = botonPx(ctx, 6, by, bw, 24, el === 1 ? COL.trayHi : COL.naranja, COL.naranjaO, () => escoge(0));
  escribe(ctx, tr(viejo ? 'Cambiar' : 'Equipar'), 6 + bw / 2, by + 7 + dy, { alin: 'centro' });
  dy = botonPx(ctx, W - 6 - bw, by, bw, 24, el === 0 ? COL.trayHi : COL.azul, COL.azulO, () => escoge(1));
  const txt = tr('Vender'), tw = anchoTexto(txt) + 6 + anchoTexto(String(venta)) + 10, tx = Math.round(W - 6 - bw / 2 - tw / 2);
  escribe(ctx, txt, tx, by + 7 + dy); monedasEn(ctx, venta, tx + tw, by + 7 + dy);
  return by + 26;
}
// el nuevo y el que llevas, con la letra normal si cabe; si no, primero el que llevas en pequeño y luego los dos
function medidaObj(W, ideal) {
  const id = PANEL.obj, viejo = H.objs[OBJETOS[id].tipo], N = LETRAS.n, P = LETRAS.m;
  const prueba = (fn, fv) => ({ fn, fv, alto: 7 + LINEA + 3 + LINEA + 1 + altoFicha(id, W - 12, fn) + 4 + (viejo ? LINEA + altoFicha(viejo, W - 12, fv) + 4 : 0) + 1 + 26 + 3 });
  if (ideal) return prueba(N, N);
  return eligeMedida([() => prueba(N, N), () => prueba(N, P), () => prueba(P, P)], '¡Objeto nuevo!');
}

function altoFin(W) {
  const f = VIAJE.fin, gana = f && f.gana, m = VIAJE.mundo;
  const titulo = gana ? ['¡SurvivalBot despedido!', '¡NecroLord enterrado!', '¡El CEO, despedido!'][m] : '¡Te han despedido!';
  return 8 + envuelve(tr(titulo), W - 16, 2).length * 18 + 1 + 2 * LINEA + 2 + LINEA + 2 + (f && f.record ? LINEA + 1 : 0) + (f && f.abre ? LINEA + 1 : 0) + 2 + 24 + 34;
}
// cuánto sitio pide el panel de ahora (con la letra normal): si no lo hay, la escena se recorta para dárselo
function altoPanel(W) {
  if (!H) return 140;
  switch (PANEL.modo) {
    case 'opciones': return medidaElige(W, true).alto;
    case 'habilidad': return medidaHabs(W, true).alto;
    case 'objeto': return medidaObj(W, true).alto;
    case 'fin': return VIAJE.fin ? altoFin(W) : 140;
    default: return 140;
  }
}
function panelFin(ctx, W, y0) {
  const f = VIAJE.fin, gana = f && f.gana, m = VIAJE.mundo;
  let y = y0 + 8;
  const titulo = gana ? ['¡SurvivalBot despedido!', '¡NecroLord enterrado!', '¡El CEO, despedido!'][m] : '¡Te han despedido!';
  for (const l of envuelve(tr(titulo), W - 16, 2)) { ondula(ctx, l, W / 2, y, 2, gana ? COL.oro : '#ff8a94', gana ? COL.naranja : '#ff3348', 0, 1); y += 18; }
  y += 1;
  escribe(ctx, formatea(tr('{m} · día {n}/{t}'), { m: tr(MUNDOS[m].corto), n: f.dia, t: MUNDOS[m].dias }), W / 2, y, { alin: 'centro', c: COL.tenue }); y += LINEA;
  escribe(ctx, formatea(tr('Nivel {n} · {e} enemigos'), { n: H.nivel, e: H.derrotados }), W / 2, y, { alin: 'centro', c: COL.tenue }); y += LINEA + 2;
  const txt = formatea(tr('+{n} para La Madriguera'), { n: f.monedas }), tw = anchoTexto(txt) + 10;
  escribe(ctx, txt, Math.round(W / 2 - tw / 2) + 10, y, { c: COL.oro }); pintaSpr(ctx, SPR.icono.moneda, Math.round(W / 2 - tw / 2) + 4, y + 3); y += LINEA + 2;
  if (f.record) { ondula(ctx, tr('¡Nuevo récord!'), W / 2, y, 1, '#7be04a', '#2f9e3a', 0, 1); y += LINEA + 1; }
  if (f.abre) { ondula(ctx, formatea(tr('¡Nuevo mundo: {m}!'), { m: tr(MUNDOS[m + 1].corto) }), W / 2, y, 1, '#5aaeff', '#1d5fc9', 1, 1); y += LINEA + 1; }
  y += 2;
  const yTexto = y;
  if (PAN.H - 34 - y > 22) filaCosas(ctx, 6, y, W, 18, 1);
  const by = PAN.H - 32, bw = Math.floor((W - 18) / 2);
  botonTxt(ctx, 6, by, bw, 26, tr('Otra vez'), COL.naranja, COL.naranjaO, () => { sonido('elige'); partida(m); });
  botonTxt(ctx, W - 6 - bw, by, bw, 26, tr('La Madriguera'), COL.azul, COL.azulO, () => { sonido('elige'); volverMadriguera(); });
  return yTexto + 34;
}
