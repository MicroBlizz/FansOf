// Fans of Pop · EL DUELO POR UN COMPAÑERO ESCONDIDO (aplicación; tarea #329, ADR 205; solo con el flag `companeros`). Tocar la primera
// la burbuja arcoíris de un compañero NUEVO (o de un repetido que aún sirve: ahí el duelo da 2 copias y también vale la RED, que lo
// captura al momento sin dejar el nivel) abre una ventana que lo enseña y pregunta si quieres luchar. ¡A LUCHAR! anula el nivel
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
// de uno NUEVO: quién es, su rareza, lo difícil y lo que cuesta. De un REPETIDO que aún sirve: además, sus estrellas y los repetidos
// que le faltan, y la RED para capturarlo al momento. AHORA NO pierde la oportunidad y el nivel sigue
function ppEscVentanaLucha(T, b) {
  const rar = PP_COMP.INFO[b.id].rar, n = tr(ppSlimeDe(b.id).nombre);
  const t = ppAbre(`<h2>${b.nuevo ? tr('¡Un compañero escondido!') : tr('¡Un compañero repetido!')}</h2><p class="pp-sub"><b>${tr(PP_COMP.RAREZAS[rar])}</b> · ${tr('Duelo')}: <b>${tr(PP_ESC_DIFICULTAD[rar])}</b></p>`);
  const fila = document.createElement('div'); fila.className = 'pp-fila-slimes';
  fila.appendChild(ppFichaSlime(b.id, b.nuevo)); t.appendChild(fila);
  t.insertAdjacentHTML('beforeend', (b.nuevo ? `<p class="pp-sub">${tr('Gana a {n} en un duelo y será tuyo.', { n })}</p>` : ppEscProgresoHtml(b.id))
    + `<p class="pp-sub">${ppIcono('i-vida', 30, '#ff4a6a')} ${tr('Si pierdes, te cuesta 1 corazón. Este nivel se deja sin gastar nada.')}</p>`);
  t.appendChild(ppBoton(tr('¡A LUCHAR!'), 'pp-btn', () => { ppCierra(); ppEscGasta(T); PP_ESC_DATOS.estado(b.dato, 'duelo'); ppEscDueloEntra(b.id, T.d, !b.nuevo, b.dato); }));
  if (!b.nuevo) t.appendChild(ppEscBotonRed(T, b));
  t.appendChild(ppBoton(tr('AHORA NO'), 'pp-btn2 pp-volver', () => { ppCierra(); ppEscGasta(T); ppEscSeVa(b); PP_ESC_DATOS.estado(b.dato, 'ahora-no'); }));
}
// de un repetido: sus estrellas, los repetidos guardados para la siguiente, los que faltan para el máximo y lo que da el duelo
function ppEscProgresoHtml(id) {
  const p = PP_ESC.progreso(ppCole().tiene[id]), C = PP_ESC.DUELO.copias;
  const estrellas = Array.from({ length: p.tope }, (_, k) => `<span style="opacity:${k < p.est ? 1 : 0.25}">${ppIcono('i-estrella', 26)}</span>`).join('');
  return `<p class="pp-sub">${estrellas}</p>`
    + `<p class="pp-sub">${p.siguiente ? tr('Repetidos para la siguiente estrella: {a} de {b}', { a: Math.min(p.rep, p.siguiente), b: p.siguiente }) + ' · ' : ''}${tr('Te faltan {n} para las {t} estrellas', { n: p.faltan, t: p.tope })}</p>`
    + `<p class="pp-sub">${tr('Gana el duelo y te llevas {a} repetidos. Con la red, {b} al momento y sigues tu nivel.', { a: C.duelo, b: C.red })}</p>`;
}
// la RED (PP_CFG.ayudas.red): captura el repetido al momento, sin duelo y sin dejar el nivel. Se usa una que tengas o se compra aquí
// con perlas, como las demás ayudas (ppGastaAyuda, js/potenciadores.js); si faltan perlas, tras comprarlas se vuelve a esta ventana
function ppEscBotonRed(T, b) {
  const tengo = ppTengo('red'), bt = ppBoton('', 'pp-btn2 pp-pago', () => {
    if (!ppGastaAyuda('red', () => ppEscVentanaLucha(T, b))) return;
    ppCierra(); ppEscGasta(T); PP_ESC_DATOS.estado(b.dato, 'red'); play('ppPremio');
    ppEscRevienta(T, b);   // salta de la burbuja con sus chispas y su aviso; la burbuja sigue ahí, normal
  });
  bt.innerHTML = `${ppIcono('i-red', 34, '#a8f0c6')} ${tr('TIRAR LA RED')} · ${tengo ? tr('tienes {n}', { n: tengo }) : ppPerlasPrecioHtml(PP_CFG.ayudas.red.perlas, 24)}`;
  return bt;
}

