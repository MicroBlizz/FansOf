// Fans of Roguelite · La Madriguera: la casa de CrazyBunny es el menú. Arriba, la escena (la madriguera con su chimenea y el
// título); abajo, los paneles: inicio (Continuar, Jugar, Mejoras, Colección, Retos, Opciones), elegir mundo (y el nivel de
// despido), las mejoras para siempre, la colección (habilidades, objetos y enemigos que ya has visto), los retos y las opciones.
'use strict';

const MENU = { pag: 0, tab: 'h', sel: null, ent: null, borrar: 0 };

function volverMadriguera() {
  cancelaTodo();
  FX.length = 0; RIVAL = null; COMBATE.c = null; VIAJE.sueltas = []; ARDILLA.activa = false; H = null;
  Object.assign(VIAJE, { modo: 'menu', andando: false, cartel: null, fundido: 0, fin: null, mx: 0, fase: -1 });
  Object.assign(MENU, { pag: 0, sel: null, ent: null, borrar: 0 });
  PANEL.modo = 'inicio'; LOG.length = 0;
  preparaFondo(0, 0); FONDO.sigProp = Infinity;
  PROP = { tipo: 'madriguera', wx: Math.round(PAN.W * 0.68), x: 0, y: SUELO, z: 0, alto: 60, t0: RELOJ.t, anim: 'quieto' };
  CONEJO.x = Math.round(PAN.W * 0.22); CONEJO.z = 0; CONEJO.parpadeo = false; CONEJO.blanco = 0; ponAnim(CONEJO, 'quieto');
  musica('menu');
}
function irA(modo) { PANEL.modo = modo; PANEL.t0 = RELOJ.t; MENU.pag = 0; MENU.sel = null; MENU.ent = null; MENU.borrar = 0; sonido('toque'); }

// la escena del menú: la madriguera con humo, el título y (en la colección) el enemigo que miras
function pintaMadriguera(ctx, x) {
  sombra(ctx, x, 40, 0);
  pintaSpr(ctx, SPR.madriguera, x, SUELO + 4);
  for (let k = 0; k < 6; k++) { const ph = (RELOJ.t * 0.35 + k / 6) % 1, sx = x + 32 + Math.round(Math.sin(ph * 5 + k) * 2 + ph * 8), sy = SUELO - 48 - Math.round(ph * 30), r = 1 + Math.floor(ph * 3); circuloPx(ctx, sx, sy, r, ph < 0.5 ? '#e8e0f0' : '#b8b0d0'); }
}
function pintaMenuEscena(ctx) {
  const W = PAN.W;
  if (FX.some(e => e.tipo === 'bocadillo')) return;   // si el conejo está explicando algo, el título deja ver el bocadillo
  escribe(ctx, tr('Fans of'), W / 2, ESC.Y + 10, { esc: 2, alin: 'centro' });
  ondula(ctx, tr('Roguelite'), W / 2, ESC.Y + 28, 3, COL.oro, COL.naranja);
}

/* ---------- los paneles ---------- */
function pintaPanelMenu(ctx, W, y0, h) {
  const f = { inicio: panelInicio, mundos: panelMundos, mejoras: panelMejoras, coleccion: panelColeccion, retos: panelRetos, ajustes: panelAjustes }[PANEL.modo];
  if (f) f(ctx, W, y0, h);
}
function titulo(ctx, W, y, txt) { ondula(ctx, txt, W / 2, y, 1, COL.oro, COL.naranja, 0, 1); return y + LINEA + 5; }
function volver(ctx, W, y, a = 'inicio') { botonTxt(ctx, 6, y, 64, 20, tr('Volver'), COL.gris, COL.grisO, () => irA(a)); }

