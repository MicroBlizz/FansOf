// Fans of Pop · SONIDOS: kawaii, que es un juego para niños. Los efectos hechos en Yoshi (snd/*.mp3, preparados con
// herramientas/comfyui/pop/preparar.py) y, mientras no estén, unos de repuesto agudos y burbujeantes con tone de core.
// Cada pop suena un pelín distinto (como el juguete) y además vibra el móvil (ppVibra).
// La música es la de la serie (core/js/serie/canciones.js): la tranquila del menú en la portada, el mapa y las salas,
// la de jefe con el CEO y las sintonías de ganar y perder.
'use strict';
const PP_SND = { buf: {}, pedidos: false };
const PP_ARCHIVOS = ['pop', 'unpop', 'rescate', 'sala', 'dano', 'victoria', 'derrota', 'salto', 'premio', 'combo'];
function ppCargaSonidos() {
  if (PP_SND.pedidos || !AC) return;
  PP_SND.pedidos = true;
  const v = typeof VERSION !== 'undefined' ? VERSION : '0';
  for (const n of PP_ARCHIVOS) {
    fetch('snd/' + n + '.mp3?v=' + v).then(r => (r.ok ? r.arrayBuffer() : Promise.reject())).then(b => AC.decodeAudioData(b)).then(d => { PP_SND.buf[n] = d; }).catch(() => { /* aún no está: suena el de repuesto */ });
  }
}
function ppArchivo(n, vol = 0.7, vel = 1) {
  const b = PP_SND.buf[n]; if (!b || !AC || sonidoApagado()) return false;
  const s = AC.createBufferSource(), g = AC.createGain(); s.buffer = b; s.playbackRate.value = vel; g.gain.value = vol;
  s.connect(g); g.connect(master); s.start();
  return true;
}
function ppVibra(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* sin vibración */ } }
// las notas de la escala pentatónica: suenan siempre bonitas, pulses lo que pulses
const PP_PENTA = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2];
Object.assign(SFX, {
  ppPop: (n = 0) => {
    const vel = PP_PENTA[(n * 7) % PP_PENTA.length];
    if (!ppArchivo('pop', 0.75, 0.9 + vel * 0.12)) { tone(900 * vel, 1500 * vel, 0.06, 'sine', 0.22); tone(1800 * vel, 2400 * vel, 0.04, 'sine', 0.06, 0.02); }
  },
  ppUnpop: (n = 0) => { const vel = PP_PENTA[(n * 3) % PP_PENTA.length]; if (!ppArchivo('unpop', 0.4, 0.95 + vel * 0.08)) tone(500 * vel, 900 * vel, 0.08, 'sine', 0.1); },
  ppRescate: () => { if (!ppArchivo('rescate', 0.7)) [1046, 1318, 1568, 2093].forEach((f, i) => tone(f, f * 1.05, 0.1, 'sine', 0.08, i * 0.06)); },
  ppSala: () => { if (!ppArchivo('sala', 0.7)) [1046, 1318, 1568, 2093].forEach((f, i) => tone(f, f, 0.14, 'triangle', 0.08, i * 0.08)); },
  ppDano: () => { if (!ppArchivo('dano', 0.7)) { tone(880, 520, 0.18, 'sine', 0.12); tone(660, 400, 0.2, 'sine', 0.08, 0.12); } },
  ppVictoria: () => { if (!ppArchivo('victoria', 0.8)) [1046, 1318, 1568, 2093, 1568, 2093, 2637].forEach((f, i) => tone(f, f, 0.16, 'triangle', 0.07, i * 0.09)); },
  ppDerrota: () => { if (!ppArchivo('derrota', 0.7)) tone(900, 300, 0.7, 'sine', 0.1); },
  ppSalto: () => { if (!ppArchivo('salto', 0.7)) { tone(500, 1400, 0.16, 'sine', 0.12); tone(1600, 2000, 0.06, 'sine', 0.05, 0.14); } },
  ppPremio: () => { if (!ppArchivo('premio', 0.7)) [2093, 2637, 3136].forEach((f, i) => tone(f, f, 0.12, 'sine', 0.06, i * 0.05)); },
  ppCombo: (n = 2) => { const b = PP_PENTA[Math.min(PP_PENTA.length - 1, n - 2)]; if (!ppArchivo('combo', 0.55, 0.9 + (n - 2) * 0.06)) [0, 1, 2].forEach(i => tone(1046 * b * PP_PENTA[i * 2], 1046 * b * PP_PENTA[i * 2] * 1.02, 0.07, 'sine', 0.07, i * 0.045)); },
  ppPista: () => { tone(1568, 2093, 0.08, 'sine', 0.06); tone(2093, 2637, 0.1, 'sine', 0.05, 0.08); },
  ppCura: () => [1046, 1318, 1568].forEach((f, i) => tone(f, f, 0.1, 'sine', 0.06, i * 0.05)),
  ppNodo: () => { tone(1200, 1600, 0.06, 'sine', 0.08); },
});
Object.assign(THROTTLE, { ppPop: 25, ppUnpop: 25, ppCombo: 60 });

// la música que debe sonar: el bucle la pone en cuanto el audio arranca (el navegador espera al primer toque) y no corta las sintonías
const PP_MUS = { quiere: 'menu' };
function ppMusica(nombre) { PP_MUS.quiere = nombre && TRACKS[nombre] ? nombre : 'menu'; }
function ppMusicaRuta() { ppMusica(PP_P && PP_P.tipo === 'jefe' && PP_PANT.actual === 'sala' ? 'boss' : 'menu'); }
function ppSintonia(nombre) { if (AC && M.bus && TRACKS[nombre]) musicSet(nombre); }
function ppMusicaBucle() {
  if (!AC || !M.bus) return;
  ppCargaSonidos();
  if (M.trk && M.trk.once) return;
  if (M.name !== PP_MUS.quiere) musicSet(PP_MUS.quiere);
}
