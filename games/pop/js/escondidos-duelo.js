// Fans of Pop · EL DUELO POR UN COMPAÑERO ESCONDIDO (aplicación; tarea #329, ADR 205; solo con el flag `companeros`). Tocar la primera
// la burbuja arcoíris de un compañero NUEVO abre una ventana que lo enseña y pregunta si quieres luchar. ¡A LUCHAR! anula el nivel
// empezado (sin gastar corazón ni toques) y abre un duelo Nim contra él, con las reglas y la cortinilla de los niveles duelo
// (js/nimnivel.js): si ganas, es tuyo; si pierdes, cuesta 1 corazón y se puede REINTENTAR mientras haya corazones (esperándolos,
// con anuncio, monedas o comprándolos). AHORA NO, salir al camino o cerrar el juego en medio es perder la oportunidad. En este duelo
// no vale ninguna ayuda comprada: solo las gratis del equipo de Duelos. Las reglas puras (dificultad por rareza y tablero) están en
// js/escondidos.js; aquí van el azar, la partida guardada y las ventanas.
'use strict';
// ¿este tablero es el duelo por un compañero escondido? (ahí no se compran ayudas: js/potenciadores.js)
const ppEscSoloGratis = T => !!(T && T.d && T.d.esc);
// lo difícil del duelo, en una palabra, por rareza
const PP_ESC_DIFICULTAD = Object.freeze({ c: 'Fácil', r: 'Normal', e: 'Difícil', l: 'Muy difícil' });

/* ---------- la ventana de antes: ¿quieres luchar? ---------- */
function ppEscVentanaLucha(T, b) {
  const rar = PP_COMP.INFO[b.id].rar, n = tr(ppSlimeDe(b.id).nombre);
  const t = ppAbre(`<h2>${tr('¡Un compañero escondido!')}</h2><p class="pp-sub"><b>${tr(PP_COMP.RAREZAS[rar])}</b> · ${tr('Duelo')}: <b>${tr(PP_ESC_DIFICULTAD[rar])}</b></p>`);
  const fila = document.createElement('div'); fila.className = 'pp-fila-slimes';
  fila.appendChild(ppFichaSlime(b.id, true)); t.appendChild(fila);
  t.insertAdjacentHTML('beforeend', `<p class="pp-sub">${tr('Gana a {n} en un duelo y será tuyo.', { n })}</p>`
    + `<p class="pp-sub">${ppIcono('i-vida', 30, '#ff4a6a')} ${tr('Si pierdes, te cuesta 1 corazón. Este nivel se deja sin gastar nada.')}</p>`);
  t.appendChild(ppBoton(tr('¡A LUCHAR!'), 'pp-btn', () => { ppCierra(); ppEscGasta(T); ppEscCuenta('aceptadas', b.id); ppEscDueloEntra(b.id, T.d); }));
  t.appendChild(ppBoton(tr('AHORA NO'), 'pp-btn2 pp-volver', () => { ppCierra(); ppEscGasta(T); ppEscSeVa(b); }));
}

/* ---------- el duelo ---------- */
// el nivel del duelo: 6 filas de largos al azar, centradas, sobre el mundo y el modo del nivel que se deja (`base`)
function ppEscNivelDuelo(id, base) {
  const n = PP_ESC.DUELO.filas, mask = new Uint8Array(n * n), need = new Array(n * n).fill(0);
  PP_ESC.filasDuelo(Math.random).forEach((largo, y) => {
    const x0 = Math.floor((n - largo) / 2);
    for (let x = x0; x < x0 + largo; x++) { mask[y * n + x] = 1; need[y * n + x] = 1; }
  });
  return { g: base.g, dif: base.dif, mundo: base.mundo, l: base.l, lado: n, mask, need, esp: null, opt: [], limite: 99, pasa: 1, amigos: 0, jefe: false, dificil: true,
    tutorial: false, nim: { rival: id, fallo: PP_ESC.falloDuelo(id, ppEscMomento(base)) }, esc: { id } };
}
// entra en el duelo (la primera vez y en cada reintento). Desde que entras, salir o cerrar el juego cuesta el corazón (SAVE.dentro)
function ppEscDueloEntra(id, base) {
  if (ppVidas() <= 0) { ppVentanaSinCorazones(() => ppEscVentanaPerdido(id, base)); return; }
  PP_AYUDA.modo = null;
  ppEntraEn(ppEscNivelDuelo(id, base), tr('¡Duelo sorpresa!'));
  ppMarcaDentro(true);
}
// el final del duelo (ppNimFin, js/nimnivel.js): ganado, el compañero es tuyo y cuenta como un duelo ganado; perdido, 1 corazón
function ppEscDueloFin(T, gano) {
  const N = T.nim, id = T.d.esc.id;
  N.fin = gano ? 'gana' : 'pierde'; N.pistaNim = null; T.hecho = true;
  ppNimBoton(); ppBarraAyudas(); ppMarcaDentro(false);
  const luego = f => setTimeout(() => { if (PP_P && PP_P.T === T) f(); }, 900);
  if (gano) { ppEscDueloGanado(id); luego(() => ppEscVentanaGanado(id)); return; }
  ppPierdeVida(); play('ppDano'); ppVibra([30, 40, 30]); ppFxDano(); ppGuardaCamino();
  luego(() => ppEscVentanaPerdido(id, T.d));
}
// lo que da ganar: el compañero (con su aviso), un duelo más para el ranking, los logros de duelos y la misión del pase
function ppEscDueloGanado(id) {
  SAVE.dueloNivel = (SAVE.dueloNivel || 0) + 1;
  ppEscCuenta('ganadas', id);
  ppViaGana(id); ppViaDuelo(false); ppPaseDuelo();
  ppGuardaCamino(); play('ppVictoria'); setTimeout(ppSubeMarcas, 1500);
}
function ppEscVentanaGanado(id) {
  const n = tr(ppSlimeDe(id).nombre);
  const t = ppAbre(`<h2>${tr('¡Has ganado el duelo!')}</h2><p class="pp-sub"><b>${tr('¡{n} se une a tu colección!', { n })}</b></p>`);
  const fila = document.createElement('div'); fila.className = 'pp-fila-slimes';
  fila.appendChild(ppFichaSlime(id, true)); t.appendChild(fila);
  t.appendChild(ppBoton(tr('¡SIGUIENTE!'), 'pp-btn', ppAlCamino));
}
// perdido: el compañero espera mientras sigas aquí. Reintentar cuesta lo mismo (1 corazón si pierdes); irse al camino es adiós
function ppEscVentanaPerdido(id, base) {
  const n = tr(ppSlimeDe(id).nombre), quedan = ppVidas();
  const t = ppAbre(`<h2>${tr('¡{n} te ha ganado!', { n })}</h2><p class="pp-sub">${tr('Pierdes un corazón; te quedan {n}.', { n: quedan })}</p>`
    + `<p class="pp-sub">${tr('{n} sigue aquí. Si te vas al camino, se va.', { n })}</p>`);
  const b = ppBoton(quedan > 0 ? tr('REINTENTAR') : tr('CONSEGUIR CORAZONES'), 'pp-btn', () => { ppCierra(); ppEscDueloEntra(id, base); });
  t.appendChild(b);
  t.appendChild(ppBoton(tr('Dejarlo ir'), 'pp-btn2 pp-volver', ppAlCamino));
}
