// Fans of Pop · SONIDOS: kawaii, que es un juego para niños. Los efectos hechos en Yoshi (snd/*.mp3, preparados con
// herramientas/comfyui/pop/preparar.py) y, mientras no estén, unos de repuesto agudos y burbujeantes con tone de core.
// Cada pop suena un pelín distinto (como el juguete) y además vibra el móvil (ppVibra).
// La música es la de la serie (core/js/serie/canciones.js): la tranquila del menú en la portada, el mapa y las salas,
// la de jefe con el CEO y las sintonías de ganar y perder.
'use strict';
const PP_SND = { buf: {}, pedidos: false };
const PP_ARCHIVOS = ['rescate', 'sala', 'dano', 'victoria', 'derrota', 'salto', 'premio', 'combo'];
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
// EL PLOP (hecho a mano, no con Yoshi: la IA no sabe hacer sonidos tan cortos). Una gotita kawaii: un tono que SUBE muy rápido
// y se apaga en menos de una décima (como una burbuja de agua), un clic suave delante (la «p») y un brillito agudo encima.
function ppPlop(nota = 1) {
  if (!AC || sonidoApagado()) return;
  const t = AC.currentTime + 0.005, f = 520 * nota, out = AC.createGain(); out.gain.value = 0.9; out.connect(master);
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
Object.assign(SFX, {
  ppPop: (n = 0) => ppPlop(PP_PENTA[(n * 7) % PP_PENTA.length]),
  ppUnpop: (n = 0) => ppBoing(PP_PENTA[(n * 3) % PP_PENTA.length]),
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
