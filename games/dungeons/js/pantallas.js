// Fans of Dungeons · Las pantallas fuera de la partida: la portada (con los héroes respirando), elegir clase (con lo que
// libera cada hito), el final (el registro de despidos: quién te despidió, planta, turno y puntos) y la victoria.
'use strict';

const PORTADA = { sel: 0 };
function fondoPantalla(ctx) {
  const z = 'oficinas';
  for (let y = 0; y < PAN.H; y += TS) for (let x = 0; x < PAN.W; x += TS) ctx.drawImage(casilla(z, 'suelo', ((x + y) / TS) & 1), x, y);
  ctx.fillStyle = 'rgba(8,4,18,0.62)'; ctx.fillRect(0, 0, PAN.W, PAN.H);
}
function pintaPortada(ctx) {
  fondoPantalla(ctx);
  const W = PAN.W, cy = Math.round(PAN.H * 0.2);
  escribe(ctx, 'FANS OF', W / 2, cy - 26, { c: COL.oro, esc: 2, alin: 'centro', c2: '#ff8a2a' });
  escribe(ctx, 'DUNGEONS', W / 2, cy, { c: '#ffffff', esc: 3, alin: 'centro', c2: COL.neon });
  txt(ctx, tr('Roguelike por turnos · prototipo ') + NEWS[0].v, W / 2 - anchoTexto(tr('Roguelike por turnos · prototipo ') + NEWS[0].v) / 2, cy + 28, COL.apagado);
  // los héroes, respirando
  const fy = Math.round(PAN.H * 0.62), f = Math.floor(J.tiempo * 4) % 4;
  ['cybermarine', 'bunny', 'slyfox', 'necrolord'].forEach((n, i) => { const x = W / 2 + (i - 1.5) * Math.min(70, W * 0.23); ovaloPx(ctx, x, fy + 1, 14, 4, 'rgba(10,6,20,0.5)'); pintaFigura(ctx, n, x, fy, { anim: 'quieto', f: (f + i) % 4, izq: i >= 2 }); });
  const bw = Math.min(180, W - 40), bx = Math.round((W - bw) / 2);
  let y = fy + 14;
  if (hayPartida()) { boton(ctx, bx, y, bw, 22, { txt: tr('Continuar la partida') }, () => { if (!cargaPartida()) log(tr('No se pudo cargar.'), '#ff9aa4'); }); y += 26; }
  boton(ctx, bx, y, bw, 22, { txt: tr('Nueva partida') }, () => { J.modo = 'clase'; PORTADA.sel = 0; PORTADA.diario = false; }); y += 26;
  boton(ctx, bx, y, bw, 22, { txt: tr('Reto del día') + (mejorDiario() ? ' · ' + mejorDiario() : '') }, () => { J.modo = 'clase'; PORTADA.sel = 0; PORTADA.diario = true; }); y += 26;
  const tw = Math.floor((bw - 4) / 2);
  boton(ctx, bx, y, tw, 22, { txt: tr('Opciones') }, () => { J.modo = 'opciones'; J.panel = { tipo: 'opciones' }; });
  boton(ctx, bx + tw + 4, y, tw, 22, { txt: tr('Ayuda') }, () => { J.modo = 'ayuda'; J.panel = { tipo: 'ayuda', pag: 0 }; }); y += 26;
  boton(ctx, bx, y, tw, 22, { txt: tr('Registro') }, () => { J.modo = 'registro'; });
  boton(ctx, bx + tw + 4, y, tw, 22, { txt: tr('Taquilla') }, () => { J.modo = 'taquilla'; }); y += 26;
  if (GUARDA.record) txt(ctx, tr('Récord: ') + GUARDA.record + tr(' puntos'), W / 2 - anchoTexto(tr('Récord: ') + GUARDA.record + tr(' puntos')) / 2, y + 2, COL.oro);
  envuelve(tr('Un juego de la serie Fans Of · sin cajas de botín de verdad'), W - 16).forEach((l, i, a) => txt(ctx, l, W / 2 - anchoTexto(l) / 2, PAN.H - 12 - (a.length - 1 - i) * LH, COL.apagado));
}
function pintaClase(ctx) {
  fondoPantalla(ctx);
  const W = PAN.W; escribe(ctx, PORTADA.diario ? tr('RETO DEL DÍA') : tr('ELIGE HÉROE'), W / 2, 8, { c: COL.oro, alin: 'centro' });
  const n = CLASES_ORDEN.length, cw = Math.floor((W - 8 * (n + 1)) / n), top = 24, ch = Math.min(150, PAN.H * 0.36);
  CLASES_ORDEN.forEach((id, i) => {
    const C = CLASES[id], x = 8 + i * (cw + 8), libre = claseLibre(id), sel = PORTADA.sel === i;
    ctx.fillStyle = sel ? '#2a1a1a' : COL.panel; ctx.fillRect(x, top, cw, ch);
    ctx.fillStyle = sel ? COL.neon : COL.borde; ctx.fillRect(x, top, cw, 1); ctx.fillRect(x, top + ch - 1, cw, 1); ctx.fillRect(x, top, 1, ch); ctx.fillRect(x + cw - 1, top, 1, ch);
    if (libre) pintaFigura(ctx, id, x + cw / 2, top + ch * 0.62, { anim: 'quieto', f: (Math.floor(J.tiempo * 4) + i) % 4 });
    else { ctx.globalAlpha = 0.25; pintaFigura(ctx, id, x + cw / 2, top + ch * 0.62, { anim: 'quieto', f: 0 }); ctx.globalAlpha = 1; pintaRejilla(ctx, 'ui_calavera', x + cw / 2 - 3, top + ch * 0.4); }
    const estrecho = anchoTexto(C.nombre) > cw - 4, nom = estrecho ? C.nombre : corta(C.nombre, cw - 4), pap = corta(tr(C.papel), cw - 4);
    if (estrecho) escribeMini(ctx, nom, x + Math.round((cw - anchoMini(nom)) / 2), top + ch - 24, libre ? COL.texto : COL.apagado);
    else txt(ctx, nom, x + Math.round((cw - anchoTexto(nom)) / 2), top + ch - 26, libre ? COL.texto : COL.apagado);
    escribeMini(ctx, pap, x + Math.round((cw - anchoMini(pap)) / 2), top + ch - 12, COL.apagado);
    BOTONES.push({ x, y: top, w: cw, h: ch, f: () => { PORTADA.sel = i; } });
  });
  const C = CLASES[CLASES_ORDEN[PORTADA.sel]], libre = claseLibre(CLASES_ORDEN[PORTADA.sel]);
  let y = top + ch + 8;
  const L = (t, c) => { for (const l of envuelve(t, W - 16)) { txt(ctx, l, 8, y, c || COL.texto); y += LH; } y += 2; };
  L(C.nombre + ' · ' + tr(C.faccion), COL.oro);
  L(tr('Vida') + ' ' + C.vida + ' · ' + tr('Ataque') + ' ' + C.atq + ' · ' + tr('Defensa') + ' ' + C.def + ' · ' + tr('Café') + ' ' + C.cafe + ' · ' + tr('Visión') + ' ' + C.vision + (C.alcance > 1 ? ' · ' + tr('Alcance') + ' ' + C.alcance : ''));
  L(tr(C.habilidad) + ' (' + C.coste + ' ' + tr('Café') + '): ' + tr(C.habDesc));
  L(tr(C.pasiva) + ': ' + tr(C.pasivaDesc));
  if (!libre) L(tr('Bloqueado. Se libera: ') + tr(C.libera), '#ff9aa4');
  if (PORTADA.diario) { L(tr('La misma torre para todos hoy, con dos reglas raras:'), '#c8a040'); for (const id of modsDelDia(semillaDelDia())) L(tr(MODS[id].nombre) + ': ' + tr(MODS[id].desc), '#c8a040'); }
  const bw = Math.min(160, Math.floor((W - 24) / 2));
  boton(ctx, 8, PAN.H - 26, bw, 22, { txt: tr('Volver') }, () => { J.modo = 'titulo'; });
  boton(ctx, W - 8 - bw, PAN.H - 26, bw, 22, { txt: tr('¡A la torre!'), apagado: !libre }, empiezaClase);
}
// empieza la partida con la clase elegida (normal o el reto del día)
function empiezaClase() { const c = CLASES_ORDEN[PORTADA.sel]; if (!claseLibre(c)) return; if (PORTADA.diario) nuevaPartida(c, semillaDelDia(), true); else nuevaPartida(c); }
function pintaFin(ctx) {
  const f = J.fin; if (!f) { J.modo = 'titulo'; return; }
  fondoPantalla(ctx);
  const W = PAN.W; let y = Math.round(PAN.H * 0.1);
  if (f.victoria) { escribe(ctx, tr('¡CEO DESPEDIDO!'), W / 2, y, { c: COL.oro, esc: 2, alin: 'centro', c2: '#ff8a2a' }); y += 24; for (const l of envuelve(tr('La torre es de los fans. Hasta la próxima compra hostil.'), W - 16)) { txt(ctx, l, W / 2 - anchoTexto(l) / 2, y, COL.texto); y += LH; } y -= LH; }
  else { escribe(ctx, tr('DESPEDIDO'), W / 2, y, { c: COL.vida, esc: 2, alin: 'centro', c2: '#5a0a14' }); y += 24; for (const l of envuelve(tr('Microblizz te agradece los servicios prestados.'), W - 16)) { txt(ctx, l, W / 2 - anchoTexto(l) / 2, y, COL.texto); y += LH; } y -= LH; }
  y += 18;
  pintaFigura(ctx, f.clase, W / 2, y + 60, { anim: f.victoria ? 'quieto' : 'muerto', f: Math.floor(J.tiempo * 4) % 4 }); y += 70;
  const L = [];
  if (!f.victoria) L.push(fmt(tr('Te despidió: {q}'), { q: f.quien }));
  L.push(fmt(tr('Planta {p} · turno {t} · nivel {n}'), { p: f.planta, t: f.turno, n: f.nivel }));
  L.push(fmt(tr('Puntos: {n}'), { n: f.puntos }) + (f.puntos >= GUARDA.record ? ' ' + tr('(¡récord!)') : ''));
  L.push(tr('Semilla: ') + f.semilla);
  if (f.diario) L.push(fmt(tr('Reto del día · tu mejor hoy: {n}'), { n: mejorDiario() }));
  for (const l of L) { txt(ctx, l, W / 2 - anchoTexto(l) / 2, y, COL.texto); y += LH; }
  y += 4;
  for (const l of lineasResumen()) { escribeMini(ctx, l, W / 2 - anchoMini(l) / 2, y, COL.apagado); y += 10; }
  if (f.bonus) { const l = fmt(tr('+{n} Bonus de empresa para la Taquilla de RR. HH.'), { n: f.bonus }); y += 4; escribeMini(ctx, l, W / 2 - anchoMini(l) / 2, y, COL.oro); }
  if (f.victoria) for (let i = 0; i < 40; i++) {   // confeti de fiesta
    const s = i * 97.13, x = (s * 13.7 + J.tiempo * (20 + (i % 5) * 6)) % W, cy = (s * 7.3 + J.tiempo * (40 + (i % 7) * 9)) % PAN.H;
    ctx.fillStyle = ['#ff8ad0', '#ffd040', '#5ef2ff', '#5fd36a', '#ff9a2a'][i % 5]; ctx.fillRect(Math.round(x), Math.round(cy), 2 + (i % 2), 2);
  }
  const bw = Math.min(160, Math.floor((W - 24) / 2));
  boton(ctx, 8, PAN.H - 26, bw, 22, { txt: tr('Portada') }, () => { J.modo = 'titulo'; });
  boton(ctx, W - 8 - bw, PAN.H - 26, bw, 22, { txt: tr('Otra vez') }, () => { J.modo = 'clase'; });
}
function pintaRegistro(ctx) {
  fondoPantalla(ctx);
  const W = PAN.W; escribe(ctx, tr('REGISTRO DE DESPIDOS'), W / 2, 8, { c: COL.oro, alin: 'centro' });
  let y = 26;
  if (!GUARDA.registro.length) txt(ctx, tr('Todavía nadie ha sido despedido. Qué raro.'), 8, y, COL.apagado);
  const hitos = Object.keys(HITOS), yHitos = PAN.H - 34 - (hitos.length + 1) * LH - hitos.filter(k => HITOS[k].libera).length * 8;
  // las partidas: dos líneas cada una (quién y dónde; los puntos), mientras quepan encima de los hitos
  for (const r of GUARDA.registro.slice(0, 10)) {
    const l1 = (CLASES[r.clase] ? CLASES[r.clase].nombre : r.clase) + ' · ' + fmt(tr('planta {p} · turno {t}'), { p: r.planta, t: r.turno });
    const l2 = fmt(tr('{q} · {n} puntos'), { q: r.quien, n: r.puntos });
    if (y + LH * 2 + 2 > yHitos - LH) break;
    txt(ctx, corta(l1, W - 16), 8, y, r.victoria ? COL.oro : COL.texto); escribeMini(ctx, corta(l2, W - 16), 12, y + LH, COL.apagado); y += LH + 9;
  }
  y = yHitos; txt(ctx, tr('HITOS'), 8, y, COL.oro); y += LH;
  for (const k of hitos) {   // una casilla dibujada (marcada o no) y el texto, con la clase que libera
    const h = GUARDA.hitos[k];
    ctx.fillStyle = h ? COL.oro : COL.borde; ctx.fillRect(8, y, 7, 7); ctx.fillStyle = COL.panel; ctx.fillRect(9, y + 1, 5, 5); if (h) { ctx.fillStyle = COL.oro; ctx.fillRect(10, y + 2, 3, 3); }
    txt(ctx, corta(tr(HITOS[k].texto), W - 28), 20, y, h ? COL.texto : COL.apagado); y += LH;
    if (HITOS[k].libera) { escribeMini(ctx, tr('libera a') + ' ' + CLASES[HITOS[k].libera].nombre, 20, y - 1, h ? COL.oro : '#6a5a50'); y += 8; }
  }
  boton(ctx, W / 2 - 40, PAN.H - 26, 80, 22, { txt: tr('Volver') }, () => { J.modo = 'titulo'; });
}
