// Fans of Pop · PANTALLAS: qué se ve ahora (portada, camino o nivel), las ventanas en HTML (amigo rescatado, nivel superado,
// descanso, sin corazones, final, cómo se juega) y el TUTORIAL DE LOLA: su bocadillo abajo, que explica los primeros niveles
// paso a paso (Daniel, 30-10-2026: «no tengo ni idea de jugar»). El lienzo pinta detrás; todo esto va en la capa #pp-ui.
'use strict';
const PP_PANT = { actual: 'titulo', pausa: false };
const $pp = s => document.querySelector(s);
function ppIrA(p) {
  if (p !== 'raid' && typeof PP_RAID_PANTALLA !== 'undefined') PP_RAID_PANTALLA.fuera();   // irse a otra pantalla con la raid abierta la cierra (js/raid/adaptadores/pantalla.js)
  PP_PANT.actual = p; PP_PANT.pausa = false;   // cambiar de pantalla acaba con la pausa (reporte 28: si no, el nivel se quedaba congelado)
  if (p !== 'sala' && p !== 'duelo') ppCortCancela();   // salir del nivel durante la cortinilla de un jefe la apaga
  if (p === 'titulo') ppMusica('menu'); else ppMusicaRuta();
  $pp('#pp-titulo').hidden = p !== 'titulo';
  if (p !== 'sala' && p !== 'duelo' && p !== 'memoria') ppLolaCierra();
  if (p !== 'duelo' && p !== 'sala') $pp('#pp-listo').hidden = true;
  if (p !== 'mapa') $pp('#pp-presenta').hidden = true;   // la presentación de un mundo es solo del camino (js/mundo-presenta-juego.js)
  $pp('#pp-pausa').hidden = p === 'titulo' || p === 'mapa' || p === 'raid';   // en el camino sobra: abajo ya están INICIO y TIENDA (tarea #272)
  $pp('#pp-pausa').classList.toggle('pp-pausa-baja', ppBarraPausaBaja(p));   // en un nivel, bajo la barra (tarea #373, js/barra-recursos.js)
  ppBarraAyudas(); ppMemPistaBoton(); ppPintaLateral(); ppPintaCamino();   // la barra de ayudas en los niveles; en el camino, los botones de los lados y la barra de abajo (js/camino-barra.js)
  if (p === 'mapa') setTimeout(ppAlLlegarAlCamino, 400);   // regalo diario y pack de bienvenida
  if (p === 'titulo') {
    const hay = !!(SAVE.run && SAVE.run.nivel > 0);
    $pp('#pp-record').textContent = hay ? tr('Vas por el nivel {n}', { n: SAVE.run.nivel + 1 }) : SAVE.estrellas ? tr('Récord: {n} estrellas', { n: SAVE.estrellas }) : tr('Haz pop, rescata amigos');
    $pp('#pp-seguir').hidden = !hay;
    $pp('#pp-jugar').hidden = hay;   // con partida empezada solo sale SEGUIR; EMPEZAR DE NUEVO está en Opciones (Daniel, 02-11-2026)
    $pp('#pp-jugar').textContent = tr('JUGAR');
    ppBarraRotulos();   // la barra de iconos y la fila de Memoria y Ranking (js/portada-barra.js, tarea #143)
    ppPerfilBoton();   // PERFIL, solo con su flag abierto (js/pantalla-perfil.js)
    ppPrimerosPortada();   // #140
    ppCompanerosBoton();   // COMPAÑEROS, solo con el flag companeros (js/pantalla-album.js)
    ppAmigosBoton();   // AMIGOS, solo con el flag amigos (js/pantalla-amigos.js)
  }
}
function ppAbre(html, ancha = false) { const m = $pp('#pp-modal'), t = $pp('#pp-tarjeta'); t.className = 'pp-tarjeta' + (ancha ? ' pp-ancha' : ''); t.innerHTML = html; m.hidden = false; return t; }
// la pausa dura lo que su ventana: se cierre por donde se cierre, el juego sigue (reporte 28, Daniel 19-11-2026)
// al volver tras cerrar el juego a medias: el corazón se pierde igual (si no, recargar sería un reintento gratis), pero se dice (tarea #185)
function ppVentanaSalioAMedias() {
  const t = ppAbre(`<h2>${tr('¡Saliste a medias!')}</h2><p class="pp-sub">${tr('Saliste a mitad de nivel: pierdes un corazón.')}</p>`);
  t.appendChild(ppBoton(tr('¡VALE!'), 'pp-btn', ppCierra));
}
function ppCierra() { $pp('#pp-modal').hidden = true; PP_PANT.pausa = false; }
function ppBoton(texto, clase, f) { const b = document.createElement('button'); b.type = 'button'; b.className = clase; b.textContent = texto; b.onclick = () => { play('select'); f(); }; return b; }
const ppAlCamino = () => { ppCierra(); ppIrA('mapa'); };
// cerrar o volver, igual en todas las pantallas (tarea 386; antes la flecha de la 346, que flotaba y pisaba títulos, pestañas y
// listas): una franja fija arriba de la ventana `t`, con su fondo, el título en el centro (el <h2> de la ventana, o `op.titulo`) y una
// burbuja con una X a la derecha, que se hunde y hace pop al pulsarla. Lo demás empieza debajo y, al bajar, se esconde bajo la franja
// (css/pop.css, .pp-cab). En una ventana que viene de otra, `f` vuelve un paso atrás. Las preguntas de sí o no (NO, VOLVER) siguen
// con sus botones: son una respuesta.
// `op`: { titulo, izquierda (algo para la izquierda de la franja en vez del dibujo del tema: en Amigos, tus corazones),
//         tema: el de lo que enseña la ventana (PP_CABECERA.temas, js/cabecera-temas.js; su dibujo, en css/cabeceras.css) }
function ppBotonVolver(t, f, op = {}) {
  const clases = PP_CABECERA.clases(op.tema);
  const cab = document.createElement('div'); cab.className = clases.cab;
  let h = t.querySelector(':scope > h2');
  if (!h) h = document.createElement('h2');
  if (!h.textContent) h.textContent = op.titulo || '';
  const b = document.createElement('button'); b.type = 'button';
  b.className = clases.cerrar;
  b.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M13 13 35 35M35 13 13 35"/></svg>';
  b.setAttribute('aria-label', tr('VOLVER'));
  b.onclick = () => { play('ppPop', 0); f(); };   // suena como una burbuja del tablero
  let izq = op.izquierda;
  if (izq) izq.classList.add('pp-cab-izq');
  else { izq = document.createElement('span'); izq.className = 'pp-cab-cara'; }
  cab.append(izq, h, b);
  t.classList.add('pp-con-cab');
  t.prepend(cab);
  return b;
}
// un botón turquesa que despliega y pliega una caja con lo menos usado (tarea #246). Se mete en la caja y luego se ponen los dos
function ppPlegado(texto) {
  const caja = document.createElement('div'); caja.className = 'pp-plegado'; caja.hidden = true;
  const boton = ppBoton(texto, 'pp-btn2 pp-sec pp-mas', () => { caja.hidden = !caja.hidden; boton.classList.toggle('pp-abierto', !caja.hidden); });
  return { boton, caja };
}
// las estrellas del nivel en HTML (dibujo de Yoshi si está; si no, una estrella recortada con CSS)
function ppEstrellasHtml(n, total = 3) {
  let h = '<div class="pp-estrellas">';
  for (let k = 0; k < total; k++) h += `<span class="pp-est${k < n ? ' pp-on' : ''}" style="animation-delay:${0.15 + k * 0.18}s">${PP_IMG['i-estrella'] ? `<img src="${PP_LISO ? 'img-liso' : 'img'}/i-estrella.png" alt=""${PP_LISO ? ' style="image-rendering:auto"' : ''}>` : ''}</span>`;
  return h + '</div>';
}
// un icono de Yoshi en HTML (moneda, cofre…); si aún no está, una bolita de color
function ppIcono(k, px, col = '#ffd64a') {
  return PP_IMG[k] ? `<img class="pp-ico" data-i="${k}" src="${PP_LISO ? 'img-liso' : 'img'}/${k}.png" alt="" style="width:${px}px;height:${px}px${PP_LISO ? ';image-rendering:auto' : ''}">`
    : `<span class="pp-ico" data-i="${k}" style="width:${px}px;height:${px}px;background:${col}"></span>`;
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
  const d = ppSlimeDe(id), el = document.createElement('div'); el.className = 'pp-slime' + (nuevo ? ' pp-nuevo' : '');
  el.appendChild(ppMiniatura('sl-' + id, 84));
  el.insertAdjacentHTML('beforeend', `<b>${tr(d.nombre)}</b><i>${tr(d.pasiva)}</i><span>${tr(d.texto)}</span>`);
  return el;
}
/* ---------- rescate: elige qué amigo se une ---------- */
function ppVentanaRescate(presos) {
  const t = ppAbreVictoria(`<p class="pp-sub">${presos.length > 1 ? tr('Has rescatado a estos amigos. Elige quién viene contigo:') : tr('¡Has rescatado a un amigo! ¿Viene contigo?')}</p>`, true, undefined, { vuelta: () => ppVentanaRescate(presos) });   // js/pantalla-victoria.js
  const fila = document.createElement('div'); fila.className = 'pp-fila-slimes';
  for (const id of presos) { const f = ppFichaSlime(id, true); f.onclick = () => { play('select'); ppEligeRescate(id); }; fila.appendChild(f); }
  t.appendChild(fila);
  if (presos.length === 1) t.appendChild(ppBoton(tr('¡QUE VENGA!'), 'pp-btn', () => ppEligeRescate(presos[0])));
  else t.insertAdjacentHTML('beforeend', `<p class="pp-sub">${tr('Toca una ficha para elegir.')}</p>`);
  t.appendChild(ppBoton(tr('Seguir sin nadie'), 'pp-btn2 pp-volver', ppAlCamino));
}
function ppEligeRescate(id) {
  if (PP_P.equipo.length < ppHuecos()) { ppRecluta(id); ppVentanaBienvenida(id); return; }
  // el equipo está lleno: hay que dejar a uno… o comprar un hueco más con monedas (Daniel, 30-10-2026)
  const precio = ppPrecioHueco();
  const t = ppAbre(`<h2>${tr('Equipo lleno')}</h2><p class="pp-sub">${tr('¿Quién se queda descansando para que venga {n}?', { n: tr(ppSlimeDe(id).nombre) })}</p>`, true);
  ppTutorial('equipoLleno');
  const fila = document.createElement('div'); fila.className = 'pp-fila-slimes';
  for (const k of PP_P.equipo) { const f = ppFichaSlime(k); f.onclick = () => { play('select'); ppRecluta(id, k); ppVentanaBienvenida(id); }; fila.appendChild(f); }
  t.appendChild(fila);
  if (precio !== null) {
    t.insertAdjacentHTML('beforeend', `<p class="pp-sub">${tr('O hazle sitio: un hueco más en el equipo, para siempre.')} ${tr('Tienes:')} ${ppMonedasHtml(SAVE.monedas, 26)}</p>`);
    t.appendChild(ppBotonPrecio(tr('HUECO MÁS'), precio, 'pp-btn', () => { if (ppCompraHueco()) { play('ppPremio'); ppRecluta(id); ppVentanaBienvenida(id); } }));
    t.appendChild(ppBotonPerlas(tr('HUECO MÁS'), PP_CFG.perlas.hueco[SAVE.huecos || 0], 'pp-btn2 pp-pago', () => { SAVE.huecos = (SAVE.huecos || 0) + 1; ppGuarda(); play('ppPremio'); ppRecluta(id); ppVentanaBienvenida(id); }, () => ppEligeRescate(id), 'hueco'));
  }
  t.appendChild(ppBoton(tr('Mejor no'), 'pp-btn2 pp-volver', ppAlCamino));
}
function ppVentanaBienvenida(id) {
  const d = ppSlimeDe(id);
  const t = ppAbre(`<h2>${tr('¡{n} viene contigo!', { n: tr(d.nombre) })}</h2>`);
  t.appendChild(ppFichaSlime(id, true));
  t.appendChild(ppBoton(tr('¡VAMOS!'), 'pp-btn', ppAlCamino));
}
function ppVentanaSalaHecha() {
  const t = ppAbreVictoria('', false, undefined, { vuelta: ppVentanaSalaHecha, otraVez: true });   // «a por 3 estrellas», dentro del panel   // estrellas, nota, datos del nivel y monedas (js/pantalla-victoria.js)
  t.appendChild(ppBoton(tr('¡SIGUIENTE!'), 'pp-btn', ppPrimerosSiguiente));   // #140
}
// sin toques: se ha perdido un corazón (partida.js) y se repite el nivel o se vuelve al camino
function ppVentanaSinToques() {
  const t = ppAbreDerrota(tr('Pierdes un corazón; te quedan {n}.', { n: SAVE.vidas }));   // ¡Casi! y cuánto faltaba (js/pantalla-victoria.js)
  t.appendChild(ppBoton(tr('¡OTRA VEZ!'), 'pp-btn', ppOtraVez));
  t.appendChild(ppBoton(tr('Al camino'), 'pp-btn2 pp-volver', ppAlCamino));
}
// el jefe de un mundo superado: se abre el siguiente y su modo difícil. `dif`: era el jefe del modo difícil (no se abre nada nuevo).
// `saltado`: era un jefe pendiente (tarea #95): el siguiente ya estaba abierto, no se anuncia otra vez y ¡VAMOS! lleva a su mundo
function ppVentanaMundoNuevo(dif, saltado = false) {
  const d = PP_P.T.d, M0 = PP_MUNDOS[d.mundo], sig = d.mundo + 1;
  let txt;
  if (dif === 2) txt = tr('¡Has ganado el mundo {n} en PESADILLA! Ni el CEO se lo cree.', { n: d.mundo + 1 });
  else if (dif) txt = tr('¡Mundo {n} ganado en difícil! Se abre su PESADILLA: fondo rojo.', { n: d.mundo + 1 });
  else {
    txt = tr('Se abre el difícil de {nombre}: de noche y con menos toques.', { nombre: tr(M0.nombre) });
    if (sig < PP_MUNDOS.length && !saltado) txt = tr('Se abre el mundo {n}: {nombre}.', { n: sig + 1, nombre: tr(PP_MUNDOS[sig].nombre) }) + ' ' + txt;
    else if (!saltado) txt += ' ' + tr('¡Pronto llegan más mundos!');   // el último jefe ya no acaba el camino (Daniel, 30-10-2026): sigues en el mapa con todo
  }
  const t = ppAbreVictoria(`<p class="pp-sub">${txt}</p>`, false, tr('¡Mundo superado!'), { vuelta: () => ppVentanaMundoNuevo(dif, saltado) });
  t.appendChild(ppBoton(tr('¡VAMOS!'), 'pp-btn', () => { if (!dif) ppMapaVer(saltado ? d.mundo : ppMundoActual(), 0); else if (dif === 1) ppMapaVer(d.mundo, 2); ppAlCamino(); }));   // tras el difícil, directo a su pesadilla
}
// sin corazones: el reloj del siguiente, o llenarlos con monedas o perlas, o un anuncio (js/tienda.js)
// `vuelta`: adónde se va al llenarlos o al salir (el camino; en el duelo por un compañero escondido, su ventana de reintentar)
function ppVentanaSinCorazones(vuelta = null) {
  const sal = () => { clearInterval(tic); (vuelta || ppAlCamino)(); };
  const t = ppAbre(`<h2>${tr('¡Uy! Sin corazones')}</h2><div class="pp-cofre">${ppIcono('i-vida', 84, '#ff4a6a')}</div><p class="pp-sub" id="pp-reloj"></p><p class="pp-sub">${tr('Tienes:')} ${ppMonedasHtml(SAVE.monedas, 26)}</p>`);
  ppTutorial('sinCorazones');
  const reloj = () => { const el = $pp('#pp-reloj'); if (!el) { clearInterval(tic); return; } el.textContent = ppVidas() > 0 ? tr('¡Ya tienes corazones!') : tr('El siguiente corazón llega en {t}', { t: ppReloj(ppFaltaVida()) }); };
  const tic = setInterval(reloj, 1000); reloj();
  // tarea #246: un rosa (lo gratis), el dorado de perlas y lo demás plegado en «Más opciones»
  const mas = ppPlegado(tr('Más opciones'));
  ppBotonesSinCorazones(t, mas.caja, () => { play('ppPremio'); sal(); }, () => { clearInterval(tic); ppVentanaSinCorazones(vuelta); });
  ppBotonInfinitas(mas.caja, sal);   // corazones infinitos por tiempo (js/ofertas.js)
  ppBotonPedirCorazones(mas.caja);   // js/pantalla-corazones.js
  t.append(mas.boton, mas.caja);
  t.appendChild(ppBoton(vuelta ? tr('Volver') : tr('Al camino'), 'pp-btn2 pp-volver', sal));
}
function ppVentanaFin() {
  const P = PP_P;
  const t = ppAbre(`<h2>${tr('¡VICTORIA!')}</h2><p class="pp-sub">${tr('¡Plop! Has ganado todos los mundos. ¡Pronto habrá más!')}</p><p class="pp-sub"><b>${tr('Estrellas: {n}', { n: P.estrellas })}</b>${P.estrellas >= (SAVE.estrellas || 0) && P.estrellas ? ' · ' + tr('¡Nuevo récord!') : ' · ' + tr('Récord: {n}', { n: SAVE.estrellas || 0 })}</p>`, true);
  if (P.rescatados.length) { t.insertAdjacentHTML('beforeend', `<p class="pp-sub"><b>${tr('Rescatados')}</b></p>`); const fila = document.createElement('div'); fila.className = 'pp-fila-slimes pp-mini'; for (const id of P.rescatados) fila.appendChild(ppFichaSlime(id)); t.appendChild(fila); }
  t.appendChild(ppBoton(tr('JUGAR OTRA VEZ'), 'pp-btn', () => { ppCierra(); ppNuevaRuta(); ppIrA('mapa'); }));
  t.appendChild(ppBoton(tr('Portada'), 'pp-btn2 pp-volver', () => { ppCierra(); PP_P = null; ppIrA('titulo'); }));
}
function ppAyuda(alAcabar = ppCierra) {   // alAcabar: adónde se va con ¡ENTENDIDO! (cerrar; desde Opciones vuelve a Opciones)
  const t = ppAbre(`<h2>${tr('Cómo se juega')}</h2>
    <p class="pp-sub">${tr('Toca una burbuja: ella y sus vecinas hacen pop y se hunden.')}</p>
    <p class="pp-sub">${tr('Haz pop en TODAS antes de quedarte sin toques.')}</p>
    <p class="pp-sub">${tr('Las burbujas con nata son dobles: necesitan dos golpes.')}</p>
    <p class="pp-sub">${tr('Más adelante: la cereza pide tres golpes. El hielo, solo si lo tocas. La concha hace pop sin sus vecinas.')}</p>
    <p class="pp-sub">${tr('Y luego: el cohete, al hacer pop, levanta las hundidas de su fila (quítalo pronto). La burbujeante, un cuadrado de 3x3. El pétalo, su columna.')}</p>
    <p class="pp-sub">${tr('Dentro de algunas burbujas hay amigos atrapados: rescátalos y te ayudarán.')}</p>
    <p class="pp-sub">${tr('Fallar cuesta un corazón; vuelve uno cada 30 minutos. Gana al jefe y se abre el difícil.')}</p>${PP_RAID_CAMINO.ayuda()}`, true);
  t.appendChild(ppBoton(tr('¡ENTENDIDO!'), 'pp-btn', () => { alAcabar(); SAVE.ayuda = true; ppGuarda(); }));
}
// las dos barras de volumen de core (OPCIONES.sonido): efectos y música por separado, en Opciones y en la pausa
const ppParVolumen = campo => [() => SAVE[campo], v => { SAVE[campo] = v; ppGuarda(); applyVolume(); }];   // leer y guardar un volumen de SAVE (vol o mus)
const ppBarrasSonido = () => OPCIONES.sonido({ efectos: ppParVolumen('vol'), musica: ppParVolumen('mus') });   // también en Opciones por bloques (js/opciones-pantalla.js)
function ppFilasSonido() {
  const l = document.createElement('div'); l.className = 'opt-list';
  l.append(ppBarrasSonido());
  return l;
}
// OPCIONES (Daniel, 31-10-2026; por bloques desde la tarea 430, ADR 240): ppOpciones está en js/opciones-pantalla.js
// empezar de nuevo borra el camino: se pregunta antes (las monedas, perlas, ayudas y récords no se pierden)
function ppConfirmaDeNuevo() {
  const t = ppAbre(`<h2>${tr('¿Empezar de nuevo?')}</h2><p class="pp-sub">${tr('Vuelves al nivel 1, sin camino ni equipo. Guardas monedas, perlas y ayudas.')}</p>`);
  const col = document.createElement('div'); col.className = 'pp-columna'; t.appendChild(col);
  col.appendChild(ppBoton(tr('SÍ, DE NUEVO'), 'pp-btn2 pp-sec', () => { ppCierra(); ppEmpieza(false); }));
  col.appendChild(ppBoton(tr('NO, VOLVER'), 'pp-btn', ppOpciones));
}
/* ---------- la pausa ----------
   En un nivel: seguir, salir del nivel (vuelves al camino; si ya has tocado, cuesta un corazón y el nivel se repite entero) o ir
   al menú principal (el camino queda guardado y la portada ofrece SEGUIR). En el camino: seguir o menú principal. Y el sonido. */
