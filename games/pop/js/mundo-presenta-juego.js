// Fans of Pop · LA PRESENTACIÓN DE UN MUNDO NUEVO en pantalla (tarea #272, boceto A de Pepins, 20-11-2026): la primera vez que llegas
// al camino de un mundo, un cartel a pantalla completa con su fondo, «MUNDO 3», su nombre grande, la fila de bolitas de los 10 mundos
// («Vas por el mundo 3 de 10»), Lola y dos tarjetas: LO NUEVO (la frase de Lola de su nivel 1) y AL FINAL (su jefe). Un toque en
// cualquier sitio la cierra y el camino sigue con lo suyo (regalo diario, packs…: ppAlLlegarAlCamino, js/pase.js).
// · ppMiraPresentacion(): al llegar al camino, la saca si toca (y entonces devuelve true).
// · ppPresentaMundo(m, alCerrar): la saca siempre; también al tocar el título del mundo en el camino (js/mapa.js).
// Qué toca y la fila de bolitas: js/mundo-presenta.js (dominio puro). El dibujo de LO NUEVO: `icono` de PP_MUNDOS (datos en js/regiones/).
// Lo guardado: SAVE.mundos (los ya presentados).
'use strict';
const ppPresentaVistos = () => PP_PRESENTA.vistos(SAVE.mundos, ppMundoActual());
// la frase de Lola del nivel 1 del mundo (la misma que dirá al empezarlo)
function ppPresentaNuevo(m) {
  const tuto = PP_TUTO['w' + (m + 1) + 'n1'];
  return tuto ? tr(tuto[0].t) : '';
}
// el jefe del último nivel del mundo: su dibujo y su nombre
function ppPresentaJefe(m) {
  const M = PP_MUNDOS[m], d = ppNivel(ppInicioMundo(m) + M.niveles - 1, false), id = d.nim ? d.nim.rival : 'ceo', s = ppSlimeDe(id);
  return `<div class="pp-pre-tarjeta pp-pre-jefe">${ppIcono('sl-' + id, 52, '#8a8aa8')}<div><b>${tr('AL FINAL')}</b><span>${tr('{quien} te espera en el nivel {n}.', { n: M.niveles, quien: tr(s ? s.nombre : 'El CEO') })}</span></div></div>`;
}
function ppPresentaTira(m) {
  const pend = (PP_P && PP_P.pendientes) || [];
  return PP_PRESENTA.tira(m, PP_MUNDOS.length, pend).map(e => `<span class="pp-pre-${e}"></span>`).join('');
}
function ppPresentaHtml(m) {
  const M = PP_MUNDOS[m], nuevo = ppPresentaNuevo(m), fondo = PP_IMG[M.fondo];
  const nombre = tr(M.art === 'la' ? 'La {mundo}' : 'El {mundo}', { mundo: tr(M.nombre) });
  return `${fondo ? `<div class="pp-pre-fondo" style="background-image:url('${fondo.src}')"></div>` : ''}
    <div class="pp-pre-cab"><p class="pp-pre-n">${tr('MUNDO {n}', { n: m + 1 })}</p><h2>${nombre}</h2>
    <div class="pp-pre-tira">${ppPresentaTira(m)}</div><p class="pp-pre-va">${tr('Vas por el mundo {n} de {total}', { n: m + 1, total: PP_MUNDOS.length })}</p></div>
    <div class="pp-pre-lola">${ppIcono('sl-lola', 120, '#ff9ad0')}</div>
    <div class="pp-pre-tarjetas">${nuevo ? `<div class="pp-pre-tarjeta">${ppIcono(M.icono || 'i-estrella', 60)}<div><b>${tr('LO NUEVO')}</b><span>${nuevo}</span></div></div>` : ''}${ppPresentaJefe(m)}</div>
    <p class="pp-pre-toca">${tr('Toca para empezar')}</p>`;
}
// saca el cartel del mundo m; al tocarlo se cierra y llama a `alCerrar`
function ppPresentaMundo(m, alCerrar = () => {}) {
  const el = $pp('#pp-presenta'); if (!el) { alCerrar(); return; }
  el.innerHTML = ppPresentaHtml(m); el.setAttribute('aria-label', tr('Mundo nuevo'));
  el.hidden = false; el.classList.remove('pp-entra'); void el.offsetWidth; el.classList.add('pp-entra');
  el.onclick = () => { play('select'); el.hidden = true; el.onclick = null; alCerrar(); };
}
const ppPresentaAbierta = () => { const el = $pp('#pp-presenta'); return !!el && !el.hidden; };
// al llegar al camino: el mundo que se ve, si es nuevo para ti. Se apunta como visto al sacarlo (no al cerrarlo: así no vuelve a salir
// aunque cierres el juego con el cartel delante)
function ppMiraPresentacion() {
  if (ppPresentaAbierta()) return true;
  const m = PP_MAPA.m === null ? ppMundoActual() : PP_MAPA.m, lista = ppPresentaVistos();
  if (!PP_PRESENTA.toca(m, ppMundoActual(), lista)) return false;
  SAVE.mundos = [...PP_PRESENTA.marca(lista, m)]; ppGuarda();
  ppPresentaMundo(m, ppAlLlegarAlCamino);
  return true;
}
