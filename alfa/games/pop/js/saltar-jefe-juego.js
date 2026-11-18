// Fans of Pop · SALTAR AL JEFE en el juego (tarea #95, ADR 152): lo que se ve y se toca. Las reglas están en js/saltar-jefe.js (PP_SALTO).
// · ppSaltoActivo(): el flag 'saltar-jefe' de Pop, preguntado en el momento. Cerrado, no sale el botón; un jefe que ya quedó pendiente
//   sigue pendiente (el mapa lo enseña y se le puede ganar), para que la partida nunca quede a medias.
// · ppBotonSaltarJefe(t, d): el botón rosa «ABRIR MUNDO n · 40 perlas» en la ventana de perder con el jefe (ppNimFin, js/nimnivel.js).
// · Las ventanas: «¿Abrir la Pastelería?» (o «Te faltan N perlas»), y «¡Mundo abierto!» con ¡VAMOS! al mapa del mundo nuevo.
// · ppGanaPendiente(m): al ganar a un jefe pendiente (ppSalaHecha, js/partida.js), deja de estarlo.
'use strict';
const ppSaltoActivo = () => NUCLEO.flag('saltar-jefe', 'Pop: abrir el mundo siguiente con perlas al atascarte en un jefe (tarea #95, ADR 152)', false);
// lo que dice la regla del jefe que se acaba de perder (los fallos ya cuentan este)
const ppSaltoOferta = d => PP_SALTO.ofrece(PP_P.nivel, { jefe: d.jefe, dif: d.dif, g: d.g, mundo: d.mundo, fallos: (SAVE.fallos || {})[ppClaveNivel(d)] || 0, mundos: PP_MUNDOS.length }, PP_CFG.saltarJefe);
// «la Pastelería» / «el Jardín»: cada frase con su artículo, para que se traduzca entera
const ppConArt = (m, la, el) => tr(PP_MUNDOS[m].art === 'la' ? la : el, { mundo: tr(PP_MUNDOS[m].nombre) });

function ppBotonSaltarJefe(t, d) {
  if (!ppSaltoActivo()) return;
  const r = ppSaltoOferta(d);
  if (!r.ok) return;
  const b = ppBoton('', 'pp-btn2 pp-rosa', () => ppVentanaAbrirMundo(d));
  b.innerHTML = `${tr('ABRIR MUNDO {n}', { n: r.siguiente + 1 })} · ${ppPerlasHtml(r.perlas, 26)}`;
  t.appendChild(b);
}
// la miniatura del mundo: su fondo recortado en apaisado (sin el dibujo aún, un degradado rosa)
function ppMiniMundo(m) {
  const cv = document.createElement('canvas'), W = 240, H = 135, im = PP_IMG[PP_MUNDOS[m].fondo];
  cv.width = W; cv.height = H; cv.className = 'pp-mini-mundo';
  const c = cv.getContext('2d');
  if (im) { const h = im.width * H / W; c.imageSmoothingEnabled = PP_LISO; c.drawImage(im, 0, (im.height - h) / 2, im.width, h, 0, 0, W, H); }
  else { const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#ffd1ec'); gr.addColorStop(1, '#c8f0ff'); c.fillStyle = gr; c.fillRect(0, 0, W, H); }
  return cv;
}
// ¿abrir el mundo siguiente? Con las perlas justas o más, ABRIR; si no llegan, cuántas faltan y la tienda (que vuelve aquí)
function ppVentanaAbrirMundo(d) {
  const r = ppSaltoOferta(d);
  if (!r.ok) { ppAlCamino(); return; }
  const sig = r.siguiente, paga = PP_SALTO.paga(SAVE.perlas || 0, r.perlas);
  const t = ppAbre(`<h2>${ppConArt(sig, '¿Abrir la {mundo}?', '¿Abrir el {mundo}?')}</h2>`);
  t.appendChild(ppMiniMundo(sig));
  const espera = ppConArt(d.mundo, 'Se queda esperándote en la {mundo}: vuelve a por él cuando quieras.', 'Se queda esperándote en el {mundo}: vuelve a por él cuando quieras.');
  t.insertAdjacentHTML('beforeend', `<p class="pp-sub">${tr('Pasas al mundo {n} sin ganar a este jefe.', { n: sig + 1 })} ${espera}</p><p class="pp-sub">${tr('Su modo difícil se abre cuando le ganes.')}</p>`);
  if (paga.ok) {
    const b = ppBoton('', 'pp-btn2 pp-verde', () => ppSaltaJefe(d, r));
    b.innerHTML = `${tr('ABRIR')} · ${ppPerlasHtml(r.perlas, 26)}`;
    t.appendChild(b);
  } else {
    t.insertAdjacentHTML('beforeend', `<p class="pp-sub"><b>${tr('Te faltan {n} perlas: tienes {x} y cuesta {p}.', { n: paga.faltan, x: SAVE.perlas || 0, p: r.perlas })}</b></p>`);
    t.appendChild(ppBoton(tr('TIENDA'), 'pp-btn2 pp-oro', () => ppTienda(() => ppVentanaAbrirMundo(d), 'perlas')));
  }
  t.appendChild(ppBoton(tr('Ahora no'), 'pp-btn2 pp-azul', ppAlCamino));
}
// pagar y saltar: el camino pasa al nivel 1 del mundo siguiente y el jefe queda pendiente
function ppSaltaJefe(d, r) {
  const s = PP_SALTO.salta({ nivel: PP_P.nivel, pendientes: PP_P.pendientes }, d.mundo, ppInicioMundo(r.siguiente));
  if (!s.ok) { ppAlCamino(); return; }
  if (!ppPerlas(-r.perlas, 'mundo')) { ppTienda(() => ppVentanaAbrirMundo(d), 'perlas'); return; }   // no llegaban de verdad (lo pendiente con el servidor): a la tienda, que vuelve aquí
  PP_P.nivel = s.nivel; PP_P.pendientes = [...s.pendientes];
  ppGuardaCamino(); play('ppVictoria');
  ppVentanaMundoAbierto(r.siguiente);
}
function ppVentanaMundoAbierto(m) {
  const t = ppAbre(`<h2>${tr('¡Mundo abierto!')}</h2>`);
  t.appendChild(ppMiniMundo(m));
  t.insertAdjacentHTML('beforeend', `<p class="pp-sub">${tr('Mundo {n}: {nombre}.', { n: m + 1, nombre: tr(PP_MUNDOS[m].nombre) })}</p>`);
  t.appendChild(ppBoton(tr('¡VAMOS!'), 'pp-btn', () => { ppMapaVer(m, 0); ppAlCamino(); }));
}
// al ganar a un jefe: si estaba pendiente deja de estarlo (true); el camino no se mueve, ya iba por delante
function ppGanaPendiente(m) {
  const r = PP_SALTO.gana(PP_P.pendientes, m);
  if (r.ok) PP_P.pendientes = [...r.pendientes];
  return r.ok;
}