function panelInicio(ctx, W, y0, h) {
  const r = GUARDA.run, bs = [];
  if (r) bs.push([formatea(tr('Continuar · {m} · día {n}'), { m: tr(MUNDOS[r.mundo].corto), n: r.dia }), COL.naranja, COL.naranjaO, () => { sonido('elige'); partida(r.mundo, true); }]);
  bs.push([tr('Jugar'), r ? COL.azul : COL.naranja, r ? COL.azulO : COL.naranjaO, () => irA('mundos')]);
  bs.push([tr('Mejoras'), COL.verde, COL.verdeO, () => irA('mejoras')]);
  bs.push([tr('Colección'), COL.azul, COL.azulO, () => irA('coleccion')]);
  bs.push([formatea(tr('Retos {n}/{t}'), { n: retosHechos(), t: RETOS.length }), '#8a4ad6', '#4a1a7a', () => irA('retos')]);
  bs.push([tr('Opciones'), COL.gris, COL.grisO, () => irA('ajustes')]);
  const bh = Math.min(26, Math.floor((h - 12) / bs.length) - 3);
  let y = y0 + 7;
  bs.forEach(([t, c, o, f], i) => { const k = sale(Math.max(0, Math.min(1, (RELOJ.t - PANEL.t0 - i * 0.06) / 0.3))); botonTxt(ctx, 10 + Math.round((1 - k) * W), y, W - 20, bh, t, c, o, f); y += bh + 3; });
}

function panelMundos(ctx, W, y0, h) {
  let y = titulo(ctx, W, y0 + 7, tr('Elige mundo'));
  if (GUARDA.run) { for (const l of envuelve(tr('Tienes una partida a medias: si empiezas otra, se pierde.'), W - 16)) { escribe(ctx, l, W / 2, y, { alin: 'centro', c: '#ff8a94' }); y += LINEA; } y += 2; }
  const bh = Math.min(32, Math.floor((PAN.H - 30 - y) / 3) - 3), elegido = Math.max(1, GUARDA.nivelElegido || 1), hayNiveles = Math.max(...GUARDA.nivelMax) > 1;
  MUNDOS.forEach((M, i) => {
    // en qué nivel de despido jugarías este mundo (el elegido, o el más alto que tenga abierto) y si ya lo has ganado en ese nivel
    const abierto = i <= GUARDA.abierto, d = Math.min(elegido, GUARDA.nivelMax[i] || 1), gana = (GUARDA.ganadoNivel[i] || 0) >= d;
    const dy = botonPx(ctx, 6, y, W - 12, bh, abierto ? mezcla(M.color, '#26143c', 0.45) : COL.gris, abierto ? mezcla(M.color, OL, 0.6) : COL.grisO, () => {
      if (!abierto) { sonido('no'); return; }
      sonido('elige'); partida(i);
    });
    const nom = anchoTexto((i + 1) + '. ' + tr(M.n)) <= W - 12 - 30 ? tr(M.n) : tr(M.corto);   // si el nombre llega a la corona, el corto
    escribe(ctx, (i + 1) + '. ' + nom, 12, y + 4 + dy, { c: abierto ? COL.tinta : '#9a8ab0' });
    let sub;
    if (!abierto) sub = formatea(tr('Gana {m} para abrirlo'), { m: tr(MUNDOS[i - 1].corto) });
    else if (hayNiveles) sub = formatea(tr(gana ? 'Despido {d}: ¡superado!' : 'Despido {d}: sin superar'), { d });
    else if (gana) sub = tr('¡Superado!');
    else sub = GUARDA.record[i] ? formatea(tr('Récord: día {n}/{t}'), { n: GUARDA.record[i], t: M.dias }) : tr('Sin jugar');
    const ancho = W - 12 - 30;   // el texto no llega al dibujo de la derecha (candado o corona)
    if (bh >= 26) {
      const c = abierto ? (gana ? COL.oro : '#ffe8d8') : '#9a8ab0';
      if (anchoTexto(sub) <= ancho) escribe(ctx, sub, 12, y + 14 + dy, { c, borde: OL });
      else escribeMini(ctx, sub, 12, y + 16 + dy, c);
      if (abierto && d < elegido && bh >= 30) escribeMini(ctx, formatea(tr('AQUÍ AÚN NO HAY DESPIDO {n}'), { n: elegido }), 12, y + bh - 7 + dy, '#ffb0b8');
    }
    if (!abierto) pintaSpr(ctx, SPR.icono.candado, W - 18, y + bh / 2 + dy - 1);
    else if (gana) pintaSpr(ctx, SPR.icono.corona, W - 18, y + bh / 2 + dy - 1);
    y += bh + 3;
  });
  volver(ctx, W, PAN.H - 26);
  // el nivel de despido (cuando has ganado algún mundo): enemigos más duros y más monedas; cada mundo abre el suyo
  const topeNivel = Math.max(...GUARDA.nivelMax);
  if (topeNivel > 1) {
    const n = Math.max(1, Math.min(topeNivel, GUARDA.nivelElegido || 1)), cambia = d => { GUARDA.nivelElegido = Math.max(1, Math.min(topeNivel, n + d)); guarda(); sonido('toque'); };
    const yb = PAN.H - 26, xm = (94 + W - 24) / 2, cn = n > 1 ? '#ff8a94' : COL.tinta, et = tr('NIVEL DE DESPIDO');
    botonTxt(ctx, 76, yb, 16, 20, '<', COL.trayHi, OL, () => cambia(-1));
    escribeMini(ctx, et, Math.round(xm - anchoMini(et) / 2), yb + 1, COL.tenue);
    escribe(ctx, n + (n === 1 ? ' · ' + tr('normal') : ''), xm, yb + 9, { alin: 'centro', c: cn });
    botonTxt(ctx, W - 22, yb, 16, 20, '>', COL.trayHi, OL, () => cambia(1));
    TUTO_SITIO.despido = { x: 76, y: yb + DESPL, w: W - 22 + 16 - 76, h: 20 };
    tutorial('despido');
  }
}

