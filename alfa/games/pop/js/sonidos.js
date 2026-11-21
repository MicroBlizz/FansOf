// Fans of Pop · SONIDOS: kawaii, que es un juego para niños. TODOS los efectos se hacen aquí por código (Daniel, 30-10-2026:
// los de Yoshi salían largos, graves o metálicos): solo ondas suaves (seno y triángulo), campanitas, gotitas y silbatos, en notas
// de la escala pentatónica para que siempre combinen. Nada de ondas cuadradas ni de sierra ni ruido fuerte. Cada pop suena
// un pelín distinto (como el juguete) y además vibra el móvil (ppVibra).
// La música es la de la serie (core/js/serie/canciones.js): la tranquila del menú en la portada, el mapa y los niveles,
// la de jefe con el CEO y la sintonía de ganar.
'use strict';
function ppCargaSonidos() { /* ya no hay archivos: todo se hace por código */ }
// el navegador no deja vibrar hasta el primer toque en la página (y lo avisa en la consola): hasta entonces no se intenta (tarea #185)
const ppPuedeVibrar = nav => !!(nav && nav.vibrate) && (!nav.userActivation || nav.userActivation.hasBeenActive);
function ppVibra(ms) { if (SAVE.sinVibrar || !ppPuedeVibrar(navigator)) return; try { navigator.vibrate(ms); } catch (e) { /* sin vibración */ } }
// EL PLOP (hecho a mano, no con Yoshi: la IA no sabe hacer sonidos tan cortos). Una gotita kawaii: un tono que SUBE muy rápido
// y se apaga en menos de una décima (como una burbuja de agua), un clic suave delante (la «p») y un brillito agudo encima.
function ppPlop(nota = 1, cuando = 0) {
  if (!AC || sonidoApagado()) return;
  const t = AC.currentTime + 0.005 + cuando, f = 520 * nota, out = AC.createGain(); out.gain.value = 0.9; out.connect(master);
  const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine';
  o.frequency.setValueAtTime(f * 0.55, t); o.frequency.exponentialRampToValueAtTime(f * 1.7, t + 0.05);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.42, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.12);
  const b = AC.createOscillator(), gb = AC.createGain(); b.type = 'triangle'; b.frequency.setValueAtTime(f * 3.4, t + 0.02);
  gb.gain.setValueAtTime(0.0001, t + 0.02); gb.gain.linearRampToValueAtTime(0.06, t + 0.025); gb.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
  b.connect(gb); gb.connect(out); b.start(t + 0.02); b.stop(t + 0.09);
  if (noiseBuf) { const s = AC.createBufferSource(), fl = AC.createBiquadFilter(), gn = AC.createGain(); s.buffer = noiseBuf; fl.type = 'bandpass'; fl.frequency.value = 3500; fl.Q.value = 1.2;
    gn.gain.setValueAtTime(0.12, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.012); s.connect(fl); fl.connect(gn); gn.connect(out); s.start(t); s.stop(t + 0.02); }
}
// la burbuja que vuelve a subir: un «boing» blandito de gelatina, más flojo que el plop para que mande el plop
function ppBoing(nota = 1) {
  if (!AC || sonidoApagado()) return;
  const t = AC.currentTime + 0.05, f = 260 * nota, o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine';
  o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.9, t + 0.06); o.frequency.exponentialRampToValueAtTime(f * 1.5, t + 0.12);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.14, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.16);
}
// las notas de la escala pentatónica: suenan siempre bonitas, pulses lo que pulses
const PP_PENTA = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2];
// --- las piezas de los sonidos kawaii ---
function ppSalida(vol) { const g = AC.createGain(); g.gain.value = vol; g.connect(master); return g; }
// una campanita: seno con un armónico suave encima que se apaga antes (suena a caja de música)
function ppCampana(f, cuando = 0, vol = 0.12, dur = 0.35) {
  if (!AC || sonidoApagado()) return;
  const t = AC.currentTime + 0.01 + cuando, out = ppSalida(1);
  [[1, vol], [2, vol * 0.35], [3, vol * 0.08]].forEach(([m, v], k) => {
    const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.value = f * m;
    const d = dur / (1 + k * 0.8);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + d + 0.02);
  });
}
// un silbato de juguete que se desliza de f0 a f1 (con un poquito de vibrato si `vib`)
function ppSilbato(f0, f1, dur, cuando = 0, vol = 0.12, vib = 0) {
  if (!AC || sonidoApagado()) return;
  const t = AC.currentTime + 0.01 + cuando, o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine';
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  if (vib) { const l = AC.createOscillator(), lg = AC.createGain(); l.frequency.value = 7; lg.gain.value = vib; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + 0.05); }
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.02); g.gain.setValueAtTime(vol, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.04);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.08);
}
// notas (Hz) de la pentatónica de Do, de grave a agudo
const PP_NOTAS = [523, 587, 659, 784, 880, 1046, 1175, 1318, 1568, 1760, 2093, 2349, 2637];
const ppArpegio = (desde, cuantas, paso, vol = 0.1, salto = 1) => { for (let k = 0; k < cuantas; k++) ppCampana(PP_NOTAS[Math.min(PP_NOTAS.length - 1, desde + k * salto)], k * paso, vol); };
Object.assign(SFX, {
  ppPop: (n = 0) => ppPlop(PP_PENTA[(n * 7) % PP_PENTA.length]),
  ppUnpop: (n = 0) => ppBoing(PP_PENTA[(n * 3) % PP_PENTA.length]),
  // un amigo rescatado: un pío-pío alegre y un brillito
  ppRescate: () => { ppSilbato(1046, 1568, 0.07, 0, 0.1); ppSilbato(1175, 1760, 0.07, 0.1, 0.1); ppArpegio(8, 3, 0.05, 0.07, 1); },
  // nivel superado: caja de música subiendo
  ppSala: () => ppArpegio(5, 4, 0.09, 0.11),
  // pantalla de victoria: una campanita por estrella, cada una más aguda, al compás de cómo caen (css/victoria.css)
  ppEstrellas: (n = 3) => { for (let k = 0; k < n; k++) ppCampana(PP_NOTAS[7 + k * 2], 0.45 + k * 0.28, 0.13, 0.45); },
  // pierdes un corazón: un «oh-oh» blandito de dos notas que bajan, con un vibrato tierno
  ppDano: () => { ppSilbato(880, 784, 0.12, 0, 0.12, 8); ppSilbato(698, 587, 0.2, 0.15, 0.12, 10); },
  // ganar al CEO: melodía de caja de música
  ppVictoria: () => [5, 7, 8, 10, 8, 10, 12].forEach((n, k) => ppCampana(PP_NOTAS[n], k * 0.11, 0.12, 0.5)),
  // sin corazones: un silbato triste que baja despacito y dos pip pequeños («no pasa nada»)
  ppDerrota: () => { ppSilbato(1046, 523, 0.7, 0, 0.11, 12); ppCampana(659, 0.85, 0.08, 0.2); ppCampana(784, 1.0, 0.08, 0.25); },
  // un amigo salta al tablero: silbato que sube como un muelle y un ding
  ppSalto: () => { ppSilbato(440, 1318, 0.18, 0, 0.12); ppCampana(2093, 0.17, 0.08, 0.3); },
  // premio gordo: tres campanitas brillantes
  ppPremio: () => ppArpegio(8, 3, 0.06, 0.1, 2),
  // combo: un arpegio que empieza más agudo cuanto más largo es el combo
  ppCombo: (n = 2) => ppArpegio(Math.min(6, n - 1), 3, 0.045, 0.08),
  ppPista: () => { ppCampana(1568, 0, 0.07, 0.25); ppCampana(2093, 0.08, 0.07, 0.3); },
  ppCura: () => ppArpegio(3, 3, 0.06, 0.08),
  ppNodo: () => ppSilbato(784, 1318, 0.08, 0, 0.1),
  // los botones: una gotita
  select: () => ppPlop(1.5),
});
Object.assign(THROTTLE, { ppPop: 25, ppUnpop: 25, ppCombo: 60 });

