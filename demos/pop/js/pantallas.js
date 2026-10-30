// Fans of Pop · PANTALLAS: qué se ve ahora (portada, camino o nivel), las ventanas en HTML (amigo rescatado, nivel superado,
// descanso, sin corazones, final, cómo se juega) y el TUTORIAL DE LOLA: su bocadillo abajo, que explica los primeros niveles
// paso a paso (Daniel, 30-10-2026: «no tengo ni idea de jugar»). El lienzo pinta detrás; todo esto va en la capa #pp-ui.
'use strict';
const PP_PANT = { actual: 'titulo', pausa: false };
const $pp = s => document.querySelector(s);
function ppIrA(p) {
  PP_PANT.actual = p;
  if (p === 'titulo') ppMusica('menu'); else ppMusicaRuta();
  $pp('#pp-titulo').hidden = p !== 'titulo';
  if (p !== 'sala' && p !== 'duelo' && p !== 'memoria') ppLolaCierra();
  if (p !== 'duelo') $pp('#pp-listo').hidden = true;
  $pp('#pp-pausa').hidden = p === 'titulo';
  if (p === 'titulo') {
    const hay = !!(SAVE.run && SAVE.run.nivel > 0);
    $pp('#pp-record').textContent = hay ? tr('Vas por el nivel {n}', { n: SAVE.run.nivel + 1 }) : SAVE.estrellas ? tr('Récord: {n} estrellas', { n: SAVE.estrellas }) : tr('Revienta burbujas, rescata amigos');
    $pp('#pp-seguir').hidden = !hay;
    $pp('#pp-jugar').textContent = hay ? tr('EMPEZAR DE NUEVO') : tr('JUGAR');
    $pp('#pp-jugar').className = hay ? 'pp-btn2 pp-azul' : 'pp-btn pp-enorme';
    $pp('#pp-sonido').textContent = SAVE.muted ? tr('SONIDO: NO') : tr('SONIDO: SÍ');
    $pp('#pp-estilo').textContent = ppTextoEstilo();
    $pp('#pp-duelo').textContent = tr('DUELO CONTRA EL CEO');
    $pp('#pp-memoria').textContent = tr('MEMORIA');
  }
}
function ppAbre(html, ancha = false) { const m = $pp('#pp-modal'), t = $pp('#pp-tarjeta'); t.className = 'pp-tarjeta' + (ancha ? ' pp-ancha' : ''); t.innerHTML = html; m.hidden = false; return t; }
function ppCierra() { $pp('#pp-modal').hidden = true; }
function ppBoton(texto, clase, f) { const b = document.createElement('button'); b.type = 'button'; b.className = clase; b.textContent = texto; b.onclick = () => { play('select'); f(); }; return b; }
const ppAlCamino = () => { ppCierra(); ppIrA('mapa'); };
// las estrellas del nivel en HTML (dibujo de Yoshi si está; si no, una estrella recortada con CSS)
function ppEstrellasHtml(n, total = 3) {
  let h = '<div class="pp-estrellas">';
  for (let k = 0; k < total; k++) h += `<span class="pp-est${k < n ? ' pp-on' : ''}" style="animation-delay:${0.15 + k * 0.18}s">${PP_IMG['i-estrella'] ? `<img src="${PP_LISO ? 'img-liso' : 'img'}/i-estrella.png" alt=""${PP_LISO ? ' style="image-rendering:auto"' : ''}>` : ''}</span>`;
  return h + '</div>';
}
// un icono de Yoshi en HTML (moneda, cofre…); si aún no está, una bolita de color
function ppIcono(k, px, col = '#ffd64a') {
  return PP_IMG[k] ? `<img class="pp-ico" src="${PP_LISO ? 'img-liso' : 'img'}/${k}.png" alt="" style="width:${px}px;height:${px}px${PP_LISO ? ';image-rendering:auto' : ''}">`
    : `<span class="pp-ico" style="width:${px}px;height:${px}px;background:${col}"></span>`;
}
const ppMonedasHtml = (n, px = 30) => `<span class="pp-precio">${ppIcono('i-moneda', px)}${n}</span>`;
// lo ganado en el nivel: monedas y, si toca, un cofre
function ppPremioHtml(p) {
  if (!p || !(p.monedas || p.cofre)) return '';
  let h = p.monedas ? `<p class="pp-premio">+${ppMonedasHtml(p.monedas)}</p>` : '';
  if (p.cofre) h += `<div class="pp-cofre">${ppIcono('i-cofre', 92, '#ff9ccf')}<p class="pp-sub"><b>${tr('¡Cofre!')}</b> +${ppMonedasHtml(p.cofre)}${p.perlas ? ' +' + ppPerlasHtml(p.perlas) : ''}</p></div>`;
  return h;
}
// un botón con precio en monedas: si no llegan, apagado y con lo que falta
function ppBotonPrecio(texto, precio, clase, f) {
  const b = ppBoton('', clase, () => { if (SAVE.monedas >= precio) f(); });
  b.innerHTML = `${texto} · ${ppMonedasHtml(precio, 28)}`;
  if (SAVE.monedas < precio) { b.disabled = true; b.title = tr('Te faltan {n} monedas', { n: precio - SAVE.monedas }); }
  return b;
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
  const t = ppAbre(`<h2>${tr('¡Nivel superado!')}</h2>${ppEstrellasHtml(PP_P.T.estrellas)}${ppPremioHtml(PP_P.T.premio)}<p class="pp-sub">${presos.length > 1 ? tr('Has rescatado a estos amigos. Elige quién viene contigo:') : tr('¡Has rescatado a un amigo! ¿Viene contigo?')}</p>`, true);
  const fila = document.createElement('div'); fila.className = 'pp-fila-slimes';
  for (const id of presos) { const f = ppFichaSlime(id, true); f.onclick = () => { play('select'); ppEligeRescate(id); }; fila.appendChild(f); }
  t.appendChild(fila);
  if (presos.length === 1) t.appendChild(ppBoton(tr('¡QUE VENGA!'), 'pp-btn', () => ppEligeRescate(presos[0])));
  else t.insertAdjacentHTML('beforeend', `<p class="pp-sub">${tr('Toca una ficha para elegir.')}</p>`);
  t.appendChild(ppBoton(tr('Seguir sin nadie'), 'pp-btn2 pp-azul', ppAlCamino));
}
function ppEligeRescate(id) {
  if (PP_P.equipo.length < ppHuecos()) { ppRecluta(id); ppVentanaBienvenida(id); return; }
  // el equipo está lleno: hay que dejar a uno… o comprar un hueco más con monedas (Daniel, 30-10-2026)
  const precio = ppPrecioHueco();
  const t = ppAbre(`<h2>${tr('Equipo lleno')}</h2><p class="pp-sub">${tr('¿Quién se queda descansando para que venga {n}?', { n: tr(PP_SLIMES[id].nombre) })}</p>`, true);
  const fila = document.createElement('div'); fila.className = 'pp-fila-slimes';
  for (const k of PP_P.equipo) { const f = ppFichaSlime(k); f.onclick = () => { play('select'); ppRecluta(id, k); ppVentanaBienvenida(id); }; fila.appendChild(f); }
  t.appendChild(fila);
  if (precio !== null) {
    t.insertAdjacentHTML('beforeend', `<p class="pp-sub">${tr('O hazle sitio: un hueco más en el equipo, para siempre.')} ${tr('Tienes:')} ${ppMonedasHtml(SAVE.monedas, 26)}</p>`);
    t.appendChild(ppBotonPrecio(tr('HUECO MÁS'), precio, 'pp-btn', () => { if (ppCompraHueco()) { play('ppPremio'); ppRecluta(id); ppVentanaBienvenida(id); } }));
    t.appendChild(ppBotonPerlas(tr('HUECO MÁS'), PP_CFG.perlas.hueco[SAVE.huecos || 0], 'pp-btn2 pp-rosa', () => { SAVE.huecos = (SAVE.huecos || 0) + 1; ppGuarda(); play('ppPremio'); ppRecluta(id); ppVentanaBienvenida(id); }, () => ppEligeRescate(id)));
  }
  t.appendChild(ppBoton(tr('Mejor no'), 'pp-btn2 pp-azul', ppAlCamino));
}
function ppVentanaBienvenida(id) {
  const d = PP_SLIMES[id];
  const t = ppAbre(`<h2>${tr('¡{n} viene contigo!', { n: tr(d.nombre) })}</h2>`);
  t.appendChild(ppFichaSlime(id, true));
  t.appendChild(ppBoton(tr('¡VAMOS!'), 'pp-btn', ppAlCamino));
}
function ppVentanaSalaHecha() {
  const t = ppAbre(`<h2>${tr('¡Nivel superado!')}</h2>${ppEstrellasHtml(PP_P.T.estrellas)}${ppPremioHtml(PP_P.T.premio)}`);
  t.appendChild(ppBoton(tr('¡SIGUIENTE!'), 'pp-btn', ppAlCamino));
  if (PP_P.T.estrellas < 3) t.appendChild(ppBoton(tr('A por 3 estrellas'), 'pp-btn2 pp-azul', ppOtraVez));
}
// sin toques: se ha perdido un corazón (partida.js) y se repite el nivel o se vuelve al camino
function ppVentanaSinToques() {
  const t = ppAbre(`<h2>${tr('¡Sin toques!')}</h2><p class="pp-sub">${tr('Se te han acabado los toques. Pierdes un corazón; te quedan {n}.', { n: SAVE.vidas })}</p>`);
  t.appendChild(ppBoton(tr('¡OTRA VEZ!'), 'pp-btn', ppOtraVez));
  t.appendChild(ppBoton(tr('Al camino'), 'pp-btn2 pp-azul', ppAlCamino));
}
// el jefe de un mundo superado: se abre el siguiente
// y se abre su modo difícil. `dif`: era el jefe del modo difícil (no se abre nada nuevo)
function ppVentanaMundoNuevo(dif) {
  const d = PP_P.T.d, M0 = PP_MUNDOS[d.mundo], sig = d.mundo + 1;
  let txt;
  if (dif) txt = tr('¡Has ganado el mundo {n} en difícil! Eres una máquina de hacer plop.', { n: d.mundo + 1 });
  else {
    txt = tr('Se abre el modo difícil de {nombre}: el mismo mundo, de noche y con muchos menos toques.', { nombre: tr(M0.nombre) });
    if (sig < PP_MUNDOS.length) txt = tr('Se abre el mundo {n}: {nombre}.', { n: sig + 1, nombre: tr(PP_MUNDOS[sig].nombre) }) + ' ' + txt;
    else txt += ' ' + tr('¡Pronto llegan más mundos!');   // el último jefe ya no acaba el camino (Daniel, 30-10-2026): sigues en el mapa con todo
  }
  const t = ppAbre(`<h2>${tr('¡Mundo superado!')}</h2>${ppEstrellasHtml(PP_P.T.estrellas)}${ppPremioHtml(PP_P.T.premio)}<p class="pp-sub">${txt}</p>`);
  t.appendChild(ppBoton(tr('¡VAMOS!'), 'pp-btn', () => { if (!dif) ppMapaVer(ppMundoActual(), false); ppAlCamino(); }));
}
// sin corazones: el reloj del siguiente, o llenarlos con monedas o perlas, o un anuncio (js/tienda.js)
function ppVentanaSinCorazones() {
  const t = ppAbre(`<h2>${tr('¡Uy! Sin corazones')}</h2><div class="pp-cofre">${ppIcono('i-vida', 84, '#ff4a6a')}</div><p class="pp-sub" id="pp-reloj"></p><p class="pp-sub">${tr('Tienes:')} ${ppMonedasHtml(SAVE.monedas, 26)}</p>`);
  const reloj = () => { const el = $pp('#pp-reloj'); if (!el) { clearInterval(tic); return; } el.textContent = ppVidas() > 0 ? tr('¡Ya tienes corazones!') : tr('El siguiente corazón llega en {t}', { t: ppReloj(ppFaltaVida()) }); };
  const tic = setInterval(reloj, 1000); reloj();
  ppBotonesSinCorazones(t, () => { play('ppPremio'); clearInterval(tic); ppAlCamino(); }, () => { clearInterval(tic); ppVentanaSinCorazones(); });
  t.appendChild(ppBoton(tr('Al camino'), 'pp-btn2 pp-azul', () => { clearInterval(tic); ppAlCamino(); }));
}
function ppVentanaFin() {
  const P = PP_P;
  const t = ppAbre(`<h2>${tr('¡VICTORIA!')}</h2><p class="pp-sub">${tr('¡Plop! Has superado todos los mundos que hay de momento. ¡Pronto llegan más!')}</p><p class="pp-sub"><b>${tr('Estrellas: {n}', { n: P.estrellas })}</b>${P.estrellas >= (SAVE.estrellas || 0) && P.estrellas ? ' · ' + tr('¡Nuevo récord!') : ' · ' + tr('Récord: {n}', { n: SAVE.estrellas || 0 })}</p>`, true);
  if (P.rescatados.length) { t.insertAdjacentHTML('beforeend', `<p class="pp-sub"><b>${tr('Rescatados')}</b></p>`); const fila = document.createElement('div'); fila.className = 'pp-fila-slimes pp-mini'; for (const id of P.rescatados) fila.appendChild(ppFichaSlime(id)); t.appendChild(fila); }
  t.appendChild(ppBoton(tr('JUGAR OTRA VEZ'), 'pp-btn', () => { ppCierra(); ppNuevaRuta(); ppIrA('mapa'); }));
  t.appendChild(ppBoton(tr('Portada'), 'pp-btn2 pp-azul', () => { ppCierra(); PP_P = null; ppIrA('titulo'); }));
}
function ppAyuda() {
  const t = ppAbre(`<h2>${tr('Cómo se juega')}</h2>
    <p class="pp-sub">${tr('Toca una burbuja: revientan ella y sus vecinas de arriba, abajo y los lados. Lo reventado se queda reventado.')}</p>
    <p class="pp-sub">${tr('Revienta TODAS antes de que se acaben los toques. Con pocos toques ganas 3 estrellas.')}</p>
    <p class="pp-sub">${tr('Las burbujas con nata son dobles: necesitan dos golpes.')}</p>
    <p class="pp-sub">${tr('Más adelante: las de cereza necesitan tres golpes, las de hielo solo revientan si las tocas a ellas y las conchas, al tocarlas, solo revientan ellas.')}</p>
    <p class="pp-sub">${tr('Dentro de algunas burbujas hay amigos atrapados: rescátalos y te ayudarán.')}</p>
    <p class="pp-sub">${tr('Si fallas pierdes un corazón; vuelve uno cada 30 minutos. Al ganar a un jefe se abre su mundo en difícil.')}</p>`, true);
  t.appendChild(ppBoton(tr('¡ENTENDIDO!'), 'pp-btn', () => { ppCierra(); SAVE.ayuda = true; ppGuarda(); }));
}
/* ---------- la pausa ----------
   En un nivel: seguir, salir del nivel (vuelves al camino sin perder nada: el nivel se repite entero) o ir al menú principal
   (el camino queda guardado y la portada ofrece SEGUIR). En el camino: seguir o menú principal. Y el sonido. */
