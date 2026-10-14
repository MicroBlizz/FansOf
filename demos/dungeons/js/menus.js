// Fans of Dungeons · La barra de abajo, los mensajes y los menús (0.2.6). La barra cambia de lado para diestros y zurdos: lo
// que más se usa (Explorar, Poder, Esperar) queda bajo el pulgar. El botón del menú vive junto a los mensajes, y en su sitio
// de la barra está Mirar. Opciones se abre desde la portada y desde el menú de la partida. La ayuda va por páginas para que
// ningún texto quede debajo de los botones.
'use strict';

const zurdo = () => GUARDA.mano === 'zurdo';
const MENU_BTN = 28;   // el lado del botón del menú, junto a los mensajes
const abreMenu = () => { if (J.modo !== 'juego') return; VISTA.mirar = false; J.panel = { tipo: 'pausa', sel: 0 }; J.modo = 'panel'; };

/* ---------- los mensajes, con el botón del menú a un lado ---------- */
function pintaLog(ctx) {
  const y0 = PAN.H - BOT_H - LOG_H, W = PAN.W, mx = zurdo() ? W - MENU_BTN - 3 : 3, tx = zurdo() ? 4 : MENU_BTN + 8, ancho = W - MENU_BTN - 14;
  ctx.fillStyle = COL.panel; ctx.fillRect(0, y0, W, LOG_H); ctx.fillStyle = COL.borde; ctx.fillRect(0, y0, W, 1);
  const lineas = [];
  for (let i = J.log.length - 1; i >= 0 && lineas.length < 3; i--) {
    const l = J.log[i], partes = envuelve(l.t, ancho);
    for (let k = partes.length - 1; k >= 0 && lineas.length < 3; k--) lineas.unshift({ t: partes[k], c: i === J.log.length - 1 ? l.c : mezcla(l.c, '#120d12', 0.45) });
  }
  lineas.forEach((l, i) => txt(ctx, l.t, tx, y0 + 4 + i * LH, l.c));
  boton(ctx, mx, y0 + Math.round((LOG_H - MENU_BTN) / 2), MENU_BTN, MENU_BTN, { icono: 'ui_menu', escala: 2 }, abreMenu);
}

/* ---------- la barra de abajo ---------- */
// orden lógico (el del tutorial): 0 Esperar/Subir, 1 Explorar, 2 Poder, 3 Café, 4 Mochila, 5 Mirar. Se pinta en el orden de la mano
const ORDEN_DIESTRO = [5, 4, 3, 0, 2, 1], ORDEN_ZURDO = [1, 2, 0, 3, 4, 5];
function pintaBotones(ctx) {
  const h = J.heroe, C = CLASES[h.clase], W = PAN.W, gap = 3, y = PAN.H - BOT_H + 3, hb = BOT_H - 6;
  const n = 6, w = Math.floor((W - gap * (n + 1)) / n), conTxt = w >= 70;
  const rapido = h.mochila.findIndex(o => OBJETOS[o.id].tipo === 'consumible' && o.id !== 'rinonera');
  const B = (icono, t, etq, o, f) => [Object.assign({ icono, txt: conTxt ? t : '', etq: conTxt ? '' : etq }, o), f];
  const lista = [
    enM(J.mapa, h.x, h.y) === T.SUBIDA
      ? B('ui_escalera', tr('Subir'), tr('Subir'), { activo: true }, () => subir())
      : B('ui_reloj', tr('Esperar'), tr('Esperar'), {}, () => { h.camino = []; h.explorando = false; esperar(); }),
    B('ui_ojo', tr('Explorar'), tr('Explorar'), { activo: h.explorando }, () => { if (h.camino.length) { h.camino = []; h.explorando = false; } else explorar(); }),
    B('ui_rayo', tr(C.habilidad), tr('Poder'), { apagado: h.enfria > 0 || h.cafe < costePoder(h), num: h.enfria > 0 ? h.enfria : costePoder(h) }, () => usaHabilidad()),
    B('ui_cafe', tr('Café'), tr('Café'), { apagado: rapido < 0, num: h.mochila.filter(o => OBJETOS[o.id].tipo === 'consumible').length || undefined }, () => { if (rapido >= 0 && usaObjeto(h, rapido)) accion(); }),
    B('ui_bolsa', tr('Mochila'), tr('Mochila'), { num: h.mochila.length }, () => { VISTA.mirar = false; J.panel = { tipo: 'mochila', sel: -1 }; J.modo = 'panel'; }),
    B('ui_lupa', tr('Mirar'), tr('Mirar'), { activo: VISTA.mirar }, () => { VISTA.mirar = !VISTA.mirar; if (VISTA.mirar) log(tr('Toca algo del mapa para ver su ficha.'), '#8c879a'); }),
  ];
  BARRA.length = 0;
  (zurdo() ? ORDEN_ZURDO : ORDEN_DIESTRO).forEach((k, pos) => {
    const x = gap + pos * (w + gap), [o, f] = lista[k];
    boton(ctx, x, y, w, hb, o, f); BARRA[k] = { x, y, w, h: hb };
  });
}

