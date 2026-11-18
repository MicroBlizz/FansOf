// Fans of Beams · Menú de opciones (controles, táctil, pantalla y sonido), controles táctiles en pantalla y el editor para colocar los botones.
// (Se carga por orden desde index.html: todos los archivos comparten ámbito global.)
'use strict';
// ---------- opciones: controles, táctil, pantalla y sonido ----------
function abreOpciones(volver) { S.opc = { tab: 0, volver }; S.estado = 'opciones'; UI.foco = 0; ESPERA = null; }
function cierraOpciones() { ESPERA = null; guardaOpc(); S.estado = S.opc.volver; UI.foco = 0; }
function restaura(tab) { if (tab === 0) { OPC.teclas = clona(DEF.teclas); OPC.pad = clona(DEF.pad); } else if (tab === 1) OPC.tactil = clona(DEF.tactil); else OPC.pant = clona(DEF.pant); ESPERA = null; guardaOpc(); }
function navUI() {   // teclado y mando en los menús: arriba/abajo cambia de botón, izquierda/derecha ajusta, disparo acepta
  const nav = UI.prev.filter(h => h.nav); if (!nav.length) return;
  if (PU.abj || PU.arr) { UI.teclado = true; UI.foco = (UI.foco + (PU.abj ? 1 : -1) + nav.length) % nav.length; }
  const h = nav[Math.min(UI.foco, nav.length - 1)];
  if ((PU.der || PU.izq) && h && h.aj) { UI.teclado = true; h.aj(PU.der ? 1 : -1); }
  if ((FIJA.Enter || PU.disp) && h) { UI.teclado = true; h.fn(); }
}
function fila(i, et, val, cambia, y0 = 124, dy = 48) {
  const y = y0 + i * dy; txt(et, 60, y + 20, 20, '#ffffff', 'left');
  boton(520, y, 56, 40, '', () => cambia(-1), { nav: false }); flecha(548, y + 20, 'i', '#ffe9a3', 11);
  boton(584, y, 230, 40, val, () => cambia(1), { aj: cambia, tam: 17, col: '#ffe9a3' });
  boton(822, y, 56, 40, '', () => cambia(1), { nav: false }); flecha(850, y + 20, 'd', '#ffe9a3', 11);
}
const SINO = v => v ? 'SÍ' : 'NO', pct = v => Math.round(v * 100) + ' %', ciclo = (arr, v, d) => arr[(arr.indexOf(v) + d + arr.length) % arr.length];
function tabControles() {
  const X = [60, 330, 500, 670], Wc = [260, 160, 160, 190];
  ['ACCIÓN', 'TECLA 1', 'TECLA 2', 'MANDO'].forEach((t, i) => txt(t, i ? X[i] + Wc[i] / 2 : X[i], 124, 13, '#8ab4ff', i ? 'center' : 'left', { f: 'mini' }));
  ACCIONES.forEach(([id, nom], i) => {
    const y = 138 + i * 40; txt(nom, 60, y + 18, 19, '#ffffff', 'left');
    for (let n = 0; n < 2; n++) { const esp = ESPERA && ESPERA.tipo === 'tecla' && ESPERA.id === id && ESPERA.n === n; boton(X[1 + n], y, Wc[1 + n], 34, esp ? 'PULSA…' : nombreTecla(OPC.teclas[id][n]), () => { ESPERA = { tipo: 'tecla', id, n }; }, { activo: esp, tam: 14 }); }
    if (id in DEF.pad) { const esp = ESPERA && ESPERA.tipo === 'pad' && ESPERA.id === id; boton(X[3], y, Wc[3], 34, esp ? 'PULSA…' : nombrePad(OPC.pad[id]), () => { ESPERA = { tipo: 'pad', id, n: 0 }; }, { activo: esp, tam: 14 }); }
    else txt('STICK / CRUCETA', X[3] + 95, y + 18, 12, '#8091b0', 'center', { f: 'mini' });
  });
  txt('Toca una casilla y pulsa la tecla (o el botón del mando). Suprimir la deja vacía. Esc cancela.', W / 2, 466, 12, '#8091b0', 'center', { f: 'mini' });
}
function tabTactil() {
  const T = OPC.tactil, M = ['auto', 'si', 'no'], ML = { auto: 'AUTOMÁTICO', si: 'SIEMPRE', no: 'NUNCA' };
  fila(0, 'Controles táctiles', ML[T.modo], d => { T.modo = ciclo(M, T.modo, d); guardaOpc(); });
  fila(1, 'Disparo automático', SINO(T.auto), () => { T.auto = !T.auto; guardaOpc(); });
  fila(2, 'Tamaño de los botones', pct(T.escala), d => { T.escala = clamp(Math.round((T.escala + d * 0.1) * 10) / 10, 0.6, 1.6); guardaOpc(); });
  fila(3, 'Opacidad', pct(T.opac), d => { T.opac = clamp(Math.round((T.opac + d * 0.1) * 10) / 10, 0.2, 1); guardaOpc(); });
  fila(4, 'Vibración', SINO(T.vib), () => { T.vib = !T.vib; guardaOpc(); vib(40); });
  boton(60, 124 + 5 * 48, 420, 46, 'MOVER Y COLOCAR LOS BOTONES', () => { S.estado = 'editaT'; UI.foco = 0; }, { tam: 17 });
}
function tabPantalla() {
  const P2 = OPC.pant, CL = ['auto', 'hd', 'alta', 'media', 'baja'], dy = 44, y0 = 118;
  fila(0, 'Calidad gráfica', P2.cal === 'auto' ? 'AUTOMÁTICA (' + Q.n + ')' : P2.cal.toUpperCase(), d => { P2.cal = ciclo(CL, P2.cal, d); guardaOpc(); }, y0, dy);
  fila(1, 'Brillo de luces (bloom)', SINO(P2.bloom), () => { P2.bloom = !P2.bloom; guardaOpc(); }, y0, dy);
  fila(2, 'Sacudida de pantalla', SINO(P2.sacudida), () => { P2.sacudida = !P2.sacudida; guardaOpc(); }, y0, dy);
  fila(3, 'Volumen de la música', pct(P2.mus), d => { P2.mus = clamp(Math.round((P2.mus + d * 0.1) * 10) / 10, 0, 1); guardaOpc(); }, y0, dy);
  fila(4, 'Volumen de los efectos', pct(P2.vol), d => { P2.vol = clamp(Math.round((P2.vol + d * 0.1) * 10) / 10, 0, 1); guardaOpc(); sonido('captura'); }, y0, dy);
  fila(5, 'Efectos suaves (menos destellos)', SINO(P2.suave), () => { P2.suave = !P2.suave; guardaOpc(); }, y0, dy);
  fila(6, 'Mostrar FPS', SINO(P2.fps), () => { P2.fps = !P2.fps; guardaOpc(); }, y0, dy);
  if (!ENAPP) boton(60, y0 + 7 * dy + 2, 420, 42, 'PANTALLA COMPLETA', () => pantallaCompleta(true), { tam: 17 });
}
function dibujaOpciones() {
  const O = S.opc; c.fillStyle = 'rgba(3,6,18,0.92)'; c.fillRect(0, 0, W, H);
  txt('OPCIONES', W / 2, 28, 40, '#7fe8ff', 'center', { f: 'logo' });
  ['CONTROLES', 'TÁCTIL', 'PANTALLA Y SONIDO'].forEach((t, i) => boton(40 + i * 296, 56, 280, 44, t, () => { O.tab = i; ESPERA = null; }, { activo: O.tab === i, tam: 16, aj: d => { O.tab = (O.tab + d + 3) % 3; ESPERA = null; } }));
  if (O.tab === 0) tabControles(); else if (O.tab === 1) tabTactil(); else tabPantalla();
  boton(40, H - 54, 190, 44, 'ATRÁS', cierraOpciones, { tam: 18 }); boton(W - 330, H - 54, 290, 44, 'RESTAURAR ESTA PESTAÑA', () => restaura(O.tab), { tam: 14 });
}
function dibujaTactil(edit) {
  if (!edit && (!mostrarTactil() || S.estado !== 'jugando')) return;
  const B = botonesT(), T = OPC.tactil; let st = null; for (const t of TOQ.values()) if (t.tipo === 'stick') st = t;
  c.save(); c.lineWidth = 3;
  const s0 = B.stick, sx = st ? st.cx : s0.x, sy = st ? st.cy : s0.y; c.globalAlpha = T.opac * (st || edit ? 1 : 0.75); c.fillStyle = 'rgba(14,26,60,0.55)'; c.strokeStyle = '#7fe8ff'; c.beginPath(); c.arc(sx, sy, s0.r, 0, 6.283); c.fill(); c.stroke();
  const kx = st ? clamp(st.x - st.cx, -s0.r, s0.r) : 0, ky = st ? clamp(st.y - st.cy, -s0.r, s0.r) : 0; c.fillStyle = 'rgba(127,232,255,0.5)'; c.beginPath(); c.arc(sx + kx, sy + ky, s0.r * 0.45, 0, 6.283); c.fill(); c.stroke();
  if (edit) txt('PALANCA', s0.x, s0.y + s0.r + 16, 13, '#ffffff', 'center', { f: 'mini' });
  const ICO = { capt: 'carga-energia', rayo: 'arma-rayoSolar', disp: 'arma-laser' };
  for (const id of ['capt', 'rayo', 'disp', 'pausa']) {
    if (id === 'disp' && T.auto && !edit) continue; const b = B[id], on = TH[id];
    c.globalAlpha = T.opac * (on ? 1.3 : 1); c.fillStyle = on ? 'rgba(127,232,255,0.5)' : 'rgba(14,26,60,0.55)'; c.strokeStyle = id === 'rayo' ? '#ffe9a3' : id === 'disp' ? '#ff9a9a' : '#7fe8ff'; c.beginPath(); c.arc(b.x, b.y, b.r, 0, 6.283); c.fill(); c.stroke();
    if (id === 'pausa') { c.fillStyle = '#ffffff'; c.fillRect(b.x - b.r * 0.3, b.y - b.r * 0.4, b.r * 0.22, b.r * 0.8); c.fillRect(b.x + b.r * 0.08, b.y - b.r * 0.4, b.r * 0.22, b.r * 0.8); }
    else icono(ICO[id], b.x - b.r * 0.55, b.y - b.r * 0.55, b.r * 1.1, Math.min(1, T.opac * 1.5));
    if (edit) txt(id === 'disp' ? 'DISPARO' : id === 'capt' ? 'CAPTURA' : id === 'rayo' ? 'RAYO' : 'PAUSA', b.x, b.y + b.r + 15, 12, '#ffffff', 'center', { f: 'mini' });
  }
  c.restore();
}
function dibujaEditaT() {
  c.fillStyle = 'rgba(3,6,18,0.6)'; c.fillRect(0, 0, W, H);
  txt('COLOCAR BOTONES', W / 2, 34, 36, '#7fe8ff', 'center', { f: 'logo' }); txt('Arrastra cada botón a donde te venga mejor. Tamaño y opacidad, en las opciones.', W / 2, 76, 14, '#cfe0ff');
  dibujaTactil(true);
  boton(W / 2 - 250, H - 60, 240, 46, 'LISTO', () => { guardaOpc(); S.estado = 'opciones'; }, { tam: 20, borde: '#ffe9a3' });
  boton(W / 2 + 10, H - 60, 240, 46, 'RESTAURAR', () => { OPC.tactil.pos = clona(DEF.tactil.pos); guardaOpc(); }, { tam: 17 });
}
