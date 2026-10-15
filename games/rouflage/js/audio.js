// Fans of Rouflage · SONIDO: usa el motor de sonido de la serie (core/js/sistema/sonido.js; todo se crea con código, sin archivos, y
// aquí no se cambia). Este archivo pone lo que ese motor pide a cada juego (los volúmenes), los efectos propios de este juego, los
// que suenan desde un sitio del mapa (más flojo cuanto más lejos y por el altavoz del lado donde pasa) y la bajada de la música en
// los momentos gordos. Las canciones están en musica.js.
'use strict';

// volúmenes de 0 a 1 (efectos y música por separado); se guardan en el navegador. `mudo`/`sinMusica` quedan por si algo viejo los mira.
const AUDIO = { vol: 1, volMus: 1, get mudo() { return this.vol === 0; }, get sinMusica() { return this.volMus === 0; } };
try {
  const v = localStorage.getItem('rouflage-vol'), m = localStorage.getItem('rouflage-vol-musica');
  AUDIO.vol = v === null ? (localStorage.getItem('rouflage-mudo') === '1' ? 0 : 1) : limita(+v, 0, 1);
  AUDIO.volMus = m === null ? (localStorage.getItem('rouflage-sin-musica') === '1' ? 0 : 1) : limita(+m, 0, 1);
} catch (_) { /* sin guardar */ }
// PARA COMPARAR (temporal, alfa): con `viejo` suenan la música y los efectos de antes (los prestados del Rumble); se quita al decidir
try { AUDIO.viejo = localStorage.getItem('rouflage-sonido-viejo') === '1'; } catch (_) { AUDIO.viejo = false; }
function cambiaSonidoViejo() {
  AUDIO.viejo = !AUDIO.viejo; try { localStorage.setItem('rouflage-sonido-viejo', AUDIO.viejo ? '1' : '0'); } catch (_) { /* sin guardar */ }
  audioInit(); if (typeof MUSICA_PEDIDA !== 'undefined' && MUSICA_PEDIDA) musica(MUSICA_PEDIDA); play('select');
}
const sonidoApagado = () => AUDIO.vol === 0;
const volGeneral = () => AUDIO.vol * 0.55;
const volMusica = () => AUDIO.volMus * 0.5;
function guardaVolumen() { try { localStorage.setItem('rouflage-vol', String(AUDIO.vol)); localStorage.setItem('rouflage-vol-musica', String(AUDIO.volMus)); } catch (_) { /* sin guardar */ } }
// las barras del menú: `que` es 'vol' o 'volMus', `v` de 0 a 1
function ponVolumen(que, v) {
  AUDIO[que] = limita(Math.round(v * 20) / 20, 0, 1); guardaVolumen(); audioInit();
  if (AC && M.bus) M.bus.gain.cancelScheduledValues(AC.currentTime);      // por si la música estaba agachada
  applyVolume();
  if (que === 'vol' && AUDIO.vol > 0) play('select');
}
// el botón del icono: silencia o recupera el último volumen que tenía
const _ultimoVol = { vol: 1, volMus: 1 };
function cambiaSonido() { if (AUDIO.vol > 0) { _ultimoVol.vol = AUDIO.vol; ponVolumen('vol', 0); } else ponVolumen('vol', _ultimoVol.vol || 1); }
function cambiaMusica() { if (AUDIO.volMus > 0) { _ultimoVol.volMus = AUDIO.volMus; ponVolumen('volMus', 0); } else ponVolumen('volMus', _ultimoVol.volMus || 1); }

