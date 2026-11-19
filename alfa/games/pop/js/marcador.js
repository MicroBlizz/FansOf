// Fans of Pop · MARCADOR: la cabecera de la partida (corazones, monedero, toques, estrellas y título) y el panel «Tu equipo» de abajo
// con los huecos de los amigos. Sale de pintar.js (tarea #110) para dejarlo por debajo de 25 KB. En los duelos «Tu equipo» no sale:
// los amigos no juegan y en su sitio van, grandes, las ayudas de duelo (tarea #129, css/pop.css).
'use strict';

/* ---------- los toques como burbujitas (tarea #110; solo con el estilo del mundo) ---------- */
const PP_BURBUJITAS_FILA = 10, PP_BURBUJITAS_MAX = 20;
// Regla (dominio, sin dibujo): cómo se enseñan los toques. Una burbujita por toque del límite, como mucho 10 por fila y 2 filas
// (repartidas a partes casi iguales: 15 = 8 + 7), las primeras ya gastadas. Con un límite de más de 20, raro, o si te has pasado
// (toques > limite): el número de siempre.
function ppToquesEnBurbujitas(limite, toques) {
  const valido = Number.isInteger(limite) && Number.isInteger(toques) && limite > 0 && toques >= 0;
  if (!valido || limite > PP_BURBUJITAS_MAX || toques > limite) return Object.freeze({ modo: 'numero' });
  const nFilas = Math.ceil(limite / PP_BURBUJITAS_FILA), porFila = Math.ceil(limite / nFilas), filas = [];
  for (let k = 0; k < limite; k += porFila) {
    const fila = [];
    for (let j = k; j < Math.min(limite, k + porFila); j++) fila.push(j < toques ? 'gastada' : 'queda');
    filas.push(Object.freeze(fila));
  }
  return Object.freeze({ modo: 'burbujitas', filas: Object.freeze(filas) });
}