/* ---------- el menú de la partida ---------- */
function pintaPausa(ctx, p) {
  const c = cuadroPanel(ctx, tr('MENÚ'));
  let y = c.y + 24; const w = Math.min(200, c.w - 16), x = c.x + Math.round((c.w - w) / 2);
  const B = (t, f) => { boton(ctx, x, y, w, 24, { txt: t }, f); y += 30; };
  B(tr('Continuar'), cierraPanel);
  B(tr('Ver el mapa'), () => { J.panel = { tipo: 'mapa' }; });
  B(tr('Opciones'), () => { J.panel = { tipo: 'opciones', vuelve: 'pausa' }; });
  B(tr('Ayuda'), () => { J.panel = { tipo: 'ayuda', pag: 0 }; });
  y += 8;
  B(p.confirma ? tr('¿Seguro? Se pierde todo') : tr('Abandonar partida'), () => { if (!p.confirma) { p.confirma = true; return; } finPartida('abandono', null); J.panel = null; });
  const pie = tr('Semilla') + ' ' + J.semilla + ' · ' + tr('turno') + ' ' + J.turno + ' · v' + NEWS[0].v;
  escribeMini(ctx, pie, c.x + 6, c.y + c.h - 9, COL.apagado);
}

/* ---------- opciones (desde la portada o desde el menú) ---------- */
function filasOpciones(p) {
  return [
    [tr('Sonido: ') + (GUARDA.sonido !== false ? tr('sí') : tr('no')), () => { GUARDA.sonido = GUARDA.sonido === false; sonidoCambia(GUARDA.sonido); guardaMeta(); }],
    [tr('Música: ') + (GUARDA.musica !== false ? tr('sí') : tr('no')), () => { GUARDA.musica = GUARDA.musica === false; musicaCambia(GUARDA.musica); guardaMeta(); }],
    [tr('Idioma: ') + (IDIOMA_FD.es === 'es' ? 'Español' : 'English'), () => { cambiaIdioma(IDIOMA_FD.es === 'es' ? 'en' : 'es'); TEXTO_CACHE.clear(); MINI_CACHE.clear(); if (J.heroe) { J.log = []; log(tr('Idioma cambiado. Los mensajes nuevos salen ya en este idioma.'), '#c8a040'); } }],
    [tr('Mano: ') + (zurdo() ? tr('zurdo') : tr('diestro')), () => { GUARDA.mano = zurdo() ? 'diestro' : 'zurdo'; guardaMeta(); }],
    [tr('Velocidad: ') + (GUARDA.vel === 2 ? tr('rápida') : tr('normal')), () => { GUARDA.vel = GUARDA.vel === 2 ? 1 : 2; guardaMeta(); }],
    [tr('Minimapa: ') + (VISTA.minimapa ? tr('sí') : tr('no')), () => { VISTA.minimapa = !VISTA.minimapa; }],
    [INSTALAR.yaInstalada() ? tr('Ya está instalado') : tr('Instalar en el móvil'), () => { const t = INSTALAR.instala(); if (t) abreAviso(tr('INSTALAR'), t, p); }],
    [tr('Ver el tutorial otra vez'), () => { iniciaTuto(true); if (J.modo === 'panel' && J.heroe) cierraPanel(); else abreAviso(tr('TUTORIAL'), tr('Lola te lo enseña otra vez en tu próxima partida.'), p); }],
  ];
}
// el cuadro de los menús: en la partida, sobre el mapa; en la portada, casi toda la pantalla
function cuadroMenu(ctx, titulo) {
  if (J.modo === 'panel') return cuadroPanel(ctx, titulo);
  fondoPantalla(ctx);
  const c = { x: 6, y: 6, w: PAN.W - 12, h: PAN.H - 12 };
  ctx.fillStyle = COL.panel; ctx.fillRect(c.x, c.y, c.w, c.h);
  ctx.fillStyle = COL.borde; ctx.fillRect(c.x, c.y, c.w, 1); ctx.fillRect(c.x, c.y + c.h - 1, c.w, 1); ctx.fillRect(c.x, c.y, 1, c.h); ctx.fillRect(c.x + c.w - 1, c.y, 1, c.h);
  escribe(ctx, titulo, c.x + c.w / 2, c.y + 6, { c: COL.oro, alin: 'centro' });
  return c;
}
function vuelveDe(p) {
  if (J.modo === 'panel') { J.panel = p && p.vuelve === 'opciones' ? { tipo: 'opciones', vuelve: 'pausa' } : { tipo: 'pausa', sel: 0 }; return; }
  if (p && p.vuelve === 'opciones') { J.modo = 'opciones'; J.panel = { tipo: 'opciones' }; return; }
  J.modo = 'titulo'; J.panel = null;
}
function pintaOpciones(ctx, p = {}) {
  const c = cuadroMenu(ctx, tr('OPCIONES'));
  const filas = filasOpciones(p), yb = c.y + c.h - 30;
  const alto = Math.min(26, Math.floor((yb - c.y - 26) / filas.length) - 4);
  let y = c.y + 24; const w = Math.min(220, c.w - 16), x = c.x + Math.round((c.w - w) / 2);
  for (const [t, f] of filas) { boton(ctx, x, y, w, alto, { txt: t }, f); y += alto + 4; }
  boton(ctx, c.x + c.w - 84, yb + 4, 78, 22, { txt: tr('Volver') }, () => vuelveDe(p));
}