/* ---------- sonidos con sitio: más flojo cuanto más lejos del centro de la pantalla y por el lado donde pasa ---------- */
const PAN = { nodos: {} };
// un altavoz para cada lado (cinco posiciones bastan); se crean cuando el audio ya existe
function panDe(p) {
  if (!AC) return master;
  const k = Math.round(limita(p, -1, 1) * 2);
  if (!PAN.nodos[k]) { try { const n = AC.createStereoPanner(); n.pan.value = k / 2; n.connect(master); PAN.nodos[k] = n; } catch (_) { PAN.nodos[k] = master; } }
  return PAN.nodos[k];
}
// como tone() y noise() de core, pero hacia el altavoz de un lado (`out`)
function tonoEn(out, f0, f1, dur, type = 'sine', vol = 0.3, delay = 0) {
  if (!AC) return; const t = AC.currentTime + delay; const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.05);
}
function ruidoEn(out, dur, vol, freq = 1200, ftype = 'lowpass', delay = 0) {
  if (!AC) return; const t = AC.currentTime + delay; const s = AC.createBufferSource(); s.buffer = noiseBuf;
  const f = AC.createBiquadFilter(); f.type = ftype; f.frequency.value = freq; const g = AC.createGain();
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t + dur + 0.05);
}
// toca un efecto desde un punto del mundo: `SFX[nombre](volumen, altavoz)`; si queda lejos, no suena
function suenaEn(nombre, x, y, v = 1) {
  const d = typeof volumenEn === 'function' ? volumenEn(x, y) : 1; if (d < 0.05) return;
  play(nombre, v * d, panDe((x - CAM.x) / 420));
}

