// Fans of Beams · Interfaz: paneles, barras y botones, el HUD, la pantalla de título y el resumen de la partida.
// (Se carga por orden desde index.html: todos los archivos comparten ámbito global.)
'use strict';
function polig(x, y, w, h, k) { c.beginPath(); c.moveTo(x + k, y); c.lineTo(x + w, y); c.lineTo(x + w, y + h - k); c.lineTo(x + w - k, y + h); c.lineTo(x, y + h); c.lineTo(x, y + k); c.closePath(); }
function panel(x, y, w, h, col = '#7fe8ff', k = 10, a = 0.74) {
  c.save(); polig(x, y, w, h, k); const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(20,38,84,' + a + ')'); g.addColorStop(1, 'rgba(4,9,26,' + a + ')'); c.fillStyle = g; c.fill();
  c.lineWidth = 2; c.strokeStyle = col; c.stroke(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.45; c.lineWidth = 1; c.strokeStyle = '#fff'; c.beginPath(); c.moveTo(x + k + 2, y + 3.5); c.lineTo(x + w - 8, y + 3.5); c.stroke(); c.restore();
}
function barra(x, y, w, k, col, h = 10) {   // barra inclinada, con segmentos y brillo
  const s = h * 0.7; c.save(); c.beginPath(); c.moveTo(x + s, y); c.lineTo(x + w + s, y); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.closePath();
  c.fillStyle = 'rgba(2,5,16,0.88)'; c.fill(); c.lineWidth = 2; c.strokeStyle = mezcla(col, -0.15); c.stroke(); c.clip();
  const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, mezcla(col, 0.75)); g.addColorStop(0.5, col); g.addColorStop(1, mezcla(col, -0.45)); c.fillStyle = g; c.fillRect(x, y, (w + s) * Math.max(0, Math.min(1, k)), h);
  c.fillStyle = 'rgba(0,0,12,0.4)'; for (let i = 1; i < 20; i++) c.fillRect(x + (w + s) * i / 20, y, 1.5, h); c.restore();
}
function flecha(x, y, dir, col, t = 13) { c.save(); c.fillStyle = col; c.strokeStyle = '#04071a'; c.lineWidth = 3; c.lineJoin = 'round'; c.beginPath(); if (dir === 'i') { c.moveTo(x - t, y); c.lineTo(x + t * 0.7, y - t); c.lineTo(x + t * 0.7, y + t); } else if (dir === 'd') { c.moveTo(x + t, y); c.lineTo(x - t * 0.7, y - t); c.lineTo(x - t * 0.7, y + t); } else if (dir === 'a') { c.moveTo(x, y - t); c.lineTo(x - t, y + t * 0.7); c.lineTo(x + t, y + t * 0.7); } else { c.moveTo(x, y + t); c.lineTo(x - t, y - t * 0.7); c.lineTo(x + t, y - t * 0.7); } c.closePath(); c.stroke(); c.fill(); c.restore(); }
function peligro(y, h) {   // franja de aviso de rayas rojas y negras que se desplaza
  c.save(); c.beginPath(); c.rect(0, y, W, h); c.clip(); c.fillStyle = '#1a0608'; c.fillRect(0, y, W, h); c.fillStyle = '#ff3b3b'; const off = (S.t * 60) % 60;
  for (let x = -h - 60 + off; x < W + h; x += 60) { c.beginPath(); c.moveTo(x, y + h); c.lineTo(x + 30, y + h); c.lineTo(x + 30 + h, y); c.lineTo(x + h, y); c.closePath(); c.fill(); } c.restore();
}
const UI = { hits: [], prev: [], foco: 0, teclado: false };
function boton(x, y, w, h, t, fn, o = {}) {
  const nav = o.nav !== false, idx = nav ? UI.hits.reduce((n, q) => n + (q.nav ? 1 : 0), 0) : -1, foc = nav && UI.teclado && UI.foco === idx;
  UI.hits.push({ x, y, w, h, fn, aj: o.aj, nav });
  c.save(); polig(x, y, w, h, Math.min(12, h * 0.3)); const g = c.createLinearGradient(0, y, 0, y + h);
  if (o.activo) { g.addColorStop(0, 'rgba(60,150,210,0.9)'); g.addColorStop(1, 'rgba(20,60,120,0.9)'); } else { g.addColorStop(0, 'rgba(26,46,100,0.9)'); g.addColorStop(1, 'rgba(6,12,34,0.92)'); }
  c.fillStyle = g; c.fill(); c.lineWidth = foc ? 4 : 2.5; c.strokeStyle = foc ? '#ffe9a3' : (o.borde || (o.activo ? '#c4f6ff' : '#4f86d8')); c.stroke();
  c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.42; c.strokeStyle = '#fff'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 14, y + 4); c.lineTo(x + w - 8, y + 4); c.stroke(); c.restore();
  if (t) txt(t, x + w / 2, y + h / 2 + 1, o.tam || 20, o.col || '#ffffff');
}
function tk(id) { const k = OPC.teclas[id].filter(Boolean).map(nombreTecla).join(' / '); return mostrarTactil() && !PAD.hay ? '' : k || (OPC.pad[id] != null ? nombrePad(OPC.pad[id]) : '—'); }
const tkb = id => tk(id) ? '[' + tk(id) + ']' : '';
function icono(n, x, y, t, a = 1) { const i = img('iconos/' + n + '.png'); if (listo(i)) { c.globalAlpha = a; c.drawImage(i, x, y, t, t); c.globalAlpha = 1; } }
function dibujaHud() {
  if (S.estado === 'titulo') return;
  const nv = nave(S.nave, S.k0) || S.navePrev, col = FACS[S.fac].col;
  txt('PUNTOS', 24, 16, 14, '#8ab4ff', 'left', { f: 'mini' }); txt(String(Math.floor(S.score || 0)).padStart(7, '0'), 22, 44, 32, '#ffffff', 'left', { f: 'hud' });
  if (S.combo >= 2) { const m = multi(); txt('COMBO x' + m, 24, 168, 20, m >= 5 ? '#ff9a3c' : '#ffd03c', 'left'); txt(S.combo + ' bajas', 24, 190, 13, '#bcd0f0', 'left', { f: 'mini' }); barra(24, 202, 120, S.comboT / 2.4, m >= 5 ? '#ff9a3c' : '#ffd03c', 7); }
  for (let i = 0; i < 2; i++) { const x = 32 + i * 24, y = 108; c.beginPath(); c.arc(x, y, 8, 0, 6.283); c.fillStyle = i < S.escudo ? '#6fc8ff' : '#16233f'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = i < S.escudo ? '#e8fbff' : '#2c3f66'; c.stroke(); }
  for (let i = 0; i < Math.max(0, S.vidas); i++) if (nv) c.drawImage(nv, 22 + i * 52, 66, nv.lw * 0.52, nv.lh * 0.52);
  txt('EVO', 24, 122, 14, '#ffd03c', 'left', { f: 'mini' });
  for (let i = 0; i < 6; i++) { const x = 70 + i * 17, y = 122, on = i <= S.k; c.fillStyle = on ? '#ffd03c' : '#1d2a44'; c.strokeStyle = '#04071a'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x, y - 7); c.lineTo(x + 6, y); c.lineTo(x, y + 7); c.lineTo(x - 6, y); c.closePath(); c.stroke(); c.fill(); }
  txt(NOMBRE_CLASE[S.k].toUpperCase(), 22, 146, 16, '#ffe9a3', 'left');
  txt('SECTOR ' + (S.sector + 1) + '/' + SECTORES + ' · ' + FACS[S.fac].nom.toUpperCase(), W / 2, 15, 15, col, 'center', { f: 'mini' });
  // captura y arma
  panel(W - 252, 8, 244, 100, '#7fe8ff');
  icono('carga-energia', W - 244, 14, 30); txt('CAPTURA', W - 208, 30, 18, '#bfe9ff', 'left'); txt(tkb('capt'), W - 20, 30, 16, '#ffe9a3', 'right', { f: 'mini' });
  for (let i = 0; i < MAX_BOLAS; i++) { const x = W - 222 + i * 32, y = 62, on = i < S.bolas; c.fillStyle = on ? '#7fe8ff' : '#16233f'; c.strokeStyle = on ? '#e8fbff' : '#2c3f66'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x, y - 11); c.lineTo(x + 11, y); c.lineTo(x, y + 11); c.lineTo(x - 11, y); c.closePath(); c.fill(); c.stroke(); if (on) { c.save(); c.globalCompositeOperation = 'lighter'; brillo(x, y, 20, '#7fe8ff', 0.5); c.restore(); } }
  icono('arma-laser', W - 244, 76, 26); txt('ARMA ' + armaNivel(), W - 208, 90, 18, '#ffe9a3', 'left');
  for (let i = 0; i < maxAli(); i++) {   // plazas de escolta
    const x = W - 66 - i * 66, y = 116, a = ALI[i];
    panel(x - 30, y, 60, 66, a ? '#7fe8ff' : '#38496d', 8, 0.6);
    if (a) { dibujaSpr(spriteE(a.fac, a.d.spr), x, y + 32, 54, false, 0); if (a.d.hab) txt(a.d.hab, x, y + 8, 12, '#ffe9a3', 'center', { f: 'mini' }); for (let k = 0; k < a.hpMax; k++) { c.fillStyle = k < a.hp ? '#7fe8ff' : '#26405a'; c.fillRect(x - a.hpMax * 3 + k * 6, y + 58, 4, 3); } }
    else txt('' + (i + 1), x, y + 33, 22, '#38496d');
  }
  const lista = ALI.length > 0 && !S.rayo;
  panel(W / 2 - 200, H - 50, 400, 40, lista ? '#ffffff' : '#38496d', 10, 0.7);
  icono('arma-rayoSolar', W / 2 - 190, H - 45, 30, lista ? 1 : 0.4); txt(lista ? 'SUPER RAYO ' + tkb('rayo') + ' LISTO' : 'SUPER RAYO · captura un aliado', W / 2 + 14, H - 30, 17, lista ? '#ffffff' : '#8091b0');
  if (S.jefe && S.jefe.hp > 0 && S.jefe.estado !== 'entra') { barra(W / 2 - 160, 38, 320, S.jefe.hp / S.jefe.hpMax, '#ff4a4a', 14); txt(FACS[S.jefe.fac].nom.toUpperCase() + ' · JEFE', W / 2, 68, 18, '#ffd0d0'); icono(FACS[S.jefe.fac].pil, W / 2 - 218, 30, 44); }
  if (S.aviso > 0) { c.globalAlpha = 0.45 + 0.55 * Math.abs(Math.sin(S.t * 6)); peligro(H / 2 - 100, 14); peligro(H / 2 + 70, 14); txt('ALERTA', W / 2, H / 2 - 28, 76, '#ff5a5a', 'center', { f: 'logo' }); txt('Se acerca el jefe del sector', W / 2, H / 2 + 38, 24, '#ffd0d0'); c.globalAlpha = 1; }
  if (S.banner > 0 && S.estado === 'jugando') {
    const a = Math.max(0, Math.min(1, S.banner * 1.2, (3.4 - S.banner) * 3)); c.globalAlpha = a;
    c.fillStyle = 'rgba(3,6,20,0.62)'; c.fillRect(0, H / 2 - 92, W, 170); c.fillStyle = col; c.fillRect(0, H / 2 - 92, W, 3); c.fillRect(0, H / 2 + 75, W, 3);
    icono(FACS[S.fac].pil, W / 2 - 40, H / 2 - 190, 80); txt('SECTOR ' + (S.sector + 1), W / 2, H / 2 - 28, 74, '#ffffff', 'center', { f: 'logo' }); txt('FACCIÓN ' + FACS[S.fac].nom.toUpperCase(), W / 2, H / 2 + 34, 30, col); if (S.sector === 0) txt('AÑO 30XX · Microblizz ha llevado la guerra al espacio', W / 2, H / 2 + 62, 16, '#cfe0ff'); c.globalAlpha = 1;
  }
  if (S.msgT > 0 && S.estado === 'jugando') { c.globalAlpha = Math.min(1, S.msgT); panel(W / 2 - 330, 84, 660, 42, '#ffd03c', 10, 0.62); txt(S.msg, W / 2, 106, 19, '#ffe9a3'); c.globalAlpha = 1; }
  if (S.estado === 'pausa') {
    c.fillStyle = 'rgba(5,7,15,0.7)'; c.fillRect(0, 0, W, H); txt('PAUSA', W / 2, 100, 76, '#ffffff', 'center', { f: 'logo' });
    boton(W / 2 - 160, 170, 320, 58, 'SEGUIR', () => { S.estado = 'jugando'; }, { tam: 24 }); boton(W / 2 - 160, 244, 320, 58, 'OPCIONES', () => abreOpciones('pausa'), { tam: 24 }); boton(W / 2 - 160, 318, 320, 58, 'SALIR AL MENÚ', volverMenu, { tam: 22 });
  }
  if (S.estado === 'fin' || S.estado === 'victoria') {
    c.fillStyle = 'rgba(5,7,15,' + Math.min(0.72, S.fin * 0.6) + ')'; c.fillRect(0, 0, W, H);
    if (S.fin > 0.6) {
      const v = S.estado === 'victoria'; txt(v ? 'VICTORIA' : 'FIN DE PARTIDA', W / 2, 88, 76, v ? '#8dff9a' : '#ff6a6a', 'center', { f: 'logo' });
      if (v) txt('Has derrotado a los jefes de ' + SECTORES + ' sectores', W / 2, 140, 20, '#d8ffd8');
      txt(String(Math.floor(S.score)).padStart(7, '0'), W / 2, 206, 64, '#ffffff', 'center', { f: 'hud' });
      if (S.nuevoRecord) { c.globalAlpha = 0.6 + 0.4 * Math.sin(S.t * 8); txt('¡NUEVO RÉCORD!', W / 2, 252, 30, '#ffd03c'); c.globalAlpha = 1; } else txt('Récord ' + String(REC.score).padStart(7, '0'), W / 2, 252, 20, '#8ab4ff');
      const fila = [['SECTOR', (S.sector + 1) + '/' + SECTORES], ['BAJAS', S.kills], ['CAPTURAS', S.capturas], ['COMBO MÁX.', 'x' + (1 + Math.floor(S.comboMax / 4)) + ' · ' + S.comboMax], ['TIEMPO', Math.floor(S.t / 60) + ':' + String(Math.floor(S.t % 60)).padStart(2, '0')]];
      fila.forEach((r, i) => { const x = W / 2 - 330 + i * 165; txt(r[0], x + 70, 304, 12, '#8ab4ff', 'center', { f: 'mini' }); txt(String(r[1]), x + 70, 332, 22, '#ffffff'); });
      txt(mostrarTactil() ? 'Toca la pantalla para volver al menú' : 'Pulsa R o Enter para volver al menú', W / 2, 410, 22, '#ffe9a3');
    }
  }
}
function cambiaFac(d) { ELEG.fac = ORDEN_FAC[(ORDEN_FAC.indexOf(ELEG.fac) + d + 9) % 9]; guardaEleccion(); }
function cambiaClase(d) { ELEG.k = clamp(ELEG.k + d, 0, 5); guardaEleccion(); }
function cambiaDif(d) { ELEG.dif = ORDEN_DIF[(ORDEN_DIF.indexOf(ELEG.dif) + d + 3) % 3]; guardaEleccion(); }
function empieza() { nuevaPartida(); pantallaCompleta(false); pantallaEncendida(); }
function volverMenu() { S.estado = 'titulo'; S.fac = 'nomuertos'; GIG = [{ fac: 'nomuertos', spr: 'jefe', tam: 1000, x: 700, y: 300, vx: -4, t: 0, fase: 1, fijo: true }]; musicSet('nvMenu'); }
function bflecha(x, y, w, h, dir, fn) { boton(x, y, w, h, '', fn, { nav: false }); flecha(x + w / 2, y + h / 2, dir, '#ffe9a3', 11); }
function dibujaTitulo() {
  const t = S.t, F = FACS[ELEG.fac];
  const pn = c.createLinearGradient(0, 0, 660, 0); pn.addColorStop(0, 'rgba(4,7,18,0.88)'); pn.addColorStop(0.7, 'rgba(4,7,18,0.62)'); pn.addColorStop(1, 'rgba(4,7,18,0)'); c.fillStyle = pn; c.fillRect(0, 0, 660, H);
  const nv = nave(ELEG.fac, ELEG.k), yy = 284 + Math.sin(t * 2) * 6;   // la nave elegida, con su rayo de muestra
  if (nv) { c.save(); c.globalCompositeOperation = 'lighter'; brillo(220, yy, 170, F.col, 0.3); c.restore(); c.drawImage(nv, 220 - nv.lw / 2, yy - nv.lh / 2, nv.lw, nv.lh); }
  else txt('cargando arte…', 220, yy, 18, '#8091b0');
  rayoGrande(220 + (nv ? nv.lw / 2 : 60), 540, yy, 22 + 6 * Math.sin(t * 8), '#7fe8ff', 0.5, 1);
  txt('FANS OF', 300, 58, 44, '#ffe9a3', 'center', { f: 'logo' }); txt('BEAMS', 300, 128, 112, '#7fe8ff', 'center', { f: 'logo' });
  txt('AÑO 30XX', 300, 184, 26, '#ffd03c'); txt('La guerra contra Microblizz llega al espacio', 300, 210, 16, '#ffffff'); if (REC.score > 0) txt('RÉCORD ' + String(REC.score).padStart(7, '0') + (REC.sector ? ' · SECTOR ' + REC.sector : ''), 300, 262, 14, '#8ab4ff', 'center', { f: 'mini' }); txt('Captura naves enemigas: serán tu escolta, tu escudo y tu rayo', 300, 234, 13, '#bcd0f0');
  icono(F.pil, 108, 346, 44); txt(F.nom.toUpperCase(), 280, 368, 28, F.col); bflecha(20, 348, 56, 42, 'i', () => cambiaFac(-1)); bflecha(430, 348, 56, 42, 'd', () => cambiaFac(1));
  txt(NOMBRE_CLASE[ELEG.k].toUpperCase() + '  ' + (ELEG.k + 1) + '/6', 253, 412, 20, '#ffffff'); bflecha(20, 394, 56, 42, 'b', () => cambiaClase(-1)); bflecha(430, 394, 56, 42, 'a', () => cambiaClase(1));
  const D = DIFS[ELEG.dif]; txt('DIFICULTAD', 253, 448, 12, '#8ab4ff', 'center', { f: 'mini' }); txt(D.nom, 253, 470, 24, ELEG.dif === 'facil' ? '#8dff9a' : ELEG.dif === 'dificil' ? '#ff7a7a' : '#ffe9a3'); bflecha(20, 446, 56, 42, 'i', () => cambiaDif(-1)); bflecha(430, 446, 56, 42, 'd', () => cambiaDif(1));
  txt('clase con la que empiezas · el resto se gana en partida', 253, 504, 11, '#8091b0', 'center', { f: 'mini' });
  const tac = mostrarTactil(), mv = ['arr', 'izq', 'abj', 'der'].map(a => nombreTecla(OPC.teclas[a].filter(Boolean).sort((x, y) => x.length - y.length)[0])), mover = mv.some(x => x.length > 3) ? 'FLECHAS' : mv.join(' ');
  const l = tac ? [['Palanca izq.', 'mover'], ['Disparo', 'automático'], ['Botón captura', 'bola de captura'], ['Botón rayo', 'super rayo (gasta un aliado)']] : [[mover, 'mover'], [tk('disp'), 'disparar'], [tk('capt'), 'bola de captura'], [tk('rayo'), 'super rayo (gasta un aliado)'], [tk('pausa'), 'pausa']];
  l.forEach((r, i) => { txt(r[0], 520, 322 + i * 26, 15, '#ffd03c', 'left'); txt(r[1], 700, 322 + i * 26, 15, '#ffffff', 'left'); });
  boton(520, 450, 250, 62, 'JUGAR', empieza, { tam: 32, borde: '#ffe9a3', nav: false });
  boton(784, 458, 152, 46, 'OPCIONES', () => abreOpciones('titulo'), { tam: 16, nav: false });
  if (!tac) { c.globalAlpha = 0.65 + 0.35 * Math.sin(t * 4); txt('Pulsa ' + (OPC.teclas.disp[0] ? nombreTecla(OPC.teclas.disp[0]) : 'ENTER') + ' o ENTER para jugar · O opciones', 640, 524, 14, '#ffffff', 'center', { f: 'mini' }); c.globalAlpha = 1; }
}