// Las burbujitas, alineadas a la derecha en xDer (el borde de la última), la primera fila en y0. Las gastadas, hundidas: más
// pequeñas, oscuras y sin brillo; las que quedan, levantadas y con brillo. Cada una del color de una fila del tablero (PP_FILAS).
const PP_BURBUJITA = Object.freeze({ r: 8, paso: 19, salto: 20 });
function ppPintaToquesBurbujitas(c, filas, xDer, y0, borde) {
  const { r, paso, salto } = PP_BURBUJITA;
  let k = 0;
  filas.forEach((fila, f) => fila.forEach((estado, j) => {
    const x = xDer - r - (fila.length - 1 - j) * paso, y = y0 + f * salto;
    ppBurbujita(c, x, y, r, PP_FILAS[k++ % PP_FILAS.length], estado === 'queda', borde);
  }));
}
function ppBurbujita(c, x, y, r, [h, s, l], queda, borde) {
  c.save(); c.beginPath();
  if (queda) { c.arc(x, y - 1, r, 0, Math.PI * 2); c.fillStyle = `hsl(${h} ${s}% ${l}%)`; }
  else { c.arc(x, y + 1, r * 0.72, 0, Math.PI * 2); c.fillStyle = `hsl(${h} ${Math.round(s * 0.5)}% ${Math.round(l * 0.5)}%)`; }
  c.fill(); c.lineWidth = 2; c.strokeStyle = borde; c.stroke();
  if (queda) { c.beginPath(); c.ellipse(x - r * 0.35, y - r * 0.45, r * 0.32, r * 0.2, -0.5, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,0.85)'; c.fill(); }
  c.restore();
}
// Los toques: burbujitas con el panel del mundo (si caben); si no, el número de siempre
function ppPintaToques(c, T, col, panel) {
  const reparto = panel ? ppToquesEnBurbujitas(T.limite, T.toques) : null;
  // con el último toque (o ninguno) el contorno avisa en el color del número de siempre, como avisaba el número
  const aviso = T.limite - T.toques <= 1;
  if (reparto && reparto.modo === 'burbujitas') ppPintaToquesBurbujitas(c, reparto.filas, 432, 58, aviso ? '#ff8a2a' : panel.borde);
  else ppTexto(c, `${T.toques} / ${T.limite}`, 432, 66, 40, col, 'right');
}

/* ---------- los paneles con el color del mundo ---------- */
// Un panel de la cabecera o del equipo: blanco translúcido de siempre o, con estilo, el fondo del mundo con su borde de 4 px
function ppPanelDelMundo(c, x, y, w, h, panel) {
  c.save(); c.beginPath(); c.roundRect(x, y, w, h, 24);
  if (!panel) { c.fillStyle = 'rgba(255,255,255,0.55)'; c.fill(); c.restore(); return; }
  c.globalAlpha = 0.85; c.fillStyle = panel.fondo; c.fill();
  c.globalAlpha = 1; c.lineWidth = 4; c.strokeStyle = panel.borde; c.stroke(); c.restore();
}
// La tinta de los rótulos sobre el panel: la de siempre (rosa con borde lila) o blanca con el borde del mundo
function ppTintaPanel(panel) {
  if (!panel) return { rotulo: '#ffe6f4', borde: '#7a3a7a', titulo: '#7a4a8a' };
  return { rotulo: '#fff', borde: panel.borde, titulo: panel.borde };
}
// El borde de un hueco del equipo: rosa (o lila apagado si está vacío) o, con estilo, el borde del mundo
function ppBordeHueco(ocupado, panel) {
  if (panel) return ocupado ? panel.borde : panel.borde + '66';
  return ocupado ? '#ff6ec7' : 'rgba(122,74,138,0.35)';
}

function ppPintaMarcador(c, t) {
  const P = PP_P, panel = ppEstiloDeTablero(P.T).panel, tinta = ppTintaPanel(panel), duelo = !!(P.T && P.T.nim);
  ppPanelDelMundo(c, 20, 18, 500, duelo ? PP_CABECERA_DUELO : 150, panel);
  // corazones
  const dano = PP_FX.dano;
  const vidas = ppVidas();
  for (let i = 0; i < PP_CFG.vida; i++) { const s = 34 + (i === vidas && dano > 0 ? dano * 10 : 0); ppCorazon(c, 44 + i * 40, 52, s, i < vidas); }
  ppPintaMonedero(c, 28, 88);   // bajo los corazones (la pausa va arriba a la derecha: Daniel, 17-11-2026)
  // toques de la sala
  if (duelo) { ppMarcadorNim(c, P.T, t); return; }   // nivel duelo: el rival, el turno y la regla (js/nimnivel.js); sin equipo
  if (P.T) {
    const T = P.T, quedan = T.limite - T.toques, col = quedan < 0 ? '#ff5a5a' : quedan <= 1 ? '#ffd64a' : '#fff';
    ppTexto(c, tr('Toques'), 432, 36, 22, tinta.rotulo, 'right', tinta.borde);   // a la izquierda del botón de pausa
    ppPintaToques(c, T, col, panel);
    const est = ppEstrellas(T); for (let k = 0; k < 3; k++) ppEstrella(c, 432 + k * 30, 116, 28, k < est);
    ppTexto(c, T.titulo || '', 270, 118, 34, '#ffd64a', 'center', tinta.titulo);
    if (T.d && T.d.jefe) ppTexto(c, tr('¡Pocos toques de sobra!'), 270, 150, 22, '#ff8a2a', 'center', '#fff');
    else if (T.d && T.d.dificil) ppTexto(c, tr('¡Nivel difícil!'), 270, 150, 22, '#ff6ec7', 'center', '#fff');
  }
  // el equipo, abajo: cada hueco con su slime, su pasiva y una barra de lo que le falta para actuar
  const n = P.T ? P.T.n : 3, g = ppGeom(n), y0 = g.y + g.lado + 60;
  ppPanelDelMundo(c, 20, y0 - 22, 500, 178, panel);
  ppTexto(c, tr('Tu equipo'), 270, y0 - 2, 24, tinta.rotulo, 'center', tinta.borde);
  const esc = ppEscalaEquipo();
  for (let k = 0; k < ppHuecos(); k++) {
    const [x, y] = ppHuecoEquipo(k, n), id = P.equipo[k], br = id ? PP_FX.brilla[id] || 0 : 0;
    c.save(); c.translate(x, y); c.scale(esc * (1 + br * 0.25), esc * (1 + br * 0.25));
    c.beginPath(); c.roundRect(-44, -44, 88, 88, 18); c.fillStyle = br ? `rgba(255,214,74,${0.3 + br * 0.5})` : id ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.35)'; c.fill(); c.lineWidth = 3; c.strokeStyle = ppBordeHueco(!!id, panel); c.stroke();
    const fuera = id && P.T && P.T.lo;   // en pesadilla los amigos no ayudan: en gris y con el sello de DESPEDIDO encima
    if (fuera) { c.globalAlpha = 0.5; c.filter = 'grayscale(1)'; }
    if (id && !PP_FX.vuelos.some(v => v.id === id)) ppSlimeRepuestoOImagen(c, id, 0, -4 - br * 14, 30, t, 1);
    c.globalAlpha = 1; c.filter = 'none';
    if (fuera) ppSelloDespedido(c, 0, 0, 92);
    c.restore();
    if (!id) continue;
    const nom = tr(PP_SLIMES[id].pasiva); c.font = `700 ${Math.round(19 * PP_LETRA)}px ${PP_FUENTE}`; const w = c.measureText(nom).width;
    const cabe = 100 * esc; ppTexto(c, nom, x, y + 62, w > cabe ? Math.floor(19 * cabe / w) : 19, '#fff');   // los nombres largos encogen para no pisar al vecino
    const fx = PP_SLIMES[id].fx, T = P.T;
    const parte = P.T && P.T.lo ? null : fx.salta ? (P.carga[id] || 0) / fx.salta : fx.combo && T ? (T.combo % fx.combo) / fx.combo : null;
    if (parte !== null) {
      c.fillStyle = '#1a1030'; c.beginPath(); c.roundRect(x - 36, y + 32, 72, 10, 5); c.fill();
      c.fillStyle = fx.salta ? '#ff6ec7' : '#5be7ff'; c.beginPath(); c.roundRect(x - 36, y + 32, Math.max(10, 72 * parte), 10, 5); c.fill();
    }
  }
}
// el sello de DESPEDIDO (el tampón rojo de Fans of Rouflage): torcido, con su marco doble, sobre el hueco del amigo
function ppSelloDespedido(c, x, y, ancho) {
  c.save(); c.translate(x, y); c.rotate(-0.22); c.scale(ancho / 100, ancho / 100);
  c.beginPath(); c.roundRect(-48, -18, 96, 36, 6); c.fillStyle = 'rgba(255,240,244,0.88)'; c.fill(); c.lineWidth = 3.6; c.strokeStyle = '#1a1030'; c.stroke();
  c.lineWidth = 2.6; c.strokeStyle = '#ff4b5c'; c.strokeRect(-43, -13, 86, 26);
  const txt = tr('DESPEDIDO'); c.font = `700 16px ${PP_FUENTE}`; const w = c.measureText(txt).width;
  if (w > 78) c.scale(78 / w, 78 / w);
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ff4b5c'; c.fillText(txt, 0, 1);
  c.restore();
}
// el centro del hueco k del equipo (para pintarlo y para que el slime salga volando desde ahí)
// con huecos comprados (5 o 6) se juntan y encogen un poco para caber
const ppEscalaEquipo = () => Math.min(1, 470 / ppHuecos() / 110);
function ppHuecoEquipo(k, n) { const g = ppGeom(n), y0 = g.y + g.lado + 60, nh = ppHuecos(); return [270 + (k - (nh - 1) / 2) * 110 * ppEscalaEquipo(), y0 + 62]; }
