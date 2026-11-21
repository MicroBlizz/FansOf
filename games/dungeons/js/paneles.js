// Fans of Dungeons · Los paneles que se abren sobre la partida: la mochila (equipo, usar, equipar, soltar), la tienda (comprar
// y vender), la ficha de lo que se mira (enemigo, objeto, casilla), el menú de pausa con las opciones y la ayuda.
// Se pintan con cuadro y lista; los toques van a los botones que apuntan.
'use strict';

function cuadroPanel(ctx, titulo) {
  const x = 6, y = VISTA.y + 6, w = PAN.W - 12, h = VISTA.h - 12;
  ctx.fillStyle = 'rgba(4,2,6,0.78)'; ctx.fillRect(0, VISTA.y, PAN.W, VISTA.h);
  ctx.fillStyle = COL.panel; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = COL.borde; ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + h - 1, w, 1); ctx.fillRect(x, y, 1, h); ctx.fillRect(x + w - 1, y, 1, h);
  ctx.fillStyle = COL.neon; ctx.fillRect(x + 1, y + 1, w - 2, 1);
  escribe(ctx, titulo, x + w / 2, y + 6, { c: COL.oro, alin: 'centro' });
  return { x, y, w, h };
}
// una fila de lista con icono, texto y (opcional) cifra a la derecha. sel: resaltada
function fila(ctx, x, y, w, icono, t, der, color, sel, f) {
  if (sel) { ctx.fillStyle = '#2a1a1a'; ctx.fillRect(x, y, w, 18); ctx.fillStyle = COL.neon; ctx.fillRect(x, y, 2, 18); }
  if (icono && ICO[icono]) { const s = ICO[icono]; ctx.drawImage(s.c, x + 3, y - 1, Math.round(s.w * 0.6), Math.round(s.h * 0.6)); }
  const dw = der !== undefined ? anchoTexto(String(der)) + 8 : 0;
  txt(ctx, corta(t, w - 26 - dw), x + 24, y + 6, color || COL.texto);
  if (der !== undefined) txt(ctx, String(der), x + w - anchoTexto(String(der)) - 4, y + 6, COL.oro);
  BOTONES.push({ x, y, w, h: 18, f });
}
function cierraPanel() { J.panel = null; J.modo = 'juego'; VISTA.mirar = false; }

function pintaPanel(ctx) {
  const p = J.panel; if (!p) return;
  if (p.tipo === 'mochila') pintaMochila(ctx, p);
  else if (p.tipo === 'tienda') pintaTienda(ctx, p);
  else if (p.tipo === 'ficha') pintaFicha(ctx, p);
  else if (p.tipo === 'pausa') pintaPausa(ctx, p);
  else if (p.tipo === 'ayuda') pintaAyuda(ctx, p);
  else if (p.tipo === 'opciones') pintaOpciones(ctx, p);
  else if (p.tipo === 'altar') pintaAltar(ctx, p);
  else if (p.tipo === 'escena') pintaEscena(ctx, p);
  else if (p.tipo === 'aviso') pintaAviso(ctx, p);
  else if (p.tipo === 'mapa') pintaMapaGrande(ctx);
}
// el altar: tres mejoras en tarjetas grandes; tocas una y luego «Ofrecer»
function pintaAltar(ctx, p) {
  const c = cuadroPanel(ctx, tr('ALTAR DE LA PRODUCTIVIDAD'));
  let y = c.y + 22;
  for (const l of envuelve(tr('Microblizz acepta una ofrenda. Elige una mejora: solo una, y para siempre.'), c.w - 16)) { txt(ctx, l, c.x + 8, y, COL.apagado); y += LH; }
  y += 6;
  const yb = c.y + c.h - 28, alto = Math.min(54, Math.floor((yb - y - 8) / 3) - 6);
  p.opciones.forEach((id, i) => {
    const o = MEJORAS.find(q => q.id === id), sel = p.sel === i, x = c.x + 6, w = c.w - 12;
    ctx.fillStyle = sel ? '#2a1a1a' : '#1a1218'; ctx.fillRect(x, y, w, alto);
    ctx.fillStyle = sel ? COL.oro : COL.borde; ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + alto - 1, w, 1); ctx.fillRect(x, y, 1, alto); ctx.fillRect(x + w - 1, y, 1, alto);
    envuelve(tr(o.texto), w - 16).slice(0, Math.floor((alto - 6) / LH)).forEach((l, k) => txt(ctx, l, x + 8, y + 6 + k * LH, sel ? COL.texto : COL.apagado));
    BOTONES.push({ x, y, w, h: alto, f: () => { if (p.sel === i) eligeAltar(id); else p.sel = i; } });
    y += alto + 6;
  });
  const bw = Math.floor((c.w - 12) / 2);
  boton(ctx, c.x + 4, yb, bw, 22, { txt: tr('Ofrecer') }, () => eligeAltar(p.opciones[p.sel]));
  boton(ctx, c.x + 8 + bw, yb, bw, 22, { txt: tr('Ahora no') }, cierraPanel);
}

