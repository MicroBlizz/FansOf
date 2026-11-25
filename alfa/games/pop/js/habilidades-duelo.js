// Fans of Pop · HABILIDADES DE DUELOS (aplicación; tarea #142, ADR 157, nodo n5): lo que hace el equipo de Duelos SOLO contra la máquina
// (los niveles con duelo de js/nimnivel.js y el duelo contra el CEO de js/duelo.js; js/pvp.js no llama a nada de aquí: contra gente el
// duelo es limpio). Lupa (dPista, una pista gratis por duelo), Otra vez (dDeshaz, un deshacer gratis por duelo, en tu turno), Despiste
// (dFallo, el rival se equivoca más), Saque (dSaque, eliges quién empieza), Pellizco (dQuita, quitas una burbuja antes de empezar) y
// Hucha (dMonedas, monedas de más al ganar). A 5 estrellas (tarea #294): dos lupas, dos deshacer, dos burbujas quitadas y el Saque te
// chiva con quién empiezas ganando. Solo con el flag `companeros` abierto. Las cuentas, en js/habilidades.js.
'use strict';
// el equipo de Duelos ([] con el flag cerrado: nada de esto actúa)
const ppHabDEquipo = () => (ppCompanerosActivo() ? ppEquipoDe('D') : []);
const ppHabDQuien = k => PP_HAB.conHab(ppHabDEquipo(), ppFxDe, k)[0] || null;
const ppHabDTiene = k => ppHabDQuien(k) !== null;
const ppHabDSuma = k => PP_HAB.suma(ppHabDEquipo(), ppFxDe, k);
// las veces por duelo de una de «una vez» (1; 2 a las 5 estrellas)
const ppHabDUsos = k => PP_HAB.usos(ppHabDEquipo(), ppFxDe, k);
// Otra vez: ¿queda algún deshacer gratis en este duelo? (N: el estado del duelo del nivel, T.nim; N.deshacesGratis, los gastados)
const ppHabDDeshazGratis = N => PP_HAB.queda(ppHabDUsos('dDeshaz'), N.deshacesGratis);
// Despiste: la probabilidad de fallo del rival con lo que suma el equipo
const ppHabDFallo = base => PP_HAB.fallo(base, ppHabDSuma('dFallo'));
// Hucha: las monedas de más al ganar al CEO (los niveles con duelo las suman a su premio: ppHabAlGanar). Devuelve cuántas
function ppHabDMonedas() {
  const n = ppHabDSuma('dMonedas');
  if (n) { SAVE.monedas += n; ppFxHabilidad(ppHabDQuien('dMonedas')); PP_ATAQUE_FX.luce(ppHabDQuien('dMonedas')); }   // luce: solo se ve (js/ataques-fx.js)
  return n;
}
/* ---------- antes del primer turno: Pellizco y Saque ---------- */
// ¿hay algo que hacer antes del primer turno?
const ppHabDPrevia = () => ppHabDTiene('dQuita') || ppHabDTiene('dSaque');
// los pasos de antes del primer turno. `p`: { T, natural() → 'yo' | 'rival' (quién empezaría sin Saque), empieza(quien) };
// p.quitadas: las burbujas que ya ha quitado el Pellizco; p.sinQuitar: se ha saltado
const ppHabDQuitaMas = p => !p.sinQuitar && PP_HAB.queda(ppHabDUsos('dQuita'), p.quitadas) && PP_HAB.puedeQuitar(p.T.up, p.T.mask);
function ppHabDPreviaSigue(p) {
  if (ppHabDQuitaMas(p)) { ppHabDVentanaQuita(p); return; }
  if (ppHabDTiene('dSaque')) { ppHabDVentanaSaque(p); return; }
  p.empieza(p.natural());
}
function ppHabDVentanaQuita(p) {
  const id = ppHabDQuien('dQuita');
  const t = ppAbre(`<h2>${tr(PP_COMP.HAB.quita.nombre)}</h2><p class="pp-sub">${tr('{n} puede quitar una burbuja del tablero antes de empezar.', { n: tr(ppSlimeDe(id).nombre) })}</p>`);
  t.appendChild(ppBoton(tr('ELEGIR BURBUJA'), 'pp-btn', () => { ppCierra(); p.eligiendo = id; ppFlota(tr('Toca la burbuja que quieras quitar'), 270, 240, '#ff8a2a'); }));
  t.appendChild(ppBoton(tr('Saltar'), 'pp-btn2 pp-azul', () => { ppCierra(); p.sinQuitar = true; ppHabDPreviaSigue(p); }));
}
function ppHabDVentanaSaque(p) {
  const id = ppHabDQuien('dSaque');
  const t = ppAbre(`<h2>${tr(PP_COMP.HAB.salida.nombre)}</h2><p class="pp-sub">${tr('{n} te deja elegir quién empieza el duelo.', { n: tr(ppSlimeDe(id).nombre) })}</p>${ppHabDChivaSaque(p)}`);
  const elige = quien => () => { ppCierra(); ppFxHabilidad(id); PP_ATAQUE_FX.luce(id); p.empieza(quien); };
  t.appendChild(ppBoton(tr('EMPIEZO YO'), 'pp-btn', elige('yo')));
  t.appendChild(ppBoton(tr('EMPIEZA EL RIVAL'), 'pp-btn2 pp-azul', elige('rival')));
}
// el Saque a 5 estrellas: con quién empiezas ganando (Nim: gana quien mueve si ppNimGana); sin estrellas de más, nada
function ppHabDChivaSaque(p) {
  if (!PP_HAB.extra(ppHabDUsos('dSaque'))) return '';
  return `<p class="pp-sub">${ppNimGana(ppFilasDuelo(p.T)) ? tr('Truco: si empiezas tú, vas ganando.') : tr('Truco: si empieza el rival, vas ganando.')}</p>`;
}
// el toque que quita la burbuja del Pellizco (`estado`: T.nim o PP_DUELO). true si el toque era para eso
function ppHabDQuitaToque(estado, i) {
  const p = estado && estado.previa; if (!p || !p.eligiendo) return false;
  const T = p.T, r = PP_HAB.quita(T.up, T.mask, i);
  if (!r.ok) return true;
  T.up = r.up;
  ppFxToque(T, i, { pops: [i], grietas: [], subes: [], hecho: false }); ppFxHabilidad(p.eligiendo); PP_ATAQUE_FX.luce(p.eligiendo, 'tablero', i); play('ppSalto');
  p.eligiendo = null; p.quitadas = (p.quitadas || 0) + 1;
  ppHabDPreviaSigue(p);
  return true;
}
// en un nivel con duelo (lo llama ppEmpiezaNivel cuando T.nim.turno es 'espera', puesto por ppNimEmpieza)
function ppHabNimPrevia(T) {
  T.nim.previa = { T, natural: () => (ppNimGana(ppFilasDuelo(T)) ? 'yo' : 'rival'), empieza: quien => ppHabNimTurno(T, quien) };
  ppHabDPreviaSigue(T.nim.previa);
}
function ppHabNimTurno(T, quien) {
  const N = T.nim; N.previa = null;
  if (!PP_P || PP_P.T !== T || N.fin) return;
  N.turno = quien;
  if (quien === 'rival') setTimeout(() => ppNimRival(T), 700); else ppNimFoto(T);
  ppNimBoton(); ppBarraAyudas();
}
// en el duelo contra el CEO (lo llama ppDueloEmpieza): sin Saque, empieza quien tocó al azar
function ppHabCeoPrevia(D) {
  const azar = D.turno; D.turno = 'espera'; ppDueloBoton();
  D.previa = { T: D.T, natural: () => (azar === 'ceo' ? 'rival' : 'yo'), empieza: quien => ppHabCeoTurno(D, quien) };
  ppHabDPreviaSigue(D.previa);
}
function ppHabCeoTurno(D, quien) {
  D.previa = null;
  if (PP_DUELO !== D || D.fin) return;
  D.turno = quien === 'rival' ? 'ceo' : 'yo'; ppDueloBoton();
  if (D.turno === 'ceo') setTimeout(ppTurnoCeo, 1100);
}