// efectos propios: pintar, coger un color, congelarse, silbar, pasos, la linterna, la persiana, el sello de despido y los poderes
Object.assign(SFX, {
  pincel: () => noise(0.09, 0.045, 2600, 'bandpass'),
  gota: () => { tone(880, 1500, 0.07, 'sine', 0.09); tone(1500, 1900, 0.06, 'sine', 0.05, 0.06); },
  cubo: () => { noise(0.22, 0.12, 900); tone(300, 160, 0.2, 'sine', 0.1); },
  congela: () => { [1318, 1568, 2093].forEach((f, i) => tone(f, f, 0.16, 'sine', 0.07, i * 0.05)); noise(0.2, 0.05, 6000, 'highpass'); },
  descongela: () => { noise(0.12, 0.08, 3600, 'highpass'); [1568, 1318, 988].forEach((f, i) => tone(f, f * 0.9, 0.09, 'sine', 0.05, i * 0.045)); },
  silbido: (v = 1, out = master) => { tonoEn(out, 1500, 2300, 0.16, 'sine', 0.13 * v); tonoEn(out, 2300, 1700, 0.22, 'sine', 0.12 * v, 0.17); },
  disparo: (v = 1, out = master) => { ruidoEn(out, 0.08, 0.22 * v, 1800, 'bandpass'); tonoEn(out, 520, 150, 0.14, 'square', 0.07 * v); },
  // un becario anda: zapato de oficina sobre moqueta
  paso: (v = 1, out = master) => { ruidoEn(out, 0.06, 0.09 * v, 380 + Math.random() * 120); tonoEn(out, 150 + Math.random() * 30, 70, 0.05, 'sine', 0.06 * v); },
  // la linterna barre la sala
  linterna: (v = 1, out = master) => ruidoEn(out, 0.32, 0.05 * v, 900, 'bandpass'),
  luces: () => { tone(420, 60, 0.7, 'sawtooth', 0.07); noise(0.5, 0.08, 500); },
  // la persiana de Recursos Humanos sube, se apagan las luces y suena la bocina: empieza la caza
  comienzaCaza: () => { noise(0.55, 0.18, 700, 'lowpass'); tone(90, 240, 0.5, 'sawtooth', 0.05); noise(0.08, 0.2, 2000, 'bandpass', 0.55); tone(420, 60, 0.7, 'sawtooth', 0.07, 0.7); noise(0.5, 0.08, 500, 'lowpass', 0.7); tone(880, 1320, 0.3, 'square', 0.1, 1.15); agachaMusica(1.6); },
  // «¡te he visto!»: dos notas de susto, de dibujo animado
  visto: () => { tone(420, 520, 0.14, 'sawtooth', 0.08); tone(620, 760, 0.3, 'sawtooth', 0.08, 0.15); agachaMusica(0.6); },
  // la cuenta atrás: 3, 2, 1 cada vez más agudo
  cuenta: (d = 1) => tone(520 + (3 - d) * 160, 520 + (3 - d) * 160, 0.12, 'square', 0.09),
  // el sello de DESPEDIDO: golpe de tampón, chirrido y papel
  sello: (v = 1, out = master) => { ruidoEn(out, 0.18, 0.35 * v, 500); tonoEn(out, 130, 50, 0.22, 'sine', 0.3 * v); tonoEn(out, 1800, 2400, 0.08, 'square', 0.04 * v, 0.12); ruidoEn(out, 0.14, 0.1 * v, 3500, 'highpass', 0.2); agachaMusica(0.9); },
  // despido improcedente: la pintura salpica un mueble
  salpica: () => { noise(0.14, 0.16, 1200, 'bandpass'); tone(300, 110, 0.14, 'sine', 0.08); tone(900, 400, 0.09, 'triangle', 0.04, 0.05); },
  // la granada de humo: pum y el siseo del humo
  humo: () => { tone(220, 60, 0.18, 'sine', 0.22); noise(0.12, 0.2, 1500, 'bandpass'); noise(1.1, 0.08, 2200, 'highpass', 0.12); },
  // prácticas: diana (campanita) al acertar a un camaleón de entrenamiento
  diana: () => { tone(1760, 1760, 0.12, 'sine', 0.09); tone(2637, 2637, 0.18, 'sine', 0.06, 0.06); },
  // los poderes del fantasma: apagón (clic y la pila que se muere), mano fría (escalofrío)
  apagon: () => { noise(0.04, 0.14, 3000, 'highpass'); tone(600, 40, 0.5, 'sawtooth', 0.06, 0.05); },
  manoFria: () => { for (let i = 0; i < 6; i++) tone(1100 + (i % 2) * 180, 1000, 0.06, 'triangle', 0.05, i * 0.06); noise(0.4, 0.05, 5000, 'highpass'); },
  // la recta final: bocina y la música que cambia
  recta: () => { tone(330, 330, 0.25, 'sawtooth', 0.07); tone(440, 440, 0.3, 'sawtooth', 0.06, 0.05); tone(660, 660, 0.35, 'sawtooth', 0.06, 0.1); agachaMusica(0.8); },
  latido: (v = 1) => { tone(72, 46, 0.12, 'sine', 0.34 * v); tone(64, 42, 0.12, 'sine', 0.24 * v, 0.17); },
});
Object.assign(THROTTLE, { pincel: 70, silbido: 110, disparo: 80, latido: 280, paso: 90, linterna: 700, visto: 2500, sello: 150 });
// PARA COMPARAR (temporal): con el sonido viejo, cada efecto nuevo suena como sonaba antes (o no suena, si antes no había nada)
const FX_VIEJO = { paso: [], linterna: [], visto: [], comienzaCaza: ['go', 'luces'], cuenta: ['tick'], sello: ['despido', 'slam'], salpica: ['clank'], humo: ['luces', ['disparo', 0.8]], diana: ['pop'], apagon: ['luces'], manoFria: ['pop'], descongela: ['pop'], recta: ['horn'] };
const _playNuevo = play;
play = (n, ...a) => {
  if (!AUDIO.viejo) return _playNuevo(n, ...a);
  if (n in FX_VIEJO) { for (const v of FX_VIEJO[n]) Array.isArray(v) ? _playNuevo(...v) : _playNuevo(v); return; }
  return _playNuevo(n, typeof a[0] === 'number' ? a[0] : 1);      // sin altavoz de lado
};

// la música baja un momento para que un efecto gordo se oiga bien, y vuelve sola
function agachaMusica(seg = 0.8) {
  if (!AC || !M.bus || volMusica() === 0) return;
  const g = M.bus.gain, t = AC.currentTime;
  if (AUDIO.viejo) return;
  g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(volMusica() * 0.3, t + 0.06); g.setTargetAtTime(volMusica(), t + seg, 0.25);
}
