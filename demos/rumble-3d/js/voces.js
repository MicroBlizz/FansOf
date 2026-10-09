// Boceto 3D de Fans of Rumble · Sonido hecho con código (sin archivos de audio): golpes, saltos, disparos, explosiones
// y las voces de las unidades. Hay tres modos: «inventada» (un idioma de mentira, como los Sims), «del móvil» (la voz
// que trae el teléfono, leyendo la frase de verdad) y «sin voz».
'use strict';
import { tr, IDIOMA } from './textos.js';

let ac = null, salida = null, ruido = null;
export const VOZ = { modo: 'inventada' };   // 'inventada' | 'movil' | 'nada'

// el navegador solo deja sonar después de un toque del jugador: se llama desde ese toque
export function despertarAudio() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    salida = ac.createGain(); salida.gain.value = 0.6;
    const comp = ac.createDynamicsCompressor();
    salida.connect(comp); comp.connect(ac.destination);
    ruido = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = ruido.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ac.state === 'suspended') ac.resume();
}

// no repetir el mismo efecto demasiado seguido (con 30 muñecos pegando a la vez sería un ruido continuo)
const ultimo = {};
function toca(nombre, cada) {
  if (!ac || ac.state !== 'running') return false;
  const t = ac.currentTime;
  if (ultimo[nombre] && t - ultimo[nombre] < cada) return false;
  ultimo[nombre] = t; return true;
}

function ruidoFiltrado(t, dur, tipo, f0, f1, vol, q = 1) {
  const s = ac.createBufferSource(); s.buffer = ruido;
  s.playbackRate.value = 0.8 + Math.random() * 0.4;
  const f = ac.createBiquadFilter(); f.type = tipo; f.Q.value = q;
  f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(salida);
  s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
}

function tono(t, dur, onda, f0, f1, vol) {
  const o = ac.createOscillator(); o.type = onda;
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(salida); o.start(t); o.stop(t + dur + 0.05);
}

export const SFX = {
  golpe(fuerte = false) {
    if (!toca(fuerte ? 'golpeF' : 'golpe', 0.07)) return;
    const t = ac.currentTime;
    tono(t, 0.12, 'sine', fuerte ? 140 : 190, 60, fuerte ? 0.5 : 0.32);
    ruidoFiltrado(t, 0.08, 'bandpass', 2400, 900, fuerte ? 0.35 : 0.22, 1.2);
  },
  zas() {
    if (!toca('zas', 0.09)) return;
    ruidoFiltrado(ac.currentTime, 0.16, 'bandpass', 600, 2600, 0.12, 2);
  },
  aterriza(grande = false) {
    if (!toca('aterriza', 0.06)) return;
    const t = ac.currentTime;
    tono(t, grande ? 0.35 : 0.18, 'sine', grande ? 110 : 160, 45, grande ? 0.6 : 0.3);
    ruidoFiltrado(t, grande ? 0.3 : 0.14, 'lowpass', 900, 120, grande ? 0.4 : 0.2);
  },
  cae() {   // el silbido mientras baja del cielo
    if (!toca('cae', 0.12)) return;
    tono(ac.currentTime, 0.32, 'triangle', 1400, 500, 0.06);
  },
  disparo(enemigo) {
    if (!toca('disparo', 0.1)) return;
    const t = ac.currentTime;
    if (enemigo) tono(t, 0.16, 'square', 880, 330, 0.07);
    else { tono(t, 0.1, 'triangle', 420, 260, 0.12); ruidoFiltrado(t, 0.05, 'highpass', 3000, 2000, 0.08); }
  },
  explosion(grande = false) {
    if (!toca(grande ? 'boomG' : 'boom', 0.15)) return;
    const t = ac.currentTime;
    tono(t, grande ? 0.9 : 0.45, 'sine', grande ? 90 : 130, 30, grande ? 0.9 : 0.55);
    ruidoFiltrado(t, grande ? 1.2 : 0.55, 'lowpass', grande ? 2600 : 3000, 80, grande ? 0.8 : 0.5);
  },
  puf() {
    if (!toca('puf', 0.08)) return;
    ruidoFiltrado(ac.currentTime, 0.22, 'bandpass', 1800, 500, 0.16, 1.5);
  },
  salto() {
    if (!toca('salto', 0.2)) return;
    tono(ac.currentTime, 0.4, 'triangle', 220, 900, 0.14);
  },
};