// LOS ATAQUES DE LOS COMPAÑEROS (tarea #160, ADR 197): un sonido por FORMA de ataque (su id es el `sonido` de PP_ATAQUES.formas,
// js/ataques-datos.js). Intensidad «Fiesta»: cortos (0,15 a 0,45 s), agudos y con brillo o rebote, hechos con las mismas piezas
// kawaii de arriba (campanitas, silbatos y gotitas). Varios compañeros pueden atacar a la vez: cada uno se frena 60 ms.
const PP_SON_ATAQUE = Object.freeze({
  // salto: un muelle que sube, el pop al caer y un ding
  'ataque-salto': () => { ppSilbato(523, 1568, 0.12, 0, 0.11); ppPlop(2, 0.13); ppCampana(2637, 0.2, 0.06, 0.22); },
  // especial: va derecho (silbato rápido) y da un zarpazo de dos rasguños agudos con un brillito
  'ataque-especial': () => { ppSilbato(1318, 2093, 0.07, 0, 0.15); ppSilbato(2349, 1568, 0.04, 0.09, 0.14); ppSilbato(2637, 1760, 0.04, 0.15, 0.14); ppCampana(2637, 0.21, 0.1, 0.2); },
  // lluvia: cuatro gotitas que caen seguidas, cada una en otra nota
  'ataque-lluvia': () => { [2, 1.5, 1.67, 1.25].forEach((n, k) => ppPlop(n, k * 0.065)); ppCampana(2093, 0.28, 0.05, 0.18); },
  // marca: un arco que sube despacito y dos chispitas que brillan al llegar
  'ataque-marca': () => { ppSilbato(784, 1568, 0.14, 0, 0.15); ppCampana(2637, 0.15, 0.12, 0.25); ppCampana(2349, 0.22, 0.1, 0.22); },
  // toque: sube al contador (tres notas rápidas) y hace una onda con vibrato
  'ataque-toque': () => { ppArpegio(3, 3, 0.04, 0.12); ppSilbato(1318, 1568, 0.12, 0.13, 0.13, 40); },
  // premio: un arco y un destello de cuatro campanitas brillantes
  'ataque-premio': () => { ppSilbato(659, 1318, 0.09, 0, 0.13); [7, 9, 10, 12].forEach((n, k) => ppCampana(PP_NOTAS[n], 0.09 + k * 0.05, 0.11, 0.3)); },
  // monedas: la fuente de monedas, un tintineo de cuatro dings que suben y bajan
  'ataque-monedas': () => [8, 10, 12, 10].forEach((n, k) => ppCampana(PP_NOTAS[n], k * 0.06, 0.13, 0.2)),
  // tiempo: un remolino (silbato con vibrato ancho que baja y vuelve a subir) y un ding al terminar
  'ataque-tiempo': () => { ppSilbato(1568, 1046, 0.14, 0, 0.15, 60); ppSilbato(1046, 1760, 0.14, 0.15, 0.15, 60); ppCampana(2093, 0.3, 0.1, 0.15); },
  // pellizco: un «pik» chiquito, una gotita aguda y un tilín
  'ataque-pellizco': () => { ppSilbato(1760, 2637, 0.035, 0, 0.15); ppPlop(2.5, 0.06); ppCampana(3136, 0.1, 0.06, 0.12); },
  // rival: un rayo en zigzag (cuatro silbatos cortos que suben y bajan) que acaba arriba con una campanita
  'ataque-rival': () => { [[1046, 1568], [1568, 1175], [1175, 1760], [1760, 2349]].forEach(([a, b], k) => ppSilbato(a, b, 0.04, k * 0.05, 0.14)); ppCampana(2637, 0.22, 0.1, 0.2); },
});
Object.assign(SFX, PP_SON_ATAQUE);
Object.keys(PP_SON_ATAQUE).forEach(id => { THROTTLE[id] = 60; });

// la música que debe sonar: el bucle la pone en cuanto el audio arranca (el navegador espera al primer toque) y no corta las sintonías
const PP_MUS = { quiere: 'menu' };
function ppMusica(nombre) { PP_MUS.quiere = nombre && TRACKS[nombre] ? nombre : 'menu'; }
function ppMusicaRuta() { ppMusica(PP_P && PP_P.tipo === 'jefe' && PP_PANT.actual === 'sala' ? 'boss' : 'menu'); }
function ppSintonia(nombre) { if (AC && M.bus && TRACKS[nombre]) musicSet(nombre); }
// corta una sintonía si sigue sonando (la de la cortinilla, al pulsar su botón o al salir del nivel)
function ppSintoniaCorta(nombre) { if (AC && M.bus && M.name === nombre) musicSet(null); }
function ppMusicaBucle() {
  if (!AC || !M.bus) return;
  if (M.trk && M.trk.once) return;
  if (ppCortActiva()) return;   // con la cortinilla puesta solo suena su sintonía, una vez; después, silencio hasta el botón (ADR 100)
  if (M.name !== PP_MUS.quiere) musicSet(PP_MUS.quiere);
}
