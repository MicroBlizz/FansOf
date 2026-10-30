// Fans of Pop · PANTALLAS: qué se ve ahora (portada, camino o nivel), las ventanas en HTML (amigo rescatado, nivel superado,
// descanso, sin corazones, final, cómo se juega) y el TUTORIAL DE LOLA: su bocadillo abajo, que explica los primeros niveles
// paso a paso (Daniel, 30-10-2026: «no tengo ni idea de jugar»). El lienzo pinta detrás; todo esto va en la capa #pp-ui.
'use strict';
const PP_PANT = { actual: 'titulo' };
const $pp = s => document.querySelector(s);
function ppIrA(p) {
  PP_PANT.actual = p;
  if (p === 'titulo') ppMusica('menu'); else ppMusicaRuta();
  $pp('#pp-titulo').hidden = p !== 'titulo';
  if (p !== 'sala') ppLolaCierra();
  if (p === 'titulo') {
    const hay = !!(SAVE.run && SAVE.run.nivel > 0);
    $pp('#pp-record').textContent = hay ? tr('Vas por el nivel {n}', { n: SAVE.run.nivel + 1 }) : SAVE.estrellas ? tr('Récord: {n} estrellas', { n: SAVE.estrellas }) : tr('Revienta burbujas, rescata amigos');
    $pp('#pp-seguir').hidden = !hay;
    $pp('#pp-jugar').textContent = hay ? tr('EMPEZAR DE NUEVO') : tr('JUGAR');
    $pp('#pp-jugar').className = hay ? 'pp-btn2 pp-azul' : 'pp-btn pp-enorme';
    $pp('#pp-sonido').textContent = SAVE.muted ? tr('SONIDO: NO') : tr('SONIDO: SÍ');
  }
}
function ppAbre(html, ancha = false) { const m = $pp('#pp-modal'), t = $pp('#pp-tarjeta'); t.className = 'pp-tarjeta' + (ancha ? ' pp-ancha' : ''); t.innerHTML = html; m.hidden = false; return t; }
function ppCierra() { $pp('#pp-modal').hidden = true; }
function ppBoton(texto, clase, f) { const b = document.createElement('button'); b.type = 'button'; b.className = clase; b.textContent = texto; b.onclick = () => { play('select'); f(); }; return b; }
const ppAlCamino = () => { ppCierra(); ppIrA('mapa'); };
// las estrellas del nivel en HTML (dibujo de Yoshi si está; si no, una estrella recortada con CSS)
function ppEstrellasHtml(n, total = 3) {
  let h = '<div class="pp-estrellas">';
  for (let k = 0; k < total; k++) h += `<span class="pp-est${k < n ? ' pp-on' : ''}" style="animation-delay:${0.15 + k * 0.18}s">${PP_IMG['i-estrella'] ? '<img src="img/i-estrella.png" alt="">' : ''}</span>`;
  return h + '</div>';
}
// la tarjeta de un amigo (dibujo + nombre + lo que hace)
function ppFichaSlime(id, nuevo = false) {
  const d = PP_SLIMES[id], el = document.createElement('div'); el.className = 'pp-slime' + (nuevo ? ' pp-nuevo' : '');
  el.appendChild(ppMiniatura('sl-' + id, 84));
  el.insertAdjacentHTML('beforeend', `<b>${tr(d.nombre)}</b><i>${tr(d.pasiva)}</i><span>${tr(d.texto)}</span>`);
  return el;
}
/* ---------- rescate: elige qué amigo se une ---------- */
function ppVentanaRescate(presos) {
  const t = ppAbre(`<h2>${tr('¡Nivel superado!')}</h2>${ppEstrellasHtml(PP_P.T.estrellas)}<p class="pp-sub">${presos.length > 1 ? tr('Has rescatado a estos amigos. Elige quién viene contigo:') : tr('¡Has rescatado a un amigo! ¿Viene contigo?')}</p>`, true);
  const fila = document.createElement('div'); fila.className = 'pp-fila-slimes';
  for (const id of presos) { const f = ppFichaSlime(id, true); f.onclick = () => { play('select'); ppEligeRescate(id); }; fila.appendChild(f); }
  t.appendChild(fila);
  if (presos.length === 1) t.appendChild(ppBoton(tr('¡QUE VENGA!'), 'pp-btn', () => ppEligeRescate(presos[0])));
  else t.insertAdjacentHTML('beforeend', `<p class="pp-sub">${tr('Toca una ficha para elegir.')}</p>`);
  t.appendChild(ppBoton(tr('Seguir sin nadie'), 'pp-btn2 pp-azul', ppAlCamino));
}
function ppEligeRescate(id) {
  if (PP_P.equipo.length < PP_CFG.equipo) { ppRecluta(id); ppVentanaBienvenida(id); return; }
  // el equipo está lleno: hay que dejar a uno
  const t = ppAbre(`<h2>${tr('Equipo lleno')}</h2><p class="pp-sub">${tr('¿Quién se queda descansando para que venga {n}?', { n: tr(PP_SLIMES[id].nombre) })}</p>`, true);
  const fila = document.createElement('div'); fila.className = 'pp-fila-slimes';
  for (const k of PP_P.equipo) { const f = ppFichaSlime(k); f.onclick = () => { play('select'); ppRecluta(id, k); ppVentanaBienvenida(id); }; fila.appendChild(f); }
  t.appendChild(fila);
  t.appendChild(ppBoton(tr('Mejor no'), 'pp-btn2 pp-azul', ppAlCamino));
}
function ppVentanaBienvenida(id) {
  const d = PP_SLIMES[id];
  const t = ppAbre(`<h2>${tr('¡{n} viene contigo!', { n: tr(d.nombre) })}</h2>`);
  t.appendChild(ppFichaSlime(id, true));
  t.appendChild(ppBoton(tr('¡VAMOS!'), 'pp-btn', ppAlCamino));
}
function ppVentanaSalaHecha() {
  const t = ppAbre(`<h2>${tr('¡Nivel superado!')}</h2>${ppEstrellasHtml(PP_P.T.estrellas)}`);
  t.appendChild(ppBoton(tr('¡SIGUIENTE!'), 'pp-btn', ppAlCamino));
}
function ppVentanaDescanso(cura) {
  const t = ppAbre(`<h2>${tr('¡A descansar!')}</h2><p class="pp-sub">${tr('Tus amigos se echan una siesta entre las flores. Recuperas {n} corazones.', { n: cura })}</p>`);
  t.appendChild(ppBoton(tr('¡SIGUIENTE!'), 'pp-btn', ppAlCamino));
}
function ppVentanaSinCorazones() {
  const t = ppAbre(`<h2>${tr('¡Uy! Sin corazones')}</h2><p class="pp-sub">${tr('No pasa nada: sigues en el nivel {n} con {c} corazones.', { n: PP_P.nivel + 1, c: PP_CFG.vidaSeguir })}</p>`);
  t.appendChild(ppBoton(tr('¡OTRA VEZ!'), 'pp-btn', () => { ppCierra(); ppSigueConCorazones(); }));
  t.appendChild(ppBoton(tr('Al camino'), 'pp-btn2 pp-azul', () => { PP_P.vida = Math.min(PP_P.vidaMax, PP_CFG.vidaSeguir); ppGuardaCamino(); ppAlCamino(); }));
}
function ppVentanaFin() {
  const P = PP_P;
  const t = ppAbre(`<h2>${tr('¡VICTORIA!')}</h2><p class="pp-sub">${tr('¡Plop! El CEO ha quedado reventado y todos los amigos son libres.')}</p><p class="pp-sub"><b>${tr('Estrellas: {n}', { n: P.estrellas })}</b>${P.estrellas >= (SAVE.estrellas || 0) && P.estrellas ? ' · ' + tr('¡Nuevo récord!') : ' · ' + tr('Récord: {n}', { n: SAVE.estrellas || 0 })}</p>`, true);
  if (P.rescatados.length) { t.insertAdjacentHTML('beforeend', `<p class="pp-sub"><b>${tr('Rescatados')}</b></p>`); const fila = document.createElement('div'); fila.className = 'pp-fila-slimes pp-mini'; for (const id of P.rescatados) fila.appendChild(ppFichaSlime(id)); t.appendChild(fila); }
  t.appendChild(ppBoton(tr('JUGAR OTRA VEZ'), 'pp-btn', () => { ppCierra(); ppNuevaRuta(); ppIrA('mapa'); }));
  t.appendChild(ppBoton(tr('Portada'), 'pp-btn2 pp-azul', () => { ppCierra(); PP_P = null; ppIrA('titulo'); }));
}
function ppAyuda() {
  const t = ppAbre(`<h2>${tr('Cómo se juega')}</h2>
    <p class="pp-sub">${tr('Toca una burbuja: se revientan ella y sus vecinas (arriba, abajo, izquierda y derecha). Si una ya estaba reventada, vuelve a subir.')}</p>
    <p class="pp-sub">${tr('Revienta TODAS para pasar el nivel. Con pocos toques ganas 3 estrellas.')}</p>
    <p class="pp-sub">${tr('Dentro de algunas burbujas hay amigos atrapados: rescátalos y te ayudarán.')}</p>
    <p class="pp-sub">${tr('Truco: si en una fila queda una burbuja sin reventar, toca la que está justo debajo.')}</p>`, true);
  t.appendChild(ppBoton(tr('¡ENTENDIDO!'), 'pp-btn', () => { ppCierra(); SAVE.ayuda = true; ppGuarda(); }));
}
/* ---------- el tutorial de Lola ----------
   Cada tutorial es una lista de frases. Las que llevan `toque` se cierran solas cuando tocas una burbuja (para que lo hagas
   mientras Lola te lo dice); las demás llevan un botón. Cada tutorial sale una sola vez (SAVE.tuto). */