// un hueco de rejilla con su objeto (mochila y venta)
function huecoObj(ctx, x, y, cel, o, sel, f) {
  ctx.fillStyle = sel ? '#2a1a1a' : '#0c080a'; ctx.fillRect(x, y, cel - 2, cel - 2);
  ctx.fillStyle = sel ? '#c8a040' : o ? mezcla(RAR_COLOR[o.rar || 0], '#120d12', 0.35) : '#2a2224';
  ctx.fillRect(x, y, cel - 2, 1); ctx.fillRect(x, y + cel - 3, cel - 2, 1); ctx.fillRect(x, y, 1, cel - 2); ctx.fillRect(x + cel - 3, y, 1, cel - 2);
  if (o) { const s = ICO[iconoObj(o)]; if (s) { const e = Math.min(1, (cel - 6) / Math.max(s.w, s.h)), w = Math.round(s.w * e), hh = Math.round(s.h * e); ctx.drawImage(s.c, Math.round(x + (cel - 2 - w) / 2), Math.round(y + (cel - 2 - hh) / 2), w, hh); } }
  if (o && o.mas) txt(ctx, '+' + o.mas, x + 3, y + cel - 12, COL.oro);
  BOTONES.push({ x, y, w: cel - 2, h: cel - 2, f });
}
// la mochila: el equipo puesto arriba y dos bolsillos con su pestaña: los objetos (armas, armaduras, accesorios; 18 huecos que
// crecen con las riñoneras) y los cafés y pergaminos (12 huecos aparte, para que no te quiten sitio)
function pintaMochila(ctx, p) {
  const h = J.heroe, c = cuadroPanel(ctx, tr('MOCHILA'));
  if (!p.pestana) p.pestana = 'obj';
  const cafes = p.pestana === 'cafe', cap = cafes ? CAP_CAFES : capacidad(h), idx = indicesBolsillo(h, cafes);
  const COLS = 6, filas = Math.ceil(Math.max(capacidad(h), CAP_CAFES) / COLS);
  const cel = Math.max(26, Math.min(50, Math.floor((c.w - 12) / COLS), Math.floor((c.h - 168) / (filas + 1))));
  const x0 = c.x + Math.round((c.w - cel * COLS) / 2) + 1;
  let y = c.y + 18;
  txt(ctx, tr('EQUIPO'), c.x + 6, y, COL.apagado); y += LH;
  HUECOS.forEach((k, i) => huecoObj(ctx, x0 + i * cel, y, cel, h.equipo[k], p.sel === 'eq:' + k, () => { p.sel = 'eq:' + k; }));
  if (h.llaves) { pintaIcono(ctx, 'llave', x0 + 4 * cel + cel / 2 - 1, y + cel - 6); txt(ctx, 'x' + h.llaves, x0 + 4 * cel + 4, y + cel - 14, COL.oro); }
  y += cel + 4;
  // las dos pestañas
  const tw = Math.floor((c.w - 12) / 2), nObj = indicesBolsillo(h, false).length, nCaf = indicesBolsillo(h, true).length;
  boton(ctx, c.x + 4, y, tw, 20, { txt: tr('Objetos') + ' ' + nObj + '/' + capacidad(h), activo: !cafes }, () => { p.pestana = 'obj'; if (typeof p.sel === 'number') p.sel = -1; });
  boton(ctx, c.x + 8 + tw, y, tw, 20, { txt: tr('Cafés') + ' ' + nCaf + '/' + CAP_CAFES, activo: cafes }, () => { p.pestana = 'cafe'; if (typeof p.sel === 'number') p.sel = -1; });
  y += 24;
  for (let k = 0; k < cap; k++) { const i = idx[k]; huecoObj(ctx, x0 + (k % COLS) * cel, y + Math.floor(k / COLS) * cel, cel, i !== undefined ? h.mochila[i] : null, i !== undefined && p.sel === i, () => { if (i !== undefined) p.sel = i; }); }
  y += cel * Math.ceil(cap / COLS) + 3;
  // lo elegido: nombre, qué hace y sus botones
  const eq = typeof p.sel === 'string' ? p.sel.slice(3) : null, sel = eq ? h.equipo[eq] : h.mochila[p.sel];
  const yb = c.y + c.h - 26, bw = Math.floor((c.w - 16) / 3);
  if (sel) {
    txt(ctx, corta(nombreObj(sel), c.w - 12), c.x + 6, y, RAR_COLOR[sel.rar || 0]);
    envuelve(descObj(sel), c.w - 12).slice(0, Math.max(1, Math.floor((yb - y - LH - 2) / LH))).forEach((l, i) => txt(ctx, l, c.x + 6, y + LH * (i + 1), COL.texto));
    if (eq) boton(ctx, c.x + 4, yb, bw, 22, { txt: tr('Quitar'), apagado: mochilaLlena(h, sel) }, () => { if (!mochilaLlena(h, sel)) { h.mochila.push(sel); h.equipo[eq] = null; recalcula(h); p.pestana = 'obj'; p.sel = h.mochila.length - 1; sonido('equipar'); } });
    else {
      const consumible = OBJETOS[sel.id].tipo === 'consumible';
      boton(ctx, c.x + 4, yb, bw, 22, { txt: consumible ? tr('Usar') : tr('Equipar') }, () => usaDesdeMochila(p));
      boton(ctx, c.x + 8 + bw, yb, bw, 22, { txt: tr('Soltar') }, () => { suelta(h, p.sel); p.sel = -1; });
    }
  } else txt(ctx, idx.length ? tr('Toca un objeto para ver qué hace.') : cafes ? tr('Sin cafés ni pergaminos. Qué lunes.') : tr('Vacía. Microblizz tampoco te daría nada.'), c.x + 6, y, COL.apagado);
  boton(ctx, c.x + 12 + bw * 2, yb, bw, 22, { txt: tr('Cerrar') }, cierraPanel);
}

