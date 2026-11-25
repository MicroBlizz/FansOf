// Fans of Pop · MARCADOR: la cabecera de la partida (corazones, monedero, toques, estrellas y título) y el panel «Tu equipo» de abajo
// con los huecos de los amigos. Sale de pintar.js (tarea #110) para dejarlo por debajo de 25 KB. Las ayudas van
// justo bajo el tablero y «Tu equipo» debajo de ellas (tarea #269); en los duelos del camino, igual, con ¡LISTO! entre las dos ayudas
// (tarea 343, Pepins 25-11-2026: «el equipo donde siempre, los objetos donde siempre»; css/ayudas.css).
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
// Regla (dominio): el contador dice los toques que QUEDAN, no «usados / límite» (tarea #182, Pepins: «Toques 6/20» no se entendía).
// Nunca menos de 0. Con burbujitas el rótulo lleva la cifra («Quedan 5»); con el número, el rótulo es «Quedan» y la cifra va grande debajo.
const ppToquesQuedan = (limite, toques) => Math.max(0, limite - toques);
function ppRotuloToques(limite, toques, burbujitas) {
  return burbujitas ? tr('Quedan {n}', { n: ppToquesQuedan(limite, toques) }) : tr('Quedan');
}
// lo que se dice al sumar un toque, con quién lo da (tarea #182): «+1 toque: Caja de botín»
const ppTextoMasToque = quien => tr('+1 toque: {quien}', { quien: tr(quien) });
// Los toques, en todos los mundos (Pepins eligió el boceto C, 20-11-2026, tarea #182): «Quedan 6» y debajo las burbujitas, que se
// hunden al gastarse; con más de 20 (no caben), «Quedan» y la cifra grande. Sin el panel del mundo, el contorno es el de la tinta de siempre
// `dy`: cuánto bajan (en un nivel normal van en la segunda fila, bajo la barra de corazones, monedas y perlas: tarea #373)
function ppPintaToques(c, T, col, panel, tinta, dy = 0) {
  const reparto = ppToquesEnBurbujitas(T.limite, T.toques), burbujitas = reparto.modo === 'burbujitas';
  ppTexto(c, ppRotuloToques(T.limite, T.toques, burbujitas), 432, 34 + dy, burbujitas ? 28 : 22, tinta.rotulo, 'right', tinta.borde);   // a la izquierda del botón de pausa
  // con el último toque (o ninguno) el contorno avisa en el color del número de siempre, como avisaba el número
  const aviso = T.limite - T.toques <= 1;
  if (burbujitas) ppPintaToquesBurbujitas(c, reparto.filas, 432, 60 + dy, aviso ? '#ff8a2a' : panel ? panel.borde : tinta.borde);
  else ppTexto(c, String(ppToquesQuedan(T.limite, T.toques)), 432, 70 + dy, 52, col, 'right', tinta.borde);
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

const PP_CABECERA_NIVEL = 180;   // la cabecera de un nivel normal: la barra arriba y el título y los toques debajo (con 960 de alto el tablero empieza en 220)
// ¿sale el panel «Tu equipo»? En un nivel, desde el primer amigo (tarea #140); en un duelo del camino, si llevas equipo de Duelos
// (solo con el flag `companeros`: sin él los amigos no juegan los duelos; tarea 343)
function ppHayPanelEquipo(P, duelo) {
  if (duelo) return ppCompanerosActivo() && ppEquipoNivel(P.T.d).length > 0;
  return P.equipo.length > 0 || ppPrimerosVe('equipo');
}
// bajo la barra de un nivel normal: los toques a la derecha y el título con sus estrellas (y si es jefe o difícil) a la izquierda
function ppCabeceraNivel(c, T, panel, tinta) {
  const quedan = T.limite - T.toques, col = quedan < 0 ? '#ff5a5a' : quedan <= 1 ? '#ffd64a' : '#fff';
  ppPintaToques(c, T, col, panel, tinta, 82);
  ppTextoCabe(c, T.titulo || '', 135, 126, 34, 200, '#ffd64a', tinta.titulo);
  const est = ppEstrellas(T); for (let k = 0; k < 3; k++) ppEstrella(c, 105 + k * 30, 160, 28, k < est);
  if (T.d && T.d.jefe) ppTextoCabe(c, tr('¡Pocos toques extra!'), 135, 186, 22, 210, '#ff8a2a', '#fff');
  else if (T.d && T.d.dificil) ppTextoCabe(c, tr('¡Nivel difícil!'), 135, 186, 22, 210, '#ff6ec7', '#fff');
}
function ppPintaMarcador(c, t) {
  const P = PP_P, panel = ppEstiloDeTablero(P.T).panel, tinta = ppTintaPanel(panel), duelo = !!(P.T && P.T.nim);
  ppPanelDelMundo(c, 20, 18, 500, duelo ? PP_CABECERA_DUELO : PP_CABECERA_NIVEL, panel);
  const dano = PP_FX.dano;
  if (duelo) {   // nivel duelo: los corazones y el monedero de antes, y el rival, el turno y la regla (js/nimnivel.js); el equipo, abajo
    const vidas = ppVidas();
    for (let i = 0; i < PP_CFG.vida; i++) { const s = 34 + (i === vidas && dano > 0 ? dano * 10 : 0); ppCorazon(c, 44 + i * 40, 52, s, i < vidas); }
    ppPintaMonedero(c, 28, 88);   // bajo los corazones (la pausa va arriba a la derecha: Daniel, 17-11-2026)
    ppMarcadorNim(c, P.T, t);
  } else {
    // arriba, la barra de corazones, monedas y perlas (tarea #373, js/barra-recursos.js); debajo, el título con sus estrellas a la
    // izquierda y los toques a la derecha, junto a la pausa, que baja a esta fila (PP_BARRA_REGLAS.pausaBaja)
    ppBarraRecursos(c, 'nivel', 270, 56, { dano });
    if (P.T) ppCabeceraNivel(c, P.T, panel, tinta);
  }
  if (!ppHayPanelEquipo(P, duelo)) return;
  // el equipo, abajo: cada hueco con su slime, su pasiva y una barra de lo que le falta para actuar
  const n = P.T ? P.T.n : 3, y0 = ppEquipoY(n);
  ppPanelDelMundo(c, 20, y0 - 22, 500, ppFilaBajoTablero(P.T) ? 160 : 178, panel);   // bajo las ayudas, algo más bajito: cabe en un móvil corto
  ppTexto(c, tr('Tu equipo'), 270, y0 - 2, 24, tinta.rotulo, 'center', tinta.borde);
  const esc = ppEscalaEquipo(), eq = ppEquipoNivel(P.T && P.T.d);   // el equipo del modo del nivel (flag `companeros`; cerrado, el del camino)
  for (let k = 0; k < ppHuecosNivel(); k++) {
    const [x, y] = ppHuecoEquipo(k, n), id = eq[k], br = id ? PP_FX.brilla[id] || 0 : 0;
    c.save(); c.translate(x, y); c.scale(esc * (1 + br * 0.25), esc * (1 + br * 0.25));
    c.beginPath(); c.roundRect(-44, -44, 88, 88, 18); c.fillStyle = br ? `rgba(255,214,74,${0.3 + br * 0.5})` : id ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.35)'; c.fill(); c.lineWidth = 3; c.strokeStyle = ppBordeHueco(!!id, panel); c.stroke();
    const fuera = id && P.T && P.T.lo && ppHabDescansan();   // en pesadilla los amigos no ayudan: en gris y con el sello de DESPEDIDO encima
    if (fuera) { c.globalAlpha = 0.5; c.filter = 'grayscale(1)'; }
    if (id && !PP_FX.vuelos.some(v => v.id === id)) ppSlimeRepuestoOImagen(c, id, 0, -4 - br * 14, 30, t, 1);
    c.globalAlpha = 1; c.filter = 'none';
    if (fuera) ppSelloDespedido(c, 0, 0, 92);
    c.restore();
    if (!id) continue;
    const nom = tr(ppSlimeDe(id).pasiva); c.font = `700 ${Math.round(19 * PP_LETRA)}px ${PP_FUENTE}`; const w = c.measureText(nom).width;
    const cabe = 100 * esc; ppTexto(c, nom, x, y + 62, w > cabe ? Math.floor(19 * cabe / w) : 19, '#fff');   // los nombres largos encogen para no pisar al vecino
    const fx = ppFxDe(id), T = P.T;
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
const ppEscalaEquipo = () => Math.min(1, 470 / ppHuecosNivel() / 110);
function ppHuecoEquipo(k, n) { const y0 = ppEquipoY(n), nh = ppHuecosNivel(); return [270 + (k - (nh - 1) / 2) * 110 * ppEscalaEquipo(), y0 + 62]; }
// la altura del rótulo «Tu equipo»: bajo el tablero o, si el nivel tiene ayudas, bajo ellas (tarea #269, css/ayudas.css)
function ppEquipoY(n) { const g = ppGeom(n); return g.y + g.lado + (ppFilaBajoTablero(PP_P && PP_P.T) ? 160 : 60); }