// paginar: cuántos caben y botones ◄ ► abajo a la derecha
function paginas(ctx, W, total, caben) {
  const n = Math.max(1, Math.ceil(total / caben));
  MENU.pag = Math.min(MENU.pag, n - 1);
  if (n > 1) {
    const y = PAN.H - 26;
    botonTxt(ctx, W - 70, y, 28, 20, '<', COL.trayHi, OL, () => { MENU.pag = (MENU.pag + n - 1) % n; MENU.sel = null; sonido('toque'); });
    botonTxt(ctx, W - 34, y, 28, 20, '>', COL.trayHi, OL, () => { MENU.pag = (MENU.pag + 1) % n; MENU.sel = null; sonido('toque'); });
    escribe(ctx, (MENU.pag + 1) + '/' + n, W - 76, y + 6, { alin: 'der', c: COL.tenue });
  }
  return MENU.pag * caben;
}

function panelMejoras(ctx, W, y0) {
  let y = titulo(ctx, W, y0 + 7, tr('Mejoras para siempre'));
  const ids = Object.keys(MEJORAS), fh = 38, caben = Math.max(1, Math.floor((PAN.H - 32 - y) / (fh + 2)));
  const desde = paginas(ctx, W, ids.length, caben);
  ids.slice(desde, desde + caben).forEach(id => {
    const m = MEJORAS[id], nv = nvMejora(id), lleno = nv >= m.max, precio = costeMejora(id, nv), puede = !lleno && GUARDA.monedas >= precio;
    // toda la fila es el botón de comprar
    BOTONES.push({ x: 6, y, w: W - 12, h: fh, f: () => {
      if (!puede) { sonido('no'); return; }
      GUARDA.monedas -= precio; GUARDA.mejoras[id] = nv + 1; guarda();
      sonido('nivel'); chispas(CONEJO.x, SUELO - 30, 14, COL.oro, 100); anillo(CONEJO.x, SUELO - 30, 26, COL.oro, 0.35);
      rotulo(CONEJO.x, SUELO - 62, tr(m.n), COL.oro, 1.3); ponAnim(CONEJO, 'gana'); espera(1).then(() => ponAnim(CONEJO, 'quieto')).catch(() => {});
    } });
    const dy = pulsado(6, y) ? 1 : 0, yy = y + dy;
    marco(ctx, 6, yy, W - 12, fh, '#1c0f2e', lleno ? COL.oro : puede ? '#2f9e3a' : '#3a2058');
    marco(ctx, 9, yy + 9, 20, 20, '#3e2363');
    pintaSpr(ctx, SPR.icono['m_' + id], 19, yy + 19);
    escribe(ctx, tr(m.n), 33, yy + 3, { c: lleno ? COL.oro : COL.tinta });
    escribe(ctx, nv + '/' + m.max, W - 10, yy + 3, { alin: 'der', c: lleno ? COL.oro : COL.tenue });
    const bw = 40, bx = W - 10 - bw;
    const dm = formatea(tr(m.d), { v: m.v }), ln = envuelve(dm, bx - 37);
    if (ln.length <= 3) ln.forEach((l, j) => escribe(ctx, l, 33, yy + 13 + j * 8, { c: COL.tenue, borde: null }));
    else { const lm = envuelveMini(dm, bx - 37); if (lm.length > 3) corte(m.n); lm.forEach((l, j) => escribeMini(ctx, l, 33, yy + 14 + j * 7, COL.tenue)); }
    if (lleno) escribe(ctx, tr('MÁX'), bx + bw / 2, yy + 20, { alin: 'centro', c: COL.oro });
    else {
      marco(ctx, bx, yy + 14, bw, 16, puede ? COL.verde : COL.gris, puede ? COL.verdeO : COL.grisO);
      monedasEn(ctx, precio, bx + bw - 4, yy + 18, puede ? COL.oro : '#ff8a94');
    }
    y += fh + 2;
  });
  volver(ctx, W, PAN.H - 26);
}

