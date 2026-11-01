// Fans of Shelter · PANTALLA (2): las ventanas que paran el juego: la mesa de trabajo (crafteo), las tres mejoras al subir de nivel,
// la pregunta de la hoguera (dormir = que llegue la noche) y los toques de la portada y de la tarjeta final.
// Se manejan con el dedo (tocar una fila) o con el teclado (arriba/abajo y acción; Escape cierra).
'use strict';

const VENTANA = { tipo: null, sel: 0, mejoras: [], cola: 0, caja: null };
ENTRADA.ventana = () => NOCHE.fase === 'portada' || NOCHE.fase === 'fin' || !!VENTANA.tipo;

function abreVentana(tipo) { VENTANA.tipo = tipo; VENTANA.sel = 0; sueltaTodo(); SONIDO.boton(); }
function cierraVentanas() { VENTANA.tipo = null; VENTANA.cola = 0; }
function abreCrafteo() { abreVentana('crafteo'); }
// al subir de nivel (puede subir varios de golpe: se encadenan)
function abreMejoras() {
  if (VENTANA.tipo === 'mejoras') { VENTANA.cola++; return; }
  VENTANA.mejoras = eligeMejoras(); abreVentana('mejoras'); SONIDO.nivel();
  aviso(tr('¡Nivel {n}!', { n: J.nivel }), 1.5, PALETA.Q);
}

// la caja de la ventana, centrada
function cajaVentana(W, H, alto) {
  const w = Math.min(W - 8, 180), x = Math.round((W - w) / 2), y = Math.round(Math.max(26, (H - alto) / 2));
  VENTANA.caja = { x, y, w, h: alto };
  return VENTANA.caja;
}
const FILA_CRAFT = 15, FILA_MEJORA = 22;

function pintaVentana(ctx, W, H) {
  const t = VENTANA.tipo; if (!t) return;
  ctx.fillStyle = 'rgba(10,5,20,0.5)'; ctx.fillRect(0, 0, W, H);
  if (t === 'crafteo') {
    const RS = recetasAbiertas(), n = RS.length, c = cajaVentana(W, H, 20 + n * FILA_CRAFT + 32);
    marcoMadera(ctx, c.x, c.y, c.w, c.h);
    letra(ctx, tr('MESA DE TRABAJO'), c.x + c.w / 2, c.y + 11, PALETA.Y, 'center');
    RS.forEach((r, k) => {
      const y = c.y + 18 + k * FILA_CRAFT, sel = k === VENTANA.sel, tope = r.nivel() >= r.max(), puede = tieneRecursos(r.cuesta) && !tope;
      if (sel) caja(ctx, c.x + 3, y, c.w - 6, FILA_CRAFT - 1, PALETA.b);
      const costes = Object.keys(r.cuesta), anchoCoste = costes.length * 21;
      letraCabe(ctx, r.nombreTr ? r.nombreTr() : tr(r.nombre), c.x + 5, y + 10, c.w - anchoCoste - 10, tope ? PALETA.s : puede ? (r.id === 'refugio' ? PALETA.Y : PALETA.W) : PALETA.t);
      let x = c.x + c.w - 4 - anchoCoste;
      for (const k2 of costes) { pintaSpr(ctx, 'ico_' + k2, x, y + 2); letra(ctx, String(r.cuesta[k2]), x + 11, y + 10, (J.inv[k2] || 0) >= r.cuesta[k2] ? PALETA.W : PALETA.R, 'left', 8, false); x += 21; }
    });
    const r = RS[Math.min(VENTANA.sel, RS.length - 1)], y = c.y + c.h - 18;
    const extra = r.max() < 99 ? ' ' + r.nivel() + '/' + r.max() : '';
    letraCabe(ctx, tr(r.que) + extra, c.x + c.w / 2, y, c.w - 8, PALETA.f, 'center');
    cajaMarco(ctx, c.x + c.w / 2 - 30, c.y + c.h - 13, 60, 11, PALETA.N); letra(ctx, tr('CERRAR'), c.x + c.w / 2, c.y + c.h - 5, PALETA.W, 'center', 8, false);
  } else if (t === 'mejoras') {
    const ms = VENTANA.mejoras, c = cajaVentana(W, H, 20 + ms.length * FILA_MEJORA + 4);
    marcoMadera(ctx, c.x, c.y, c.w, c.h);
    letra(ctx, tr('¡NIVEL {n}! ELIGE', { n: J.nivel }), c.x + c.w / 2, c.y + 11, PALETA.Q, 'center');
    ms.forEach((m, k) => {
      const y = c.y + 18 + k * FILA_MEJORA, sel = k === VENTANA.sel;
      cajaMarco(ctx, c.x + 3, y, c.w - 6, FILA_MEJORA - 2, sel ? PALETA.b : PALETA.N, sel ? PALETA.Y : PALETA.K);
      letraCabe(ctx, tr(m.nombre), c.x + 7, y + 9, c.w - 14, PALETA.Y);
      letraCabe(ctx, tr(m.que), c.x + 7, y + 18, c.w - 14, PALETA.w);
    });
  } else if (t === 'dormir') {
    const c = cajaVentana(W, H, 46);
    marcoMadera(ctx, c.x, c.y, c.w, c.h);
    letraCabe(ctx, tr('¿Dormir? La noche llega ya'), c.x + c.w / 2, c.y + 12, c.w - 8, PALETA.W, 'center');
    letraCabe(ctx, tr('(sin tiempo de preparar más)'), c.x + c.w / 2, c.y + 22, c.w - 8, PALETA.t, 'center');
    [tr('Sí'), tr('No')].forEach((txt, k) => {
      const x = c.x + c.w / 2 + (k ? 6 : -46), sel = k === VENTANA.sel;
      cajaMarco(ctx, x, c.y + 28, 40, 12, sel ? PALETA.b : PALETA.N, sel ? PALETA.Y : PALETA.K); letra(ctx, txt, x + 20, c.y + 37, PALETA.W, 'center', 8, false);
    });
  }
}

