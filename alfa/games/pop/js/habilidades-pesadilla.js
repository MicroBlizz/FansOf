// Fans of Pop · HABILIDADES DE PESADILLA (aplicación; tarea #142, ADR 157, nodo n4): el equipo de Pesadilla ayuda UNA vez por nivel
// (Linterna, Marcha atrás y Volteo, dos a las 5 estrellas: tarea #294).
// Al empezar: Calma (pCalma, toques de margen), Toque fantasma (pGratis, el primer toque no cuenta) y Linterna (pPista, marca una de la
// solución). Con botón en la barra de ayudas (#pp-ayudas, con la miniatura del compañero; desaparece al usarlo): Marcha atrás (pDeshaz,
// deshace tu último toque: se guarda una foto del tablero antes de cada toque) y Volteo (pVolteo, das la vuelta a una sola burbuja).
// Solo con el flag `companeros` abierto (js/habilidades-niveles.js decide cuándo se llama). Las cuentas, en js/habilidades.js.
'use strict';
// al entrar en un nivel de Pesadilla: T.habP = { usados: { id: veces que ya ha ayudado }, foto } y las ayudas que actúan solas
function ppHabEntraPesadilla(T, d) {
  T.habP = { usados: {}, foto: null };
  let y = 275;
  for (const id of ppHabEquipo(d)) {
    const fx = ppFxDe(id), txt = ppHabAlEmpezarLO(T, fx);
    if (!txt) continue;
    T.habP.usados[id] = 1; ppFxHabilidad(id);
    ppFlota(txt, 270, y, '#3a8ee6'); y += 35;
  }
}
// lo que hace uno al empezar (y el texto que sale), o null si el suyo es de botón
function ppHabAlEmpezarLO(T, fx) {
  if (fx.pCalma) { T.limite += fx.pCalma; return tr('+{n} toques extra', { n: fx.pCalma }); }
  if (fx.pGratis) { T.gratis += fx.pGratis; return tr('Tu primer toque no cuenta'); }
  if (fx.pPista) { ppPista(T); return T.pista === null ? null : tr('Te marca una burbuja buena'); }
  return null;
}
// las de «una vez» de Pesadilla, cuya cifra son sus veces por nivel (js/coleccion.js); ¿le queda alguna a este compañero?
const PP_HAB_USOS_LO = Object.freeze(['pPista', 'pDeshaz', 'pVolteo']);
const ppHabLeQueda = (T, id) => !!T.habP && PP_HAB.queda(PP_HAB.usosDe(ppFxDe(id), PP_HAB_USOS_LO), T.habP.usados[id]);
// ¿queda alguien en el equipo con esta habilidad sin usar?
const ppHabPorUsar = (T, k) => !!T.habP && ppHabEquipo(T.d).some(id => ppFxDe(id)[k] && ppHabLeQueda(T, id));
// la Linterna a 5 estrellas: si ya no hay burbuja marcada, marca otra (lo llama ppHabTrasToque, js/habilidades-niveles.js)
function ppHabRemarcaLO(T) {
  const id = ppHabEquipo(T.d).find(c => ppFxDe(c).pPista && ppHabLeQueda(T, c)); if (!id) return;
  ppPista(T); if (T.pista === null) return;
  T.habP.usados[id]++; PP_FX.pista = 0.6; ppFxHabilidad(id); play('ppPista');
}
// antes de cada toque del jugador: la foto para Marcha atrás y, si se está eligiendo burbuja para el Volteo, voltearla.
// Con el martillo o la bomba no hay foto (Marcha atrás no deshace una ayuda pagada). true si el toque ya se ha usado aquí
function ppHabAntesDeToque(T, i) {
  if (!T.habP) return false;
  if (ppHabPorUsar(T, 'pDeshaz')) T.habP.foto = PP_AYUDA.modo && !T.habModo ? null : PP_HAB.foto(T);
  if (!T.habModo) return false;
  ppHabVoltea(T, i);
  return true;
}
/* ---------- los botones de la barra de ayudas ---------- */
const PP_HAB_BOTON = Object.freeze({ pDeshaz: id => ppHabDeshazLO(id), pVolteo: id => ppHabEligeVolteo(id) });
// uno por compañero con botón que aún no ha ayudado en este nivel (lo llama ppBarraAyudas, js/potenciadores.js)
function ppHabBotones(barra, T) {
  if (!T.habP || T.nim) return;
  for (const id of ppHabEquipo(T.d)) {
    const k = Object.keys(PP_HAB_BOTON).find(c => ppFxDe(id)[c]);
    if (!k || !ppHabLeQueda(T, id)) continue;
    const bt = document.createElement('button');
    bt.type = 'button'; bt.className = 'pp-ayuda' + (T.habModo === id ? ' pp-activa' : '');
    bt.appendChild(ppMiniatura('sl-' + id, 52));
    const nombre = tr(PP_COMP.HAB[PP_COMP.INFO[id].hab].nombre);
    bt.insertAdjacentHTML('beforeend', `<b>${tr('GRATIS')}</b><i>${nombre}</i>`);   // con su nombre debajo, como las ayudas (tarea #269)
    bt.setAttribute('aria-label', nombre);
    bt.onclick = () => { play('select'); PP_HAB_BOTON[k](id); };
    barra.appendChild(bt);
  }
}
// ¿se puede usar ahora una ayuda de botón? (no con el nivel acabado, parado sin toques o con la cortinilla)
const ppHabLibre = T => !!T && !T.hecho && !T.parado && !ppCortActiva();
// Marcha atrás: el tablero vuelve a la foto de antes de tu último toque
function ppHabDeshazLO(id) {
  const T = PP_P && PP_P.T; if (!ppHabLibre(T)) return;
  const r = PP_HAB.vuelve(T.habP.foto);
  if (!r.ok) { ppFlota(tr('Aún no hay nada que deshacer'), 270, 240, '#ff6ec7'); return; }
  Object.assign(T, r.tablero, { habModo: null });
  T.habP.usados[id] = (T.habP.usados[id] || 0) + 1; T.habP.foto = null;
  PP_FX.celdas = {}; for (let i = 0; i < T.up.length; i++) if (T.mask[i]) PP_FX.celdas[i] = { t: 0, dir: T.up[i] ? 'sube' : 'pop', demora: 0 };
  ppFxHabilidad(id); ppFlota(tr('¡Deshecho!'), 270, 240, '#4fc964'); play('ppCura');
  ppBarraAyudas();
}
// Volteo: el botón pone a elegir burbuja (otra pulsación, lo cancela); el siguiente toque la voltea
function ppHabEligeVolteo(id) {
  const T = PP_P && PP_P.T; if (!ppHabLibre(T)) return;
  T.habModo = T.habModo === id ? null : id; PP_AYUDA.modo = null;
  if (T.habModo) ppFlota(tr('Toca la burbuja a la que quieras dar la vuelta'), 270, 240, '#ff8a2a');
  ppBarraAyudas();
}
function ppHabVoltea(T, i) {
  const id = T.habModo, r = PP_HAB.voltea(T.up, T.mask, i, up => ppResuelveLO(T.n, T.mask, up));
  if (!r.ok) { if (r.error === 'sin_solucion') ppFlota(tr('Esa no: así no se podría ganar'), 270, 240, '#ff6ec7'); return; }
  T.habModo = null; T.habP.usados[id] = (T.habP.usados[id] || 0) + 1;
  T.up = r.up; T.sol = r.sol; if (!r.sube) T.pops++;
  T.hecho = ppResuelto(T);
  if (T.pista !== null && !T.sol.has(T.pista)) T.pista = null;
  const res = { pops: r.sube ? [] : [i], grietas: [], subes: r.sube ? [i] : [], castigo: 0, hecho: T.hecho, golpes: r.sube ? 0 : 1 };
  ppMarcaDentro(true); ppFxHabilidad(id); ppFxToque(T, i, res); play('ppPremio');
  ppTrasToque(T, i, res);
  ppBarraAyudas();
}