/* ---------- el duelo ---------- */
// el nivel del duelo: 6 filas de largos al azar, centradas, sobre el mundo y el modo del nivel que se deja (`base`)
function ppEscNivelDuelo(id, base, repetido, dato) {
  const n = PP_ESC.DUELO.filas, mask = new Uint8Array(n * n), need = new Array(n * n).fill(0);
  PP_ESC.filasDuelo(Math.random).forEach((largo, y) => {
    const x0 = Math.floor((n - largo) / 2);
    for (let x = x0; x < x0 + largo; x++) { mask[y * n + x] = 1; need[y * n + x] = 1; }
  });
  return { g: base.g, dif: base.dif, mundo: base.mundo, l: base.l, lado: n, mask, need, esp: null, opt: [], limite: 99, pasa: 1, amigos: 0, jefe: false, dificil: true,
    tutorial: false, nim: { rival: id, fallo: PP_ESC.falloDuelo(id, ppEscMomento(base)) }, esc: { id, repetido: !!repetido, dato } };
}
// entra en el duelo (la primera vez y en cada reintento). Desde que entras, salir o cerrar el juego cuesta el corazón (SAVE.dentro)
// `repetido`: el duelo es por un repetido (da 2 copias); `dato`, la ficha del encuentro (PP_ESC_DATOS, js/escondidos-datos.js). La ventana de perder
// los lleva a cada reintento
function ppEscDueloEntra(id, base, repetido = false, dato = null) {
  if (ppVidas() <= 0) { ppVentanaSinCorazones(() => ppEscVentanaPerdido(id, base, repetido, dato)); return; }
  PP_ESC_DATOS.jugado(dato);
  PP_AYUDA.modo = null;
  ppEntraEn(ppEscNivelDuelo(id, base, repetido, dato), tr('¡Duelo sorpresa!'));
  ppMarcaDentro(true);
}
// el final del duelo (ppNimFin, js/nimnivel.js): ganado, el compañero es tuyo y cuenta como un duelo ganado; perdido, 1 corazón
function ppEscDueloFin(T, gano) {
  const N = T.nim, id = T.d.esc.id, dato = T.d.esc.dato;
  N.fin = gano ? 'gana' : 'pierde'; N.pistaNim = null; T.hecho = true;
  ppNimBoton(); ppBarraAyudas(); ppMarcaDentro(false);
  const luego = f => setTimeout(() => { if (PP_P && PP_P.T === T) f(); }, 900);
  if (gano) { PP_ESC_DATOS.estado(dato, 'ganada'); ppEscDueloGanado(id, T.d.esc.repetido); luego(() => ppEscVentanaGanado(id, T.d.esc.repetido)); return; }
  PP_ESC_DATOS.perdido(dato);
  ppPierdeVida(); play('ppDano'); ppVibra([30, 40, 30]); ppFxDano(); ppGuardaCamino();
  luego(() => ppEscVentanaPerdido(id, T.d, T.d.esc.repetido, dato));
}
// lo que da ganar: el compañero nuevo o 2 copias del repetido (con su aviso), un duelo más para el ranking, los logros de duelos y
// la misión del pase
function ppEscDueloGanado(id, repetido) {
  SAVE.dueloNivel = (SAVE.dueloNivel || 0) + 1;
  const C = PP_ESC.DUELO.copias;
  for (let k = 0; k < (repetido ? C.duelo : C.nuevo); k++) ppViaGana(id);
  ppViaDuelo(false); ppPaseDuelo();
  ppGuardaCamino(); play('ppVictoria'); setTimeout(ppSubeMarcas, 1500);
}
function ppEscVentanaGanado(id, repetido) {
  const n = tr(ppSlimeDe(id).nombre);
  const frase = repetido ? tr('+{c} {n} repetidos', { c: PP_ESC.DUELO.copias.duelo, n }) : tr('¡{n} se une a tu colección!', { n });
  const t = ppAbre(`<h2>${tr('¡Has ganado el duelo!')}</h2><p class="pp-sub"><b>${frase}</b></p>`);
  const fila = document.createElement('div'); fila.className = 'pp-fila-slimes';
  fila.appendChild(ppFichaSlime(id, !repetido)); t.appendChild(fila);
  t.appendChild(ppBoton(tr('¡SIGUIENTE!'), 'pp-btn', ppAlCamino));
}
// perdido: el compañero espera mientras sigas aquí. Reintentar cuesta lo mismo (1 corazón si pierdes); irse al camino es adiós
function ppEscVentanaPerdido(id, base, repetido, dato) {
  const n = tr(ppSlimeDe(id).nombre), quedan = ppVidas();
  const t = ppAbre(`<h2>${tr('¡{n} te ha ganado!', { n })}</h2><p class="pp-sub">${tr('Pierdes un corazón; te quedan {n}.', { n: quedan })}</p>`
    + `<p class="pp-sub">${tr('{n} sigue aquí. Si te vas al camino, se va.', { n })}</p>`);
  const b = ppBoton(quedan > 0 ? tr('REINTENTAR') : tr('CONSEGUIR CORAZONES'), 'pp-btn', () => { ppCierra(); ppEscDueloEntra(id, base, repetido, dato); });
  t.appendChild(b);
  t.appendChild(ppBoton(tr('Dejarlo ir'), 'pp-btn2 pp-volver', () => { PP_ESC_DATOS.estado(dato, 'dejada'); ppAlCamino(); }));
}
// salir del duelo (pausa o camino) cuesta el corazón como perderlo (ppSalNivel, js/partida.js): la ficha lo apunta como perdido y dejado
function ppEscDueloSale(T) {
  if (T && T.d && T.d.esc && !T.hecho) PP_ESC_DATOS.perdido(T.d.esc.dato, 'dejada');
}
