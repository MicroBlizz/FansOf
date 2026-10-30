// Fans of Island · PANTALLAS: lo que va en HTML encima del lienzo, con los botones y las ventanas del core (btn-big, btn-ghost, modal-card,
// opt-list). La portada (jugar solo o a dos, opciones), el selector de niveles, la pausa, las opciones (sonido, idioma, cuenta, controles) y el final del nivel.
'use strict';
const isH = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
function isIrA(p) {
  IS_P.estado = p === 'juego' ? 'juego' : p; isCierraModal();
  $('#is-titulo').hidden = p !== 'titulo';
  $('#is-hud').hidden = p !== 'juego';
  $('#is-mandos').hidden = p !== 'juego' || !IS_V.tactil || IS_P.humanos === 2;
  if (p === 'titulo') isMusica('menu');
}
function isModal(html, clase = '') {
  const m = $('#is-modal'); m.hidden = false; $('#is-tarjeta').className = 'modal-card ' + clase; $('#is-tarjeta').innerHTML = html; isEntradaSuelta();
}
function isCierraModal() { $('#is-modal').hidden = true; $('#is-tarjeta').innerHTML = ''; }
function enPartida() { return IS_P.estado === 'juego'; }
function isEmpieza(humanos, nivel) { play('select'); isNuevaPartida(humanos, nivel); isIrA('juego'); }
function isAbreNiveles(humanos) {   // el selector: un botón por nivel; los que siguen a uno sin superar van cerrados
  play('select');
  const filas = IS_NIVELES.map(n => {
    const abierto = isNivelAbierto(n.id), r = SAVE.niveles[n.id];
    const marca = r ? isH(tr('Tu mejor marca: %1 s · %2 zanahorias').replace('%1', fmtV(r.t)).replace('%2', r.z || 0)) : (abierto ? tr('Sin superar todavía') : tr('Supera el nivel anterior'));
    return `<div class="opt-row"><span><b>${isH(tr(n.nombre))}</b><br>${marca}</span><button class="btn-ghost is-nivel" data-nivel="${n.id}" ${abierto ? '' : 'disabled'}>${abierto ? tr('JUGAR') : tr('CERRADO')}</button></div>`;
  }).join('');
  isModal(`<h3>${humanos === 2 ? tr('JUGAR A DOS') : tr('JUGAR SOLO')}</h3><div class="opt-list is-opts">${filas}</div><button class="btn-ghost" id="is-n-cerrar">${tr('CERRAR')}</button>`, 'is-opciones');
  document.querySelectorAll('.is-nivel').forEach(b => { b.onclick = () => isEmpieza(humanos, b.dataset.nivel); });
  $('#is-n-cerrar').onclick = () => { play('select'); isCierraModal(); };
}
function isAbrePausa() {
  if (IS_P.estado !== 'juego' && IS_P.estado !== 'pausa') return;
  if (IS_P.estado === 'pausa') { IS_P.estado = 'juego'; isCierraModal(); return; }
  IS_P.estado = 'pausa'; play('select');
  isModal(`<h3>${tr('PAUSA')}</h3>
    <button class="btn-big" id="is-seguir">${tr('SEGUIR')}</button>
    <button class="btn-ghost" id="is-otra">${tr('REINICIAR')}</button>
    <button class="btn-ghost" id="is-p-opc">${tr('OPCIONES')}</button>
    <button class="btn-link" id="is-salir">${tr('Salir al título')}</button>`);
  $('#is-seguir').onclick = () => { play('select'); IS_P.estado = 'juego'; isCierraModal(); };
  $('#is-otra').onclick = () => { play('select'); isNuevaPartida(IS_P.humanos, IS_P.mundo.def.id); isIrA('juego'); };
  $('#is-p-opc').onclick = () => isAbreOpciones(true);
  $('#is-salir').onclick = () => { play('select'); isIrA('titulo'); };
}
function isAbreOpciones(desdePausa) {
  play('select');
  isModal(`<h3>${tr('OPCIONES')}</h3>
    <div class="opt-list is-opts">
      <div class="opt-row"><span><b>${tr('Sonido')}</b></span><button class="btn-ghost" id="is-o-son"></button></div>
      <div class="opt-row"><span><b>${tr('Idioma / Language')}</b><br>${tr('Automático: el del navegador. Al cambiarlo se recarga la página.')}</span><span class="idioma-fl" id="idioma-banderas"></span></div>
      <div class="opt-row col"><span><b>${tr('Controles')}</b><br>${tr('Jugador 1: flechas y espacio para saltar (mantenlo en el aire para flotar), L o Mayús para coger y lanzar al compañero. Jugador 2: WASD y F. En el móvil, los botones de la pantalla.')}</span></div>
      <div class="opt-row"><span><b>${tr('Empezar de cero')}</b><br>${tr('Borra tus niveles superados.')}</span><button class="btn-ghost" id="is-o-borra">${tr('BORRAR')}</button></div>
    </div>
    <p class="is-ver">${isH(tr('Fans of Island · versión %1').replace('%1', VERSION))}</p>
    <button class="btn-ghost" id="is-o-cerrar">${tr('CERRAR')}</button>`, 'is-opciones');
  if (window.filaCuenta) $('.is-opts').insertBefore(window.filaCuenta, $('#is-o-borra').parentNode);
  try { pintarBanderas($('#idioma-banderas'))(); } catch (e) { /* sin banderas */ }
  const pinta = () => { $('#is-o-son').textContent = SAVE.muted ? tr('APAGADO') : tr('ENCENDIDO'); };
  pinta();
  $('#is-o-son').onclick = () => { SAVE.muted = !SAVE.muted; applyVolume(); isGuarda(); play('select'); pinta(); };
  $('#is-o-borra').onclick = () => confirmBox(tr('¿EMPEZAR DE CERO?'), tr('Se borran tus niveles superados. No se puede deshacer.'), tr('BORRAR'), () => { isBorraTodo(); isIrA('titulo'); });
  $('#is-o-cerrar').onclick = () => { play('select'); if (desdePausa) { IS_P.estado = 'juego'; isAbrePausa(); } else isCierraModal(); };
}
function isAbreFin(seg) {
  const r = SAVE.niveles[IS_P.mundo.def.id], marca = r ? r.t : seg, sig = isNivelSiguiente(IS_P.mundo.def.id);
  isModal(`<h3>${tr('¡NIVEL SUPERADO!')}</h3>
    <p class="is-txt">${isH(tr('Tiempo: %1 s').replace('%1', fmtV(Math.round(seg * 10) / 10)))}<br>${isH(tr('Zanahorias: %1 de %2').replace('%1', IS_P.cosecha).replace('%2', IS_P.cosechaTotal))}${IS_P.cosecha === IS_P.cosechaTotal ? ' · ' + tr('¡TODAS!') : ''}<br><small>${isH(tr('Tu mejor marca: %1 s').replace('%1', fmtV(marca)))}</small></p>
    ${sig ? `<button class="btn-big" id="is-f-sig">${tr('SIGUIENTE NIVEL')}</button>` : `<p class="is-txt"><small>${tr('Has superado todos los niveles del prototipo. ¡Gracias por probarlo!')}</small></p>`}
    <button class="${sig ? 'btn-ghost' : 'btn-big'}" id="is-f-otra">${tr('OTRA VEZ')}</button>
    <button class="btn-ghost" id="is-f-salir">${tr('AL TÍTULO')}</button>`);
  if (sig) $('#is-f-sig').onclick = () => isEmpieza(IS_P.humanos, sig.id);
  $('#is-f-otra').onclick = () => { play('select'); isNuevaPartida(IS_P.humanos, IS_P.mundo.def.id); isIrA('juego'); };
  $('#is-f-salir').onclick = () => { play('select'); isIrA('titulo'); };
}
function isPantallasArranca() {
  $('#is-solo').onclick = () => isAbreNiveles(1);
  $('#is-dos').onclick = () => isAbreNiveles(2);
  $('#is-t-opc').onclick = () => isAbreOpciones(false);
  $('#is-pausa').onclick = isAbrePausa;
  IS_ENTRADA.pausa = isAbrePausa;
}