/* ---------- un aviso con su texto (cómo instalar, por ejemplo) ---------- */
function abreAviso(titulo, texto, desde) {
  const p = { tipo: 'aviso', titulo, texto, vuelve: 'opciones' };
  if (J.modo === 'panel') J.panel = p; else { J.modo = 'aviso'; J.panel = p; }
}
function pintaAviso(ctx, p) {
  const c = cuadroMenu(ctx, p.titulo || '');
  let y = c.y + 26;
  for (const l of envuelve(p.texto, c.w - 16)) { txt(ctx, l, c.x + 8, y, COL.texto); y += LH; }
  boton(ctx, c.x + c.w - 84, c.y + c.h - 26, 78, 22, { txt: tr('Volver') }, () => vuelveDe(p));
}

/* ---------- la ayuda, por páginas ---------- */
function textosAyuda() {
  return [
    tr('Cada paso o golpe es un turno: entonces se mueven todos los enemigos de la planta.'),
    tr('Toca una casilla para ir andando hasta ella; toca a un enemigo pegado para pegarle. Con teclado: flechas o WASD, espacio para esperar.'),
    tr('Sube por la escalera (botón Subir o Intro). Cada cuatro plantas, un Jefe de planta la vigila.'),
    tr('Los cafés curan y dan Café (el maná). Los pergaminos hacen cosas raras. La mochila tiene 18 huecos para objetos (crece con las riñoneras) y 12 aparte para cafés y pergaminos.'),
    tr('Si mueres, se acabó: pierdes la partida pero ganas hitos, y los hitos liberan clases.'),
    tr('Botones: Esperar (o Subir), Explorar, Poder, Café, Mochila y Mirar (toca algo para ver su ficha). El menú es el botón de las tres rayas, junto a los mensajes. En Opciones puedes poner la barra para zurdos.'),
    tr('Teclas: E explorar, Q habilidad, 1 café, I mochila, M minimapa, Esc menú.'),
  ];
}
function pintaAyuda(ctx, p = {}) {
  const c = cuadroMenu(ctx, tr('CÓMO SE JUEGA'));
  const yb = c.y + c.h - 30, cabe = Math.max(4, Math.floor((yb - c.y - 26) / LH));
  // todo en líneas; una línea en blanco entre párrafos; las páginas se cortan por párrafos cuando se puede
  const paginas = [[]];
  for (const t of textosAyuda()) {
    const ls = envuelve(t, c.w - 16), pag = paginas[paginas.length - 1];
    if (pag.length && pag.length + ls.length > cabe) paginas.push([]);
    const dest = paginas[paginas.length - 1]; if (dest.length) dest.push(''); dest.push(...ls);
  }
  const n = paginas.length, k = Math.min(p.pag || 0, n - 1);
  let y = c.y + 24;
  for (const l of paginas[k].slice(0, cabe)) { if (l) txt(ctx, l, c.x + 8, y, COL.texto); y += l ? LH : 4; }
  if (n > 1) boton(ctx, c.x + 6, yb + 4, 96, 22, { txt: fmt(tr('Más ({a}/{b})'), { a: k + 1, b: n }) }, () => { p.pag = (k + 1) % n; });
  boton(ctx, c.x + c.w - 84, yb + 4, 78, 22, { txt: tr('Volver') }, () => vuelveDe(p));
}