// usar o equipar desde la mochila: un café cierra la mochila (para ver qué pasa); equipar la deja abierta con lo puesto
// elegido, para seguir cambiando cosas. Las dos gastan un turno.
function usaDesdeMochila(p) {
  const h = J.heroe, o = h.mochila[p.sel]; if (!o) return;
  const tipo = OBJETOS[o.id].tipo;
  if (!usaObjeto(h, p.sel)) return;
  if (tipo === 'consumible') { cierraPanel(); accion(); return; }
  J.modo = 'juego'; accion();   // el mundo da su turno (con el panel abierto no se mueve nada)
  if (J.modo === 'juego' && h.vida > 0) { J.panel = p; J.modo = 'panel'; p.sel = 'eq:' + tipo; }
}
function pintaTienda(ctx, p) {
  const h = J.heroe, t = J.tienda, c = cuadroPanel(ctx, t.lola ? tr('EL PUESTO DE LOLA') : tr('MÁQUINA PAYPLUS'));
  let y = c.y + 20;
  const tw = Math.floor((c.w - 12) / 2);
  boton(ctx, c.x + 4, y, tw, 22, { txt: tr('Comprar'), activo: p.pestana === 'comprar' }, () => { p.pestana = 'comprar'; p.sel = 0; });
  boton(ctx, c.x + 8 + tw, y, tw, 22, { txt: tr('Vender'), activo: p.pestana === 'vender', apagado: !t.lola }, () => { if (t.lola) { p.pestana = 'vender'; p.sel = 0; } else log(tr('La máquina no compra. Solo cobra.'), '#ff9aa4'); });
  y += 27;
  txt(ctx, tr('Tus monedas: ') + h.monedas, c.x + 6, y, COL.oro); y += LH + 2;
  const yb = c.y + c.h - 26, bw = Math.floor((c.w - 12) / 2);
  let sel = null;
  if (p.pestana === 'comprar') {
    t.oferta.forEach((l, i) => {
      const o = l.obj, cf = cifraObj(o);
      fila(ctx, c.x + 4, y, c.w - 8, iconoObj(o), (l.oferta ? '* ' : '') + nombreObj(o) + (cf ? ' +' + cf.v : ''), l.vendido ? tr('vendido') : l.precio, l.vendido ? COL.apagado : RAR_COLOR[o.rar || 0], i === p.sel, () => { p.sel = i; }); y += 18;
    });
    if (!t.oferta.length) txt(ctx, tr('No hay nada.'), c.x + 8, y + 2, COL.apagado);
    sel = t.oferta[p.sel];
  } else {
    // vender: toda la mochila en rejilla (nada se queda escondido abajo); el nombre y el precio salen debajo
    const n = h.mochila.length, COLS = 6, filas = Math.max(1, Math.ceil(n / COLS));
    const cel = Math.max(24, Math.min(40, Math.floor((c.w - 12) / COLS), Math.floor((yb - y - 52) / filas)));
    const x0 = c.x + Math.round((c.w - cel * COLS) / 2) + 1;
    h.mochila.forEach((o, i) => huecoObj(ctx, x0 + (i % COLS) * cel, y + Math.floor(i / COLS) * cel, cel, o, i === p.sel, () => { p.sel = i; }));
    if (!n) txt(ctx, tr('No hay nada.'), c.x + 8, y + 2, COL.apagado);
    y += cel * filas + 3;
    const o = h.mochila[p.sel];
    if (o) { sel = { obj: o, precio: Math.max(1, Math.floor(precioDe(o, J.planta, true) / 2)) }; txt(ctx, corta(nombreObj(o), c.w - 12), c.x + 6, y, RAR_COLOR[o.rar || 0]); }
  }
  if (sel) envuelve(descObj(sel.obj) + (sel.oferta ? ' ' + tr('Oferta del día (letra pequeña: no se devuelve).') : ''), c.w - 12).slice(0, 3).forEach((l, i) => txt(ctx, l, c.x + 6, yb - 38 + i * LH, COL.texto));
  if (sel) boton(ctx, c.x + 4, yb, bw, 22, { txt: p.pestana === 'comprar' ? tr('Comprar') + ' (' + sel.precio + ')' : tr('Vender') + ' (' + sel.precio + ')', apagado: sel.vendido }, () => { if (p.pestana === 'comprar') compra(h, p.sel); else { vende(h, p.sel); p.sel = Math.min(p.sel, h.mochila.length - 1); } });
  boton(ctx, c.x + 8 + bw, yb, bw, 22, { txt: tr('Cerrar') }, cierraPanel);
}