// qué fila de la ventana hay en (x, y), o −1
function filaEn(x, y) {
  const c = VENTANA.caja; if (!c || x < c.x || x > c.x + c.w) return -1;
  if (VENTANA.tipo === 'crafteo') { if (y > c.y + c.h - 14) return 'cerrar'; const k = Math.floor((y - c.y - 18) / FILA_CRAFT); return k >= 0 && k < recetasAbiertas().length ? k : -1; }
  if (VENTANA.tipo === 'mejoras') { const k = Math.floor((y - c.y - 18) / FILA_MEJORA); return k >= 0 && k < VENTANA.mejoras.length ? k : -1; }
  if (VENTANA.tipo === 'dormir') { if (y < c.y + 26) return -1; return x < c.x + c.w / 2 ? 0 : 1; }
  return -1;
}
function confirmaVentana() {
  const t = VENTANA.tipo;
  if (t === 'crafteo') craftea(VENTANA.sel);
  else if (t === 'mejoras') {
    VENTANA.mejoras[VENTANA.sel].hace(); SONIDO.craftea();
    if (VENTANA.cola > 0) { VENTANA.cola--; VENTANA.mejoras = eligeMejoras(); VENTANA.sel = 0; } else cierraVentanas();
  } else if (t === 'dormir') { if (VENTANA.sel === 0) { cierraVentanas(); empiezaNoche(); } else cierraVentanas(); }
}
// cada fotograma: los toques y teclas que han llegado a la ventana (o a la portada / el final)
function procesaToques(W, H) {
  for (const q of ENTRADA.toques) {
    if (NOCHE.fase === 'portada') {
      if (q.x !== undefined && dentroDe(q, PAN.btnMus)) { SAVE.musica = SAVE.musica ? 0 : 1; guarda(); applyVolume && applyVolume(); SONIDO.boton(); continue; }
      if (q.x !== undefined && dentroDe(q, PAN.btnFx)) { SAVE.efectos = SAVE.efectos ? 0 : 1; guarda(); SONIDO.boton(); continue; }
      if (q.x !== undefined || q.tecla === 'accion') { ENTRADA.tactil = q.x !== undefined; nuevaPartida(); }
      continue;
    }
    if (NOCHE.fase === 'fin') { if (NOCHE.tFin > 1.5 && (q.x !== undefined || q.tecla === 'accion')) { NOCHE.fase = 'portada'; cierraVentanas(); } continue; }
    if (!VENTANA.tipo) continue;
    const n = VENTANA.tipo === 'crafteo' ? recetasAbiertas().length : VENTANA.tipo === 'mejoras' ? VENTANA.mejoras.length : 2;
    if (q.tecla) {
      if (q.tecla === 'arriba' || (q.tecla === 'izq' && VENTANA.tipo === 'dormir')) { VENTANA.sel = (VENTANA.sel + n - 1) % n; SONIDO.boton(); }
      else if (q.tecla === 'abajo' || (q.tecla === 'der' && VENTANA.tipo === 'dormir')) { VENTANA.sel = (VENTANA.sel + 1) % n; SONIDO.boton(); }
      else if (q.tecla === 'accion') confirmaVentana();
      continue;
    }
    const f = filaEn(q.x, q.y);
    if (f === 'cerrar') { cierraVentanas(); SONIDO.boton(); }
    else if (f >= 0) { if (VENTANA.sel === f || VENTANA.tipo === 'mejoras' || VENTANA.tipo === 'dormir') { VENTANA.sel = f; confirmaVentana(); } else { VENTANA.sel = f; SONIDO.boton(); } }
    else if (VENTANA.tipo === 'crafteo' && VENTANA.caja && (q.y < VENTANA.caja.y || q.y > VENTANA.caja.y + VENTANA.caja.h)) { cierraVentanas(); SONIDO.boton(); }
  }
  ENTRADA.toques.length = 0;
  if (ENTRADA.escPulsa && (VENTANA.tipo === 'crafteo' || VENTANA.tipo === 'dormir')) cierraVentanas();
}
const dentroDe = (q, b) => b && q.x >= b.x && q.x <= b.x + b.w && q.y >= b.y && q.y <= b.y + b.h;