function panelColeccion(ctx, W, y0) {
  let y = y0 + 6;
  // pestañas tan anchas como su nombre (y el sitio que sobra, repartido)
  const tabs = [['h', 'Habilidades'], ['o', 'Objetos'], ['e', 'Enemigos']], anchos = tabs.map(([, n]) => anchoTexto(tr(n)) + 8);
  const sobra = Math.max(0, (W - 12 - 4 - anchos.reduce((a, b) => a + b, 0)) / 3);
  let tx = 6;
  tabs.forEach(([k, n], i) => {
    const on = MENU.tab === k, w = Math.floor(anchos[i] + sobra);
    botonTxt(ctx, tx, y, w, 16, tr(n), on ? COL.naranja : COL.trayHi, on ? COL.naranjaO : OL, () => { MENU.tab = k; MENU.pag = 0; MENU.sel = null; MENU.ent = null; sonido('toque'); }, on ? COL.tinta : COL.tenue);
    tx += w + 2;
  });
  y += 20;
  const vistos = GUARDA.vistos[MENU.tab], detalle = 32;
  const lista = MENU.tab === 'h' ? Object.keys(HABILIDADES) : MENU.tab === 'o' ? Object.keys(OBJETOS) : Object.keys(ENEMIGOS);
  const alto = PAN.H - 30 - detalle - y;
  if (MENU.tab === 'e') {
    const filas = Math.max(1, Math.floor(alto / LINEA)), caben = filas * 2, desde = paginas(ctx, W, lista.length, caben), cw = Math.floor((W - 12) / 2);
    lista.slice(desde, desde + caben).forEach((id, i) => {
      const x = 8 + Math.floor(i / filas) * cw, yy = y + (i % filas) * LINEA, visto = vistos.includes(id), d = ENEMIGOS[id];
      BOTONES.push({ x, y: yy - 1, w: cw - 2, h: LINEA, f: () => { if (!visto) { sonido('no'); return; } MENU.sel = id; MENU.ent = { def: d, spr: d.spr, x: Math.round(PAN.W * 0.7), y: SUELO, z: d.vuela || 0, alto: d.alto, anim: 'quieto', t0: RELOJ.t }; sonido('toque'); } });
      const sel = MENU.sel === id;
      escribe(ctx, visto ? tr(d.n) : '???', x, yy, { c: sel ? COL.oro : visto ? (d.jefe ? '#ffb0b8' : d.mini ? COL.oro : COL.tinta) : '#6a4a9a' });
    });
  } else {
    const paso = 24, cols = Math.floor((W - 12) / paso), filas = Math.max(1, Math.floor(alto / paso)), caben = cols * filas, desde = paginas(ctx, W, lista.length, caben);
    const x0 = Math.round((W - cols * paso) / 2);
    lista.slice(desde, desde + caben).forEach((id, i) => {
      const x = x0 + (i % cols) * paso, yy = y + Math.floor(i / cols) * paso, visto = vistos.includes(id);
      BOTONES.push({ x, y: yy, w: 22, h: 22, f: () => { if (!visto) { sonido('no'); return; } MENU.sel = id; sonido('toque'); } });
      if (visto) iconoCosa(ctx, id, x, yy, 22); else { marco(ctx, x, yy, 22, 22, '#1c0f2e', '#3a2058'); escribe(ctx, '?', x + 11, yy + 8, { alin: 'centro', c: '#6a4a9a' }); }
      if (MENU.sel === id) { ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 1, yy - 1, 3, 1); ctx.fillRect(x - 1, yy - 1, 1, 3); ctx.fillRect(x + 20, yy + 22, 3, 1); ctx.fillRect(x + 22, yy + 20, 1, 3); }
    });
  }
  // la ficha de lo elegido
  const yd = PAN.H - 30 - detalle + 2, id = MENU.sel;
  if (id) {
    let n, col, d;
    if (MENU.tab === 'h') { const hb = HABILIDADES[id]; n = tr(hb.n); col = RAREZA[hb.rar][1]; d = descHab(id, 1); }
    else if (MENU.tab === 'o') { const o = OBJETOS[id]; n = tr(o.n) + ' · ' + tr(NOMBRE_HUECO[o.tipo]); col = RAREZA[o.rar][1]; d = descObjeto(id); }
    else { const e = ENEMIGOS[id]; n = tr(e.n); col = COL.oro; d = tr(e.llega); }
    escribe(ctx, n, 8, yd, { c: col });
    const ln = envuelve(d, W - 16);
    if (ln.length <= 2) ln.forEach((l, j) => escribe(ctx, l, 8, yd + 10 + j * 9, { c: COL.tenue, borde: null }));
    else { const lm = envuelveMini(d, W - 16); if (lm.length > 3) corte(n); lm.forEach((l, j) => escribeMini(ctx, l, 8, yd + 10 + j * 6, COL.tenue)); }
  } else {   // sin nada elegido: cuántos has visto (abajo no cabe: ahí van las flechas de las páginas)
    escribe(ctx, tr('Toca algo para verlo.'), 8, yd, { c: '#6a4a9a' });
    escribe(ctx, formatea(tr('{n} de {t}'), { n: lista.filter(id => vistos.includes(id)).length, t: lista.length }), 8, yd + 11, { c: COL.tenue });
  }
  volver(ctx, W, PAN.H - 26);
}