// la ficha de lo que se ha tocado en modo mirar: p.ent (entidad), p.obj (objeto del suelo) o p.cas (tipo de casilla)
function pintaFicha(ctx, p) {
  const c = cuadroPanel(ctx, tr('FICHA'));
  let y = c.y + 22;
  if (p.ent) {
    const e = p.ent, E = e.bando === 'enemigo' ? ENEMIGOS[e.tipo] : null;
    pintaFigura(ctx, e.mimico ? 'cofre' : e.fig, c.x + 36, y + 56, { anim: 'quieto', f: Math.floor(J.tiempo * 4) % 4 });
    const nom = envuelve(e.mimico ? tr('Cofre') : tr(e.nombre), c.w - 84);
    nom.forEach((l, i) => escribe(ctx, l, c.x + 72, y + i * LH, { c: e.jefe || e.mini ? COL.oro : COL.texto })); y += (nom.length - 1) * LH;
    if (!e.mimico) {
      const COMP = { cazador: 'Te persigue en cuanto te ve.', patrulla: 'Hace su ronda hasta que te ve.', guardian: 'No sale de su sala.', tirador: 'Dispara desde lejos y guarda la distancia.', cobarde: 'Huye cuando le queda poca vida.', mimico: 'Parece un cofre. No lo es.', sanador: 'Repara a los otros robots.' };
      const lineas = envuelve(tr('Vida') + ' ' + Math.ceil(e.vida) + '/' + e.vidaMax + ' · ' + tr('Ataque') + ' ' + e.atq + ' · ' + tr('Defensa') + ' ' + e.def + ' · ' + tr('Velocidad') + ' ' + e.vel + ' · ' + tr('Visión') + ' ' + e.vision + (e.alcance > 1 ? ' · ' + tr('Alcance') + ' ' + e.alcance : ''), c.w - 84);
      const nCifras = lineas.length;
      if (E) lineas.push(...envuelve(tr(COMP[E.comp] || ''), c.w - 84), ...envuelve('«' + tr(E.frase) + '»', c.w - 84));
      if (e.bando === 'aliado' && e.turnos < 999) lineas.push(tr('Tu bug. Le quedan ') + e.turnos + tr(' turnos.'));
      if (e.bando === 'aliado' && e.turnos >= 999) lineas.push(...envuelve(tr('Te acompaña de planta en planta.'), c.w - 84));
      lineas.forEach((l, i) => txt(ctx, l, c.x + 72, y + 12 + i * LH, i < nCifras ? COL.texto : COL.apagado));
    } else txt(ctx, tr('Un cofre. ¿O no?'), c.x + 72, y + 12, COL.apagado);
  } else if (p.obj) {
    const o = p.obj, def = OBJETOS[o.id];
    if (def) { pintaIcono(ctx, iconoObj(o), c.x + 36, y + 40); const nom = envuelve(o.id === 'monedas' ? o.n + ' ' + tr('monedas') : nombreObj(o), c.w - 84); nom.forEach((l, i) => escribe(ctx, l, c.x + 72, y + i * LH, { c: RAR_COLOR[o.rar || 0] })); envuelve(o.id === 'cofre' ? tr('Un cofre. Dentro hay algo. O dientes.') : descObj(o), c.w - 84).forEach((l, i) => txt(ctx, l, c.x + 72, y + nom.length * LH + 2 + i * LH, COL.texto)); }
  } else if (p.cas !== undefined) {
    const NOM = { [T.MURO]: ['Muro', 'No se pasa. Ni Microblizz lo intenta.'], [T.SUELO]: ['Suelo', 'Se puede andar. De momento.'], [T.PUERTA]: ['Puerta', 'Se abre al pasar (gasta un turno).'], [T.PUERTA_ABIERTA]: ['Puerta abierta', 'Pasa, pasa.'], [T.LLEGADA]: ['Escalera de llegada', 'Por aquí subiste. No se baja.'], [T.SUBIDA]: ['Escalera de subida', 'A la siguiente planta. Si no hay jefe vigilando.'], [T.MUEBLE]: ['Mueble', 'Corta el paso y la vista: sirve de parapeto.'], [T.PUESTO]: ['El puesto de Lola', 'Café, objetos y buenos precios.'], [T.MAQUINA]: ['Máquina PayPlus', 'Phony vende caro y no compra.'], [T.CAFETERA]: ['Cafetera', 'Vida y Café al máximo, una vez.'], [T.PUERTA_CERRADA]: ['Puerta con llave', 'La sala de tesoro. La llave anda por la planta.'], [T.ALFOMBRA]: ['Alfombra roja', 'La sala de tesoro.'], [T.ALFOMBRA2]: ['Alfombra', 'Una sala especial.'], [T.JAULA]: ['Jaula', 'Dentro hay alguien de los Animales Locos. Tócala desde al lado para abrirla.'], [T.ATRIL]: ['Atril con el Manual del Empleado', 'Léelo una vez: identifica todos los cafés y pergaminos, y da experiencia.'], [T.REJA]: ['Rejas', 'Se abren cuando no quede nadie de la emboscada.'], [T.ROMPIBLE]: ['Se rompe', 'Se rompe de un golpe. Ponte al lado y tócalo: a veces hay monedas u objetos dentro.'], [T.ALTAR]: ['Altar de la Productividad', 'Una ofrenda: eliges una mejora de tres. Solo una vez.'] };
    const n = p.rompible ? [ROMPIBLE_NOMBRE[p.rompible], NOM[T.ROMPIBLE][1]] : NOM[p.cas] || ['?', ''];
    escribe(ctx, tr(n[0]), c.x + 8, y, { c: COL.texto }); envuelve(tr(n[1]), c.w - 16).forEach((l, i) => txt(ctx, l, c.x + 8, y + 12 + i * LH, COL.apagado));
    if (p.trampa) txt(ctx, tr('Hay una trampa aquí.'), c.x + 8, y + 30, '#ffd040');
  }
  boton(ctx, c.x + c.w - 74, c.y + c.h - 26, 70, 22, { txt: tr('Cerrar') }, cierraPanel);
}

// mirar: abre la ficha de lo que hay en la casilla tocada
function miraCasilla(tx, ty) {
  const m = J.mapa;
  if (!visM(m, tx, ty)) { log(tr('Ahí todavía no has mirado.'), '#8c879a'); return; }
  const q = quienHay(tx, ty);
  if (q && q !== J.heroe && visM(m, tx, ty) === 2) { J.panel = { tipo: 'ficha', ent: q }; }
  else { const o = J.objetos.find(o => o.x === tx && o.y === ty); if (o) J.panel = { tipo: 'ficha', obj: o.obj }; else J.panel = { tipo: 'ficha', cas: enM(m, tx, ty), rompible: enM(m, tx, ty) === T.ROMPIBLE ? rompibleDe(m, tx, ty) : null, trampa: m.trampas.has(clave(tx, ty)) && m.trampas.get(clave(tx, ty)).vista }; }
  J.modo = 'panel';
}