function ppPausa() {
  if (!$pp('#pp-modal').hidden) return;
  const enNivel = PP_PANT.actual === 'sala';
  PP_PANT.pausa = true;
  const t = ppAbre(`<h2>${tr('Pausa')}</h2>`);
  const col = document.createElement('div'); col.className = 'pp-columna'; t.appendChild(col);
  col.appendChild(ppBoton(tr('SEGUIR'), 'pp-btn', ppQuitaPausa));
  if (PP_PANT.actual === 'memoria') col.appendChild(ppBoton(tr('Salir de Memoria'), 'pp-btn2 pp-verde', () => { ppQuitaPausa(); ppSalMemoria(); }));
  if (PP_PANT.actual === 'duelo') col.appendChild(ppBoton(tr('Salir del duelo'), 'pp-btn2 pp-verde', () => { ppQuitaPausa(); ppSalDuelo(); }));
  if (!enNivel) col.appendChild(ppBoton(tr('Perlas'), 'pp-btn2 pp-rosa', () => { PP_PANT.pausa = false; ppTienda(null); }));
  // salir a medias, si ya has tocado, cuesta un corazón (como en Candy Crush): se avisa en el texto
  if (enNivel && SAVE.dentro) col.insertAdjacentHTML('beforeend', `<p class="pp-sub">${tr('Si sales ahora pierdes un corazón.')}</p>`);
  if (enNivel) col.appendChild(ppBoton(tr('Salir del nivel'), 'pp-btn2 pp-verde', () => { ppQuitaPausa(); ppSalNivel(); PP_P.T = null; ppAlCamino(); }));
  col.appendChild(ppBoton(tr('Menú principal'), 'pp-btn2 pp-azul', () => { ppQuitaPausa(); if (PP_P && PP_P.T) ppSalNivel(); ppGuardaCamino(); PP_P = null; ppIrA('titulo'); }));
  const son = ppBoton(SAVE.muted ? tr('SONIDO: NO') : tr('SONIDO: SÍ'), 'pp-btn2 pp-rosa', () => { SAVE.muted = !SAVE.muted; ppGuarda(); applyVolume(); son.textContent = SAVE.muted ? tr('SONIDO: NO') : tr('SONIDO: SÍ'); });
  col.appendChild(son);
  const est = ppBoton(ppTextoEstilo(), 'pp-btn2 pp-azul', () => { ppCambiaEstilo(); est.textContent = ppTextoEstilo(); });
  col.appendChild(est);
}
function ppQuitaPausa() { PP_PANT.pausa = false; ppCierra(); }
/* ---------- el tutorial de Lola ----------
   Cada tutorial es una lista de frases. Las que llevan `toque` se cierran solas cuando tocas una burbuja (para que lo hagas
   mientras Lola te lo dice); las demás llevan un botón. Cada tutorial sale una sola vez (SAVE.tuto). */