// los retos: lo cumplido en verde con su tic, lo pendiente en gris; las monedas que da cada uno a la derecha
function panelRetos(ctx, W, y0) {
  let y = titulo(ctx, W, y0 + 7, formatea(tr('Retos {n}/{t}'), { n: retosHechos(), t: RETOS.length }));
  const lineas = r => Math.min(2, envuelveMini(tr(r.d), W - 30).length), fh = 13 + 7 * Math.max(...RETOS.map(lineas));
  const caben = Math.max(1, Math.floor((PAN.H - 30 - y) / fh)), desde = paginas(ctx, W, RETOS.length, caben);
  RETOS.slice(desde, desde + caben).forEach(r => {
    const hecho = retoHecho(r.id);
    marco(ctx, 6, y, W - 12, fh - 2, hecho ? '#163a1c' : '#1c0f2e', hecho ? '#2f9e3a' : '#3a2058');
    if (hecho) { ctx.fillStyle = '#7be04a'; ctx.fillRect(10, y + 6, 1, 1); ctx.fillRect(11, y + 7, 1, 1); ctx.fillRect(12, y + 6, 1, 1); ctx.fillRect(13, y + 5, 1, 1); ctx.fillRect(14, y + 4, 1, 1); }
    escribe(ctx, tr(r.n), 18, y + 2, { c: hecho ? '#7be04a' : COL.tinta });
    monedasEn(ctx, r.premio, W - 10, y + 2, hecho ? '#7be04a' : COL.oro);
    envuelveMini(tr(r.d), W - 30).slice(0, 2).forEach((l, j) => escribeMini(ctx, l, 18, y + 12 + j * 7, hecho ? '#9ad08a' : COL.tenue));
    y += fh;
  });
  volver(ctx, W, PAN.H - 26);
}

