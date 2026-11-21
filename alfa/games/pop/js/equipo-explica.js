// Fans of Pop · QUÉ HACE CADA COMPAÑERO DE «TU EQUIPO» (tarea #142, ADR 157; Pepins, 19-11-2026, opción A del boceto
// https://claude.ai/artifact/APbjnsgcVXYWqkoNjWjFmD): en un nivel, tocar un hueco del panel de abajo abre un bocadillo encima con su
// nombre, sus estrellas, su habilidad, qué hace y cuándo actúa (qué llena su barra). No para el nivel: se quita al tocarlo otra vez, al
// tocar el tablero (ese toque cuenta) o solo a los 5 segundos. La primera vez que se ve el equipo, Lola avisa de que se puede tocar.
// Solo con el flag `companeros` abierto. PP_EXPLICA (la frase de «cuándo actúa») es pura; lo demás, la pantalla.
'use strict';
const PP_EXPLICA = Object.freeze({
  // `fx`: lo que hace (ppFxDe); `c`: { lo (pesadilla), usado (ya no le quedan ayudas en esta pesadilla), veces (las que ayuda en cada
  // nivel: 2 con Linterna, Marcha atrás o Volteo a 5 estrellas), carga (pops acumulados) }.
  // Devuelve { texto (clave de tr), datos (para tr), barra: 'rosa' | 'azul' | null }
  cuando(fx, c) {
    if (c.lo && c.usado) return { texto: 'Ya te ha ayudado en este nivel.', datos: {}, barra: null };
    if (c.lo) return { texto: c.veces > 1 ? 'Te ayuda {n} veces en cada nivel de Pesadilla.' : 'Te ayuda una vez en cada nivel de Pesadilla.', datos: { n: c.veces }, barra: null };
    if (fx.salta) return { texto: 'La barra rosa se llena con cada pop. Faltan {n} para saltar.', datos: { n: Math.max(1, fx.salta - (c.carga || 0)) }, barra: 'rosa' };
    if (fx.combo) return { texto: 'La barra azul sube con toques de 3 o más pops. Actúa con COMBO x{n}.', datos: { n: fx.combo }, barra: 'azul' };
    return { texto: 'Sin barra: actúa solo cuando le toca.', datos: {}, barra: null };
  },
});
const PP_EXP = { k: -1, reloj: null };
// ¿se puede tocar el panel ahora? En un nivel de pop-it o de pesadilla, con el panel a la vista (en los duelos no sale)
const ppExplicaVale = () => ppCompanerosActivo() && PP_PANT.actual === 'sala' && !!PP_P && !!PP_P.T && !PP_P.T.nim;
// el hueco del equipo que hay en (lx, ly) del lienzo lógico, o -1
function ppExplicaHuecoEn(lx, ly) {
  const T = PP_P.T, eq = ppEquipoNivel(T.d), m = 48 * ppEscalaEquipo();
  for (let k = 0; k < eq.length; k++) {
    const [x, y] = ppHuecoEquipo(k, T.n);
    if (Math.abs(lx - x) <= m && Math.abs(ly - y) <= m + 20) return k;   // +20: el nombre de debajo también cuenta
  }
  return -1;
}
// lo llama el toque del lienzo (js/principal.js). true si el toque era para el panel; si no, cierra el bocadillo y sigue el juego
function ppExplicaToque(lx, ly) {
  if (!ppExplicaVale()) { ppExplicaCierra(); return false; }
  const k = ppExplicaHuecoEn(lx, ly);
  if (k < 0) { ppExplicaCierra(); return false; }
  if (k === PP_EXP.k) ppExplicaCierra(); else ppExplicaAbre(k);
  play('select');
  return true;
}
function ppExplicaCierra() {
  clearTimeout(PP_EXP.reloj); PP_EXP.k = -1;
  const b = $pp('#pp-explica'); if (b) b.remove();
}
function ppExplicaAbre(k) {
  ppExplicaCierra();
  const T = PP_P.T, id = ppEquipoNivel(T.d)[k], d = ppSlimeDe(id), [x, y] = ppHuecoEquipo(k, T.n);
  const est = (ppCole().tiene[id] || { est: 1 }).est;
  const c = PP_EXPLICA.cuando(ppFxDe(id), { lo: T.lo, usado: !!T.habP && !ppHabLeQueda(T, id), veces: PP_HAB.usosDe(ppFxDe(id), PP_HAB_USOS_LO), carga: PP_P.carga[id] });
  const b = document.createElement('div');
  b.id = 'pp-explica'; b.style.top = Math.round(y - 50 * ppEscalaEquipo()) + 'px'; b.style.setProperty('--pp-flecha', Math.round(x) + 'px');
  b.innerHTML = `<h3>${tr(d.pasiva)} <span class="pp-explica-modo">${tr(T.lo ? 'Pesadilla' : 'Niveles')}</span></h3>
    <p><b>${tr(d.nombre)}</b> <span class="pp-explica-est">${'★'.repeat(est)}<i>${'★'.repeat(5 - est)}</i></span></p>
    <p>${tr(d.texto)}</p>
    <p class="pp-explica-cuando">${c.barra ? `<span class="pp-explica-barra pp-${c.barra}"></span>` : ''}${tr(c.texto, c.datos)}</p>
    <small>${tr('Toca otra vez para cerrar')}</small>`;
  $pp('#pp-ui').appendChild(b);
  PP_EXP.k = k; PP_EXP.reloj = setTimeout(ppExplicaCierra, 5000);
}
// el aviso de Lola, la primera vez que se ve el equipo en un nivel (lo pide ppTutorialesNivel, js/partida.js)
PP_TUTO.equipoToca = [{ t: '¡Toca a tus compañeros para ver qué hacen!' }];
function ppExplicaTutorial(d) { if (ppCompanerosActivo() && !d.nim && ppEquipoNivel(d).length) ppTutorial('equipoToca'); }
