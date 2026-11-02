// Fans of Chef · PANTALLA (2): las ventanas: la MAÑANA (la lista de pedidos del día y el botón de bajar) y el CIERRE (el oro del día).
// Y los toques de la portada. El servicio ya no es una ventana: se juega en la cantina (pantalla-cantina.js).
// Se manejan con el dedo (tocar una fila o un botón) o con el teclado (arriba/abajo y acción).
'use strict';

const VENTANA = { tipo: null, sel: 0, caja: null, filas: [], boton: null };
ENTRADA.ventana = () => JORNADA.fase === 'portada' || !!VENTANA.tipo;

function abreVentana(tipo) { VENTANA.tipo = tipo; VENTANA.sel = 0; VENTANA.filas = []; VENTANA.boton = null; sueltaTodo(); SONIDO.boton(); }
function cierraVentanas() { VENTANA.tipo = null; }

function cajaVentana(W, H, alto) {
  const w = Math.min(W - 8, 200), x = Math.round((W - w) / 2), y = Math.round(Math.max(4, (H - alto) / 2));
  VENTANA.caja = { x, y, w, h: alto };
  return VENTANA.caja;
}
function botonVentana(ctx, txt, c, color = PALETA.g) {
  const b = { x: c.x + 10, y: c.y + c.h - 18, w: c.w - 20, h: 14 }; VENTANA.boton = b;
  cajaMarco(ctx, b.x, b.y, b.w, b.h, color); letraCabe(ctx, txt, b.x + b.w / 2, b.y + 10, b.w - 6, PALETA.W, 'center', 8);
}
// la fila de una receta: nombre y lo que lleva (iconos con su número)
function filaReceta(ctx, r, x, y, w, color) {
  letraCabe(ctx, tr(RECETAS[r].nombre), x, y, w - 60, color, 'left', 7);
  let ix = x + w - 58;
  for (const k in RECETAS[r].lleva) { pintaSpr(ctx, 'ico_' + k, ix, y + 2, { que: k }); letra(ctx, 'x' + RECETAS[r].lleva[k], ix + 6, y, PALETA.w, 'left', 7, false); ix += 22; }
}

function pintaVentana(ctx, W, H) {
  const t = VENTANA.tipo; if (!t) return;
  VENTANA.filas = [];
  if (t === 'manana') {
    const c = cajaVentana(W, H, 56 + JORNADA.pedidos.length * 12);
    marcoMadera(ctx, c.x, c.y, c.w, c.h);
    letra(ctx, tr('JORNADA {n}', { n: JORNADA.dia }), c.x + c.w / 2, c.y + 12, PALETA.Y, 'center', 8);
    letraCabe(ctx, tr('Hoy pide la empresa:'), c.x + 6, c.y + 24, c.w - 12, PALETA.w, 'left', 7);
    JORNADA.pedidos.forEach((r, i) => filaReceta(ctx, r, c.x + 6, c.y + 36 + i * 12, c.w - 12, PALETA.W));
    botonVentana(ctx, tr('Bajar al sótano'), c);
  } else if (t === 'cierre') {
    const c = cajaVentana(W, H, 92);
    marcoMadera(ctx, c.x, c.y, c.w, c.h);
    letra(ctx, tr('CIERRE DE CAJA'), c.x + c.w / 2, c.y + 12, PALETA.Y, 'center', 8);
    const lineas = [
      [tr('Platos servidos'), String(CANTINA.servidos)], [tr('Clientes sin comer'), String(CANTINA.caducadas)], [tr('Bichos cocinados'), String(JORNADA.bajas)],
      [tr('Oro del día'), '+' + JORNADA.oroDia], [tr('Oro total'), String(SAVE.oro)],
    ];
    lineas.forEach(([a, b], i) => { letraCabe(ctx, a, c.x + 6, c.y + 26 + i * 10, c.w - 50, PALETA.w, 'left', 7); letra(ctx, b, c.x + c.w - 6, c.y + 26 + i * 10, i === 3 ? PALETA.Y : PALETA.W, 'right', 7, false); });
    if (JORNADA.caida) letraCabe(ctx, tr('(te cocinaron en el sótano)'), c.x + c.w / 2, c.y + 76 - 4, c.w - 8, PALETA.R, 'center', 6);
    botonVentana(ctx, tr('Jornada siguiente'), c);
  }
}

// cada fotograma: los toques y teclas que han llegado a la ventana (o a la portada)
function procesaToques() {
  for (const q of ENTRADA.toques) {
    if (JORNADA.fase === 'portada') {
      if (q.x !== undefined && dentroDe(q, PAN.btnMus)) { SAVE.musica = SAVE.musica ? 0 : 1; guarda(); applyVolume(); SONIDO.boton(); continue; }
      if (q.x !== undefined && dentroDe(q, PAN.btnFx)) { SAVE.efectos = SAVE.efectos ? 0 : 1; guarda(); SONIDO.boton(); continue; }
      if (q.x !== undefined || q.tecla === 'accion') { ENTRADA.tactil = q.x !== undefined; empiezaJornada(); }
      continue;
    }
    const t = VENTANA.tipo; if (!t) continue;
    if (t === 'manana') { if (q.tecla === 'accion' || (q.x !== undefined && dentroDe(q, VENTANA.boton))) bajaAlSotano(); continue; }
    if (t === 'cierre') { if (q.tecla === 'accion' || (q.x !== undefined && dentroDe(q, VENTANA.boton))) { SONIDO.oro(); empiezaJornada(); } continue; }
  }
  ENTRADA.toques.length = 0;
}
