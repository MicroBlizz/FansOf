// Fans of Pop · PANTALLAS: qué se ve ahora (portada, mapa o sala) y las ventanas en HTML (rescate de slimes, sala superada,
// descanso, final de la ruta, cómo se juega). El lienzo pinta detrás; las ventanas van en la capa #pp-ui.
'use strict';
const PP_PANT = { actual: 'titulo' };
const $pp = s => document.querySelector(s);
function ppIrA(p) {
  PP_PANT.actual = p;
  if (p === 'titulo') ppMusica('menu'); else ppMusicaRuta();
  $pp('#pp-titulo').hidden = p !== 'titulo';
  if (p === 'titulo') { $pp('#pp-record').textContent = SAVE.record ? tr('Récord: {n} salas', { n: SAVE.record }) + (SAVE.estrellas ? ' · ' + tr('Estrellas: {n}', { n: SAVE.estrellas }) : '') : tr('Revienta burbujas, rescata slimes'); $pp('#pp-sonido').textContent = SAVE.muted ? tr('SONIDO: NO') : tr('SONIDO: SÍ'); }
}
function ppAbre(html, ancha = false) { const m = $pp('#pp-modal'), t = $pp('#pp-tarjeta'); t.className = 'pp-tarjeta' + (ancha ? ' pp-ancha' : ''); t.innerHTML = html; m.hidden = false; return t; }
function ppCierra() { $pp('#pp-modal').hidden = true; }
function ppBoton(texto, clase, f) { const b = document.createElement('button'); b.type = 'button'; b.className = clase; b.textContent = texto; b.onclick = () => { play('select'); f(); }; return b; }
// las estrellas de la sala en HTML (dibujo de Yoshi si está; si no, una estrella recortada con CSS)
function ppEstrellasHtml(n, total = 3) {
  let h = '<div class="pp-estrellas">';
  for (let k = 0; k < total; k++) h += `<span class="pp-est${k < n ? ' pp-on' : ''}" style="animation-delay:${0.15 + k * 0.18}s">${PP_IMG['i-estrella'] ? '<img src="img/i-estrella.png" alt="">' : ''}</span>`;
  return h + '</div>';
}
// la tarjeta de un slime (dibujo + nombre + pasiva)
function ppFichaSlime(id, nuevo = false) {
  const d = PP_SLIMES[id], el = document.createElement('div'); el.className = 'pp-slime' + (nuevo ? ' pp-nuevo' : '');
  el.appendChild(ppMiniatura('sl-' + id, 84));
  el.insertAdjacentHTML('beforeend', `<b>${tr(d.nombre)}</b><i>${tr(d.pasiva)}</i><span>${tr(d.texto)}</span>`);
  return el;
}
/* ---------- rescate: elige qué slime se une ---------- */
function ppVentanaRescate(presos) {
  const t = ppAbre(`<h2>${tr('¡Sala superada!')}</h2>${ppEstrellasHtml(PP_P.T.estrellas)}<p class="pp-sub">${presos.length > 1 ? tr('Has liberado a estos slimes. Elige quién se une a tu equipo:') : tr('Has liberado a un slime. ¿Se une a tu equipo?')}</p>`, true);
  const fila = document.createElement('div'); fila.className = 'pp-fila-slimes';
  for (const id of presos) { const f = ppFichaSlime(id, true); f.onclick = () => { play('select'); ppEligeRescate(id); }; fila.appendChild(f); }
  t.appendChild(fila);
  if (presos.length === 1) t.appendChild(ppBoton(tr('¡QUE SE UNA!'), 'pp-btn', () => ppEligeRescate(presos[0])));
  else t.insertAdjacentHTML('beforeend', `<p class="pp-sub">${tr('Toca una ficha para elegir.')}</p>`);
  t.appendChild(ppBoton(tr('Seguir sin nadie'), 'pp-btn2 pp-azul', () => { ppCierra(); ppIrA('mapa'); }));
}
function ppEligeRescate(id) {
  if (PP_P.equipo.length < PP_CFG.equipo) { ppRecluta(id); ppVentanaBienvenida(id); return; }
  // el equipo está lleno: hay que dejar a uno
  const t = ppAbre(`<h2>${tr('Equipo lleno')}</h2><p class="pp-sub">${tr('¿A quién dejas marchar para que entre {n}?', { n: tr(PP_SLIMES[id].nombre) })}</p>`, true);
  const fila = document.createElement('div'); fila.className = 'pp-fila-slimes';
  for (const k of PP_P.equipo) { const f = ppFichaSlime(k); f.onclick = () => { play('select'); ppRecluta(id, k); ppVentanaBienvenida(id); }; fila.appendChild(f); }
  t.appendChild(fila);
  t.appendChild(ppBoton(tr('Mejor no'), 'pp-btn2 pp-azul', () => { ppCierra(); ppIrA('mapa'); }));
}
function ppVentanaBienvenida(id) {
  const d = PP_SLIMES[id];
  const t = ppAbre(`<h2>${tr('¡{n} se une!', { n: tr(d.nombre) })}</h2>`);
  t.appendChild(ppFichaSlime(id, true));
  t.insertAdjacentHTML('beforeend', `<p class="pp-sub">${tr('Pasiva activa desde la siguiente sala.')}</p>`);
  t.appendChild(ppBoton(tr('A LA RUTA'), 'pp-btn', () => { ppCierra(); ppIrA('mapa'); }));
}
function ppVentanaSalaHecha() {
  const t = ppAbre(`<h2>${tr('¡Sala superada!')}</h2>${ppEstrellasHtml(PP_P.T.estrellas)}<p class="pp-sub">${tr('Aquí no había nadie atrapado. Sigue adelante.')}</p>`);
  t.appendChild(ppBoton(tr('A LA RUTA'), 'pp-btn', () => { ppCierra(); ppIrA('mapa'); }));
}
function ppVentanaDescanso(cura) {
  const t = ppAbre(`<h2>${tr('Descanso')}</h2><p class="pp-sub">${tr('Los slimes se echan una siesta en la gelatina. Recuperas {n} corazones.', { n: cura })}</p>`);
  t.appendChild(ppBoton(tr('A LA RUTA'), 'pp-btn', () => { ppCierra(); ppIrA('mapa'); }));
}
function ppVentanaFin(victoria) {
  const P = PP_P;
  const t = ppAbre(`<h2>${victoria ? tr('¡VICTORIA!') : tr('Sin corazones')}</h2><p class="pp-sub">${victoria ? tr('El CEO ha quedado reventado. Los slimes son libres.') : tr('Te has quedado sin corazones en {n}.', { n: tr(PP_CFG.salas[P.tipo].titulo) })}</p><p class="pp-sub">${tr('Salas superadas: {n}', { n: P.salas })}</p><p class="pp-sub"><b>${tr('Estrellas: {n}', { n: P.estrellas })}</b>${P.estrellas >= (SAVE.estrellas || 0) && P.estrellas ? ' · ' + tr('¡Nuevo récord!') : ' · ' + tr('Récord: {n}', { n: SAVE.estrellas || 0 })}</p>`, true);
  if (P.rescatados.length) { t.insertAdjacentHTML('beforeend', `<p class="pp-sub"><b>${tr('Rescatados')}</b></p>`); const fila = document.createElement('div'); fila.className = 'pp-fila-slimes pp-mini'; for (const id of P.rescatados) fila.appendChild(ppFichaSlime(id)); t.appendChild(fila); }
  t.appendChild(ppBoton(tr('OTRA RUTA'), 'pp-btn', () => { ppCierra(); ppNuevaRuta(); ppIrA('mapa'); }));
  t.appendChild(ppBoton(tr('Portada'), 'pp-btn2 pp-azul', () => { ppCierra(); PP_P = null; ppIrA('titulo'); }));
}
function ppAyuda() {
  const t = ppAbre(`<h2>${tr('Cómo se juega')}</h2>
    <p class="pp-sub">${tr('Toca una burbuja: ella y sus cuatro vecinas se dan la vuelta. Revienta TODAS para superar la sala.')}</p>
    <p class="pp-sub">${tr('Cada sala tiene un límite de toques. Pasarte cuesta un corazón; sin corazones, se acaba la ruta.')}</p>
    <p class="pp-sub">${tr('Dentro de algunas burbujas hay slimes atrapados. Al superar la sala se unen a tu equipo y cada uno trae una pasiva.')}</p>
    <p class="pp-sub">${tr('Revienta más burbujas de las que suben en toques seguidos para hacer COMBO: algunos slimes actúan con los combos.')}</p>
    <p class="pp-sub">${tr('Resuelve con los toques justos para ganar 3 estrellas.')}</p>
    <p class="pp-sub">${tr('Al final de la ruta te espera el CEO: su tablero tiene burbujas trampa.')}</p>`, true);
  t.appendChild(ppBoton(tr('ENTENDIDO'), 'pp-btn', () => { ppCierra(); SAVE.ayuda = true; ppGuarda(); }));
}