// el aviso de salir a medias (ppSalNivel, js/partida.js): con corazones infinitos no se pierde ninguno, y se dice (Pepins, tarea 250)
function ppPausaAviso(T) {
  const companero = ppEscSoloGratis(T);
  if (ppInfinitas()) return companero ? tr('Tienes corazones infinitos: si sales, solo pierdes al compañero.') : tr('Tienes corazones infinitos: si sales, no pierdes ninguno.');
  return companero ? tr('Si sales, pierdes un corazón y al compañero.') : tr('Si sales ahora pierdes un corazón.');
}
// ¿salir del nivel T cuesta algo? Ya has tocado (SAVE.dentro: los niveles gratis no lo marcan) y pierdes un corazón o al compañero
const ppSalirCuesta = T => !!T && !!SAVE.dentro && (!ppInfinitas() || !!ppEscSoloGratis(T));
// doble confirmación al salir (Pepins, tarea 250): si cuesta algo, se pregunta con el aviso; si es gratis, se sale directo
function ppConfirmaSalir(T, salir) {
  if (!ppSalirCuesta(T)) { salir(); return; }
  const t = ppAbre(`<h2>${tr('¿Salir del nivel?')}</h2><p class="pp-sub">${ppPausaAviso(T)}</p>`);
  const col = document.createElement('div'); col.className = 'pp-columna'; t.appendChild(col);
  col.appendChild(ppBoton(tr('NO, SEGUIR JUGANDO'), 'pp-btn', ppQuitaPausa));
  col.appendChild(ppBoton(tr('SÍ, SALIR'), 'pp-btn2 pp-volver', salir));
}
function ppPausa() {
  if (!$pp('#pp-modal').hidden) return;
  const enNivel = PP_PANT.actual === 'sala';
  PP_PANT.pausa = true;
  const t = ppAbre(`<h2>${tr('Pausa')}</h2>`);
  const col = document.createElement('div'); col.className = 'pp-columna'; t.appendChild(col);
  col.appendChild(ppBoton(tr('SEGUIR'), 'pp-btn', ppQuitaPausa));
  if (PP_PANT.actual === 'memoria') col.appendChild(ppBoton(tr('Salir de Memoria'), 'pp-btn2 pp-volver', () => { ppQuitaPausa(); ppSalMemoria(); }));
  if (PP_PANT.actual === 'duelo') col.appendChild(ppBoton(tr('Salir del duelo'), 'pp-btn2 pp-volver', () => { ppQuitaPausa(); ppSalDuelo(); }));
  if (!enNivel) col.appendChild(ppBoton(tr('Tienda'), 'pp-btn2 pp-pago', () => { PP_PANT.pausa = false; ppTienda(null, 'ofertas'); }));
  // salir a medias, si ya has tocado, cuesta un corazón (como en Candy Crush): se avisa en el texto
  if (enNivel && SAVE.dentro) col.insertAdjacentHTML('beforeend', `<p class="pp-sub">${ppPausaAviso(PP_P.T)}</p>`);
  const T = enNivel && PP_P ? PP_P.T : null;   // los dos botones de salir piden confirmación si cuesta (ppConfirmaSalir)
  if (enNivel) col.appendChild(ppBoton(tr('Salir del nivel'), 'pp-btn2 pp-volver', () => ppConfirmaSalir(T, () => { ppQuitaPausa(); ppSalNivel(); PP_P.T = null; ppAlCamino(); })));
  col.appendChild(ppBoton(tr('Menú principal'), 'pp-btn2 pp-volver', () => ppConfirmaSalir(T, () => { ppQuitaPausa(); if (PP_P && PP_P.T) ppSalNivel(); ppGuardaCamino(); PP_P = null; ppIrA('titulo'); })));
  col.appendChild(ppFilasSonido());
}
function ppQuitaPausa() { ppCierra(); }   // cerrar la ventana ya acaba con la pausa (ppCierra)
/* ---------- el tutorial de Lola: en js/lola.js ---------- */