/* ---------- las voces ---------- */
// cómo suena cada uno con la voz inventada: tono base (Hz), cuánto sube y baja, lo rápido que habla y el tipo de onda
const PERFIL = {
  bunny:    { f0: 300, salto: 0.55, silaba: 0.085, onda: 'sawtooth', loco: true },
  squirrel: { f0: 540, salto: 0.35, silaba: 0.058, onda: 'sawtooth' },
  becario:  { f0: 132, salto: 0.08, silaba: 0.125, onda: 'square', cansado: true },
};
// las dos «formantes» de cada vocal: lo que hace que una «a» suene a «a» y no a «i»
const VOCAL = { a: [800, 1200], e: [480, 1900], i: [300, 2400], o: [500, 880], u: [330, 760] };
// con la voz del móvil: lo agudo y lo rápido que habla cada uno
const MOVIL = { bunny: [1.45, 1.15], squirrel: [2, 1.4], becario: [0.25, 0.78] };

let vozMovil = null;
function elegirVozMovil() {
  if (!('speechSynthesis' in window)) return null;
  const lista = speechSynthesis.getVoices();
  const pre = IDIOMA === 'es' ? 'es' : 'en';
  return lista.find(v => v.lang && v.lang.toLowerCase().startsWith(pre)) || null;
}
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => { vozMovil = elegirVozMovil(); };

// dice la frase (ya en español: se traduce aquí). Devuelve cuánto dura, para el bocadillo; alHablar(i) se llama en cada sílaba
export function hablar(frase, quien, alHablar) {
  const texto = tr(frase);
  const silabas = (texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[^aeiou]*[aeiou]+/g) || ['a']).slice(0, 12);
  const p = PERFIL[quien] || PERFIL.bunny;
  const duracion = Math.max(1.1, silabas.length * p.silaba * 1.2 + 0.6);
  if (VOZ.modo === 'nada') return duracion;
  if (VOZ.modo === 'movil' && 'speechSynthesis' in window) {
    try {
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = IDIOMA === 'es' ? 'es-ES' : 'en-US';
      vozMovil = vozMovil || elegirVozMovil();
      if (vozMovil) u.voice = vozMovil;
      const [tonoV, velV] = MOVIL[quien] || [1, 1];
      u.pitch = tonoV; u.rate = velV; u.volume = 1;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch (e) { /* sin voz del móvil */ }
    return Math.max(duracion, texto.length * 0.07);
  }
  if (!ac || ac.state !== 'running') return duracion;
  const grita = texto.includes('!'), cansado = p.cansado || texto.includes('…');
  let t = ac.currentTime + 0.02;
  silabas.forEach((s, i) => {
    const v = VOCAL[s[s.length - 1]] || VOCAL.a;
    const dur = p.silaba * (0.8 + Math.random() * 0.5) * (s.length > 3 ? 1.3 : 1);
    let f = p.f0 * Math.pow(2, (Math.random() * 2 - 1) * p.salto);
    if (p.loco && Math.random() < 0.18) f *= 2;                                         // CrazyBunny se dispara de vez en cuando
    if (grita) f *= 1 + (i / silabas.length) * 0.35;                                    // gritando, acaba más agudo
    if (cansado) f *= 1 - (i / silabas.length) * 0.22;                                  // el becario se va apagando
    silaba(t, dur, f, v, p.onda, /^[^aeiou]/.test(s));
    if (alHablar) setTimeout(() => alHablar(i), (t - ac.currentTime) * 1000);
    t += dur + 0.018;
  });
  return Math.max(duracion, t - ac.currentTime + 0.5);
}

function silaba(t, dur, f, [f1, f2], onda, consonante) {
  const o = ac.createOscillator(); o.type = onda;
  o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * 0.92, t + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.012); g.gain.setValueAtTime(0.5, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  const a = ac.createBiquadFilter(); a.type = 'bandpass'; a.frequency.value = f1; a.Q.value = 5;
  const b = ac.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = f2; b.Q.value = 7;
  const mezcla = ac.createGain(); mezcla.gain.value = 0.9;
  o.connect(a); o.connect(b); a.connect(mezcla); b.connect(mezcla); mezcla.connect(g); g.connect(salida);
  o.start(t); o.stop(t + dur + 0.03);
  if (consonante) ruidoFiltrado(t, 0.025, 'highpass', 3500, 2500, 0.08);
}