const PP_TUTO = {
  w1n1: [{ t: '¡Hola! Soy Lola. ¡Vamos a reventar burbujas juntos!' },
         { t: 'Antes de empezar: ¿cómo te gustan los dibujos? Puedes cambiarlo cuando quieras en la pausa.', elige: 'estilo' },
         { t: 'Toca la burbuja que señala la manita: revientan ella y sus vecinas de arriba, abajo y los lados.', toque: true }],
  w1n2: [{ t: '¡Plop! Lo que revientas se queda reventado. Para pasar el nivel, revienta todas.' },
         { t: 'Cuantos menos toques uses, más estrellas. Sigue a la manita.', toque: true }],
  w1n3: [{ t: 'Ahora te toca a ti. Arriba ves los toques que te quedan.' },
         { t: 'Si se acaban antes de reventarlas todas, pierdes un corazón. Truco: toca donde revientes más de golpe.' }],
  amigo: [{ t: '¡Ya tienes un amigo! Mira abajo: cada uno te ayuda a su manera.' }, { t: 'Cuando su barrita se llena, ¡te echa una mano solo!' }],
  combo: [{ t: '¡COMBO! Si cada toque revienta 3 burbujas o más, el combo crece.' }],
  dificil: [{ t: 'Este nivel es difícil: los toques van muy justos. ¡Piensa antes de tocar!' }],
  jefe: [{ t: '¡Nivel jefe! El CEO ha preparado su pop-it más gordo y te deja muy pocos toques de sobra.' }],
  monedas: [{ t: '¡Monedas! Las ganas la primera vez que pasas un nivel y con cada estrella nueva. Con 15 estrellas, ¡un cofre!' },
            { t: 'Sirven para llenar los corazones y para hacer sitio a más amigos en el equipo.' }],
  modoDificil: [{ t: 'Modo difícil: el mismo mundo, de noche y con muchos menos toques. ¡Pero da el doble de monedas!' }],
  duelo: [{ t: '¡Duelo contra el CEO! Por turnos, revienta las burbujas que quieras, pero todas de la MISMA fila.' },
          { t: 'Cuando acabes tu turno, pulsa ¡LISTO!. Ojo: ¡pierde quien revienta la última burbuja!' }],
  memoria: [{ t: '¡Memoria! Las burbujas se van a hundir en orden, cada una con su nota. ¡Mira y escucha bien!' },
            { t: 'Luego tócalas en el mismo orden. Cada ronda la melodía tiene una burbuja más. ¡No gasta corazones!' }],
  w3n1: [{ t: '¡Bienvenida a la Heladería!' }, { t: 'Las burbujas con un copo están heladas: sus vecinas no las revientan. ¡Tienes que tocarlas a ellas!' }],
  w4n1: [{ t: '¡Bienvenida a la Playa!' }, { t: 'Si tocas una burbuja con concha, solo revienta ella, no sus vecinas. Pero las vecinas sí la revientan a ella.' }],
  w5n1: [{ t: '¡Bienvenida a la Feria!' }, { t: 'Las burbujas con nata y cereza son triples: necesitan tres golpes.' }],
  w6n1: [{ t: '¡Bienvenida al Reino de las nubes!' }, { t: 'Aquí está todo mezclado: nata, cerezas, hielo y conchas. ¡Piensa cada toque!' }],
  w2n1: [{ t: '¡Bienvenida a la Pastelería!' }, { t: 'Las burbujas con nata son dobles: el primer golpe les quita la nata y el segundo las revienta.' }],
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
  $pp('#pp-lola-vale').hidden = !!(f.toque || f.elige);
  $pp('#pp-lola-elige').hidden = f.elige !== 'estilo';   // Lola pregunta: lisitos o pixel art (Daniel, 30-10-2026)
  caja.hidden = false; caja.classList.remove('pp-entra'); void caja.offsetWidth; caja.classList.add('pp-entra');
  play('ppPista');
}
// la respuesta a la pregunta de Lola sobre el estilo de los dibujos: se cambia al momento y sigue el tutorial
function ppLolaEligeEstilo(pixel) {
  if (!!SAVE.pixel !== pixel) ppCambiaEstilo();
  ppLolaSiguiente();
  // su cara se vuelve a pintar cuando llegan los dibujos del estilo nuevo
  setTimeout(() => { const cara = $pp('#pp-lola-cara'); if (cara && PP_LOLA.actual) { cara.innerHTML = ''; cara.appendChild(ppMiniatura('sl-lola', 92)); } }, 700);
}
// la frase que espera a que toques una burbuja
function ppLolaToque() { if (PP_LOLA.actual && PP_LOLA.actual.toque) ppLolaSiguiente(); }
function ppLolaCierra() { PP_LOLA.cola = []; PP_LOLA.actual = null; const c = $pp('#pp-lola'); if (c) c.hidden = true; }