function panelAjustes(ctx, W, y0) {
  let y = titulo(ctx, W, y0 + 7, tr('Opciones'));
  const fila = (txt, valor, f, col = COL.trayHi, colO = OL) => {
    const dy = botonPx(ctx, 6, y, W - 12, 18, col, colO, f);
    escribe(ctx, txt, 12, y + 4 + dy); if (valor) escribe(ctx, valor, W - 12, y + 4 + dy, { alin: 'der', c: COL.oro });
    y += 20;
  };
  fila(tr('Sonido'), tr(SON.on ? 'Sí' : 'No'), () => { sonidoInicia(); sonidoCambia(); sonido('toque'); });
  fila(tr('Velocidad'), RELOJ.vel > 1 ? 'x2' : 'x1', () => { RELOJ.vel = RELOJ.vel > 1 ? 1 : 2; GUARDA.vel = RELOJ.vel; guarda(); sonido('toque'); });
  fila(tr('Chat del directo'), tr(GUARDA.chatOff ? 'No' : 'Sí'), () => { GUARDA.chatOff = !GUARDA.chatOff; guarda(); sonido('toque'); });
  // cómo instalarlo te lo explica el conejo, en un bocadillo (en el panel no cabe entero)
  fila(tr(INSTALAR.yaInstalada() ? 'Ya está instalado' : 'Instalar en el móvil'), '', () => { sonido('toque'); const t = INSTALAR.instala(); if (t) { bocadillo(CONEJO, t, 9); sonido('voz'); } });
  const armado = performance.now() - MENU.borrar < 3000;
  fila(tr(armado ? '¿Seguro? Toca otra vez' : 'Borrar progreso'), '', () => {
    if (performance.now() - MENU.borrar < 3000) { borraTodo(); MENU.borrar = 0; sonido('boom'); tiembla(4); } else { MENU.borrar = performance.now(); sonido('alerta'); }
  }, armado ? '#c43a4a' : COL.trayHi, armado ? '#6a1020' : OL);
  // abajo: volver y la biblioteca, en la misma fila
  volver(ctx, W, PAN.H - 26);
  botonTxt(ctx, 74, PAN.H - 26, W - 80, 20, tr('Más juegos'), COL.azul, COL.azulO, () => { location.href = '../../#biblioteca'; });
}
// lo que pide cada página del menú: si no cabe, se recorta un poco el suelo de la escena
function altoMenu() { return PANEL.modo === 'ajustes' ? 22 + 5 * 20 + 30 : PANEL.modo === 'inicio' ? 7 + (GUARDA.run ? 6 : 5) * 21 + 6 : PANEL.modo === 'mundos' ? 22 + (GUARDA.run ? 22 : 0) + 3 * 29 + 30 : 0; }
