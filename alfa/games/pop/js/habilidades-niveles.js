// Fans of Pop · HABILIDADES DE NIVELES (aplicación; tarea #142, ADR 157, nodo n3): lo que hacen en los niveles de pop-it los compañeros
// nuevos del equipo de Niveles: Imán de estrellas (estrella), Feriante (ticket), Buen comienzo (primero), Al rescate (rescate), Racha a
// salvo (racha), Limpieza (limpia) y la marca de más del Chivatazo a 5 estrellas (tarea #294); y lo común a los tres modos (el equipo
// del nivel que se juega, sus huecos en el panel y si en Pesadilla los amigos descansan). Solo con el flag `companeros` abierto: cerrado, nada de esto actúa y Pop sigue como siempre. Las
// cuentas están en js/habilidades.js; las 11 habilidades de siempre, en js/partida.js.
'use strict';
// el equipo del modo del nivel `d`, solo con el flag abierto ([] cerrado: las habilidades nuevas no actúan)
const ppHabEquipo = d => (ppCompanerosActivo() ? ppEquipoDe(ppModoDeNivel(d)) : []);
const ppHabSuma = (d, k) => PP_HAB.suma(ppHabEquipo(d), ppFxDe, k);
// el primero del equipo del nivel con esa habilidad (para que brille al actuar)
const ppHabQuien = (d, k) => PP_HAB.conHab(ppHabEquipo(d), ppFxDe, k)[0] || null;
// las veces que ayuda una habilidad de «una vez» en el equipo del nivel (1; 2 a las 5 estrellas)
const ppHabUsos = (d, k) => PP_HAB.usos(ppHabEquipo(d), ppFxDe, k);
// los huecos del panel «Tu equipo» en el nivel que se juega (con el flag cerrado, los del camino)
function ppHuecosNivel() {
  if (!ppCompanerosActivo()) return ppHuecos();
  const T = PP_P && PP_P.T;
  return ppCole().cas[ppModoDeNivel(T && T.d)];
}
// ¿en Pesadilla los amigos descansan? Con el flag cerrado, siempre que tengas equipo; abierto, solo si no hay equipo de Pesadilla
function ppHabDescansan() {
  if (!ppCompanerosActivo()) return PP_P.equipo.length > 0;
  return !ppEquipoDe('P').length && ppEquipoDe('N').length > 0;
}
// al entrar en un nivel: lo de Niveles aquí; lo de Pesadilla en js/habilidades-pesadilla.js; lo de los duelos, al empezar el duelo
function ppHabEntraNivel(T, d) {
  if (!ppCompanerosActivo() || d.tutorial || d.nim) return;
  if (d.lo) { ppHabEntraPesadilla(T, d); return; }
  T.iman = ppHabSuma(d, 'estrella');
  T.rescate = ppHabSuma(d, 'rescate');
  const lola = ppHabQuien(d, 'pista');   // el Chivatazo a 5 estrellas: una marca de más cuando ya no queda la del principio
  T.marcas = lola ? { id: lola, n: PP_HAB.extra(ppHabUsos(d, 'pista')) } : null;
}
// después de cada toque tuyo: Buen comienzo y las marcas de más (Chivatazo en Niveles, Linterna en Pesadilla)
function ppHabTrasToque(T) {
  ppHabPrimerToque(T);
  if (!ppCompanerosActivo() || T.pista !== null) return;
  if (T.habP) ppHabRemarcaLO(T); else ppHabRemarca(T);
}
// el Chivatazo a 5 estrellas: si ya no hay burbuja marcada, Lola marca otra (una vez por nivel)
function ppHabRemarca(T) {
  const m = T.marcas; if (!m || !m.n) return;
  ppPista(T); if (T.pista === null) return;
  m.n--; PP_FX.pista = 0.6; ppFxHabilidad(m.id); play('ppPista');
}
// Buen comienzo: con tu primer toque del nivel, salta y hace pop gratis en una de la solución
function ppHabPrimerToque(T) {
  if (T.habPrimero || !ppCompanerosActivo()) return;
  T.habPrimero = true;
  ppHabEquipo(T.d).forEach((id, k) => { const n = ppFxDe(id).primero; if (n) ppSaltaSlime(id, k, n); });
}
// Al rescate: al quedarte sin toques, una vez por nivel, toques de más. true si los ha dado
function ppHabRescata(T) {
  const n = PP_HAB.rescate(T.rescate || 0, T.rescateUsado);
  if (!n) return false;
  T.rescateUsado = true; T.limite += n;
  const id = ppHabQuien(T.d, 'rescate'); if (id) ppFxHabilidad(id);
  ppFlota(tr('¡Al rescate! +{n} toques', { n }), 270, 240, '#3a8ee6'); play('ppPremio');
  return true;
}
// Racha a salvo: una vez al día (dos a las 5 estrellas; en hora local), perder un nivel no rompe la racha. true si la salva (y apunta
// en SAVE el día y las veces)
function ppHabSalvaRacha() {
  const T = PP_P && PP_P.T;
  if (!ppCompanerosActivo() || !T || ppModoDeNivel(T.d) !== 'N') return false;
  const r = PP_HAB.racha(ppHabUsos(T.d, 'racha'), SAVE.racha, SAVE.rachaSalva, PP_HAB.diaLocal(new Date()));
  if (!r.salva) return false;
  SAVE.rachaSalva = r.usado;
  const id = ppHabQuien(T.d, 'racha'); if (id) ppFxHabilidad(id);
  ppFlota(tr('¡Victorias seguidas a salvo!'), 270, 275, '#ff8a2a');
  return true;
}
// el Feriante: tickets de la Feria de más al ganar con 3 estrellas
const ppHabTickets = T => PP_HAB.ticketsExtra(T.estrellas, ppHabSuma(T.d, 'ticket'));
// al ganar: la Limpieza (monedas por cada toque que sobra) y, en un nivel con duelo, la Hucha de Duelos. Se suman al premio del nivel
function ppHabAlGanar(T) {
  const d = T.d, extra = ppHabSuma(d, 'dMonedas') + (T.nim ? 0 : PP_HAB.limpia(T.limite, T.toques, ppHabSuma(d, 'limpia')));
  if (!extra) return;
  SAVE.monedas += extra; T.premio.monedas += extra; ppGuarda();
}