const PP_TUTO = {
  n1: [{ t: '¡Hola! Soy Lola. ¡Vamos a reventar burbujas juntos!' }, { t: 'Toca la burbuja que señala la manita.', toque: true }],
  n2: [{ t: 'Al tocar una burbuja se revientan ella y sus vecinas: arriba, abajo, izquierda y derecha.' },
       { t: '¡Ojo! Si una vecina ya estaba reventada, vuelve a subir.' },
       { t: 'Hay un amigo atrapado en una burbuja. ¡Revienta TODAS para rescatarlo! Sigue a la manita.', toque: true }],
  n3: [{ t: 'Ahora sin manita. Arriba ves tus toques: si lo resuelves con pocos, ¡ganas 3 estrellas!' },
       { t: 'Si te pasas de toques pierdes un corazón. ¡Tranqui, no pasa nada!' }],
  amigo: [{ t: '¡Ya tienes un amigo! Mira abajo: cada uno te ayuda a su manera.' }, { t: 'Cuando su barrita se llena, ¡te echa una mano solo!' }],
  n5: [{ t: '¡Un tablero más grande! Te cuento un truco.' },
       { t: 'Mira la fila de arriba. Si queda una burbuja sin reventar, toca la que está justo debajo. ¡Y así fila a fila!' }],
  combo: [{ t: '¡COMBO! Si cada toque revienta más burbujas de las que suben, el combo crece.' }],
  jefe: [{ t: '¡El CEO ha llenado su pop-it de trampas!' }, { t: 'Las burbujas con ! no las toques tú: revientan solas cuando tocas sus vecinas.' }],
};
const PP_LOLA = { cola: [], actual: null };
function ppTutorial(k) {
  if (!PP_TUTO[k] || SAVE.tuto[k]) return;
  SAVE.tuto[k] = true; ppGuarda();
  PP_LOLA.cola.push(...PP_TUTO[k]);
  if (!PP_LOLA.actual) ppLolaSiguiente();
}
function ppLolaSiguiente() {
  const caja = $pp('#pp-lola'), f = PP_LOLA.cola.shift();
  PP_LOLA.actual = f || null;
  if (!f) { caja.hidden = true; return; }
  const cara = $pp('#pp-lola-cara'); cara.innerHTML = ''; cara.appendChild(ppMiniatura('sl-lola', 92));
  $pp('#pp-lola-texto').textContent = tr(f.t);
  $pp('#pp-lola-vale').hidden = !!f.toque;
  caja.hidden = false; caja.classList.remove('pp-entra'); void caja.offsetWidth; caja.classList.add('pp-entra');
  play('ppPista');
}
// la frase que espera a que toques una burbuja
function ppLolaToque() { if (PP_LOLA.actual && PP_LOLA.actual.toque) ppLolaSiguiente(); }
function ppLolaCierra() { PP_LOLA.cola = []; PP_LOLA.actual = null; const c = $pp('#pp-lola'); if (c) c.hidden = true; }
