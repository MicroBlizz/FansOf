// Boceto 3D de Fans of Rumble · La música: las MISMAS canciones del juego (core/js/serie/canciones.js, que la página carga
// antes que este archivo y deja en TRACKS) tocadas con una copia pequeña del motor de core/js/sistema/sonido.js.
// Aquí se usan la de los Animales (partida), la de SurvivalBot (boss0), la del menú y las de ganar y perder.
'use strict';
import { audio } from './voces.js';

const M = { trk: null, out: null, bus: null, paso: 0, compas: 0, sig: 0, reloj: null, volumen: 0.38, on: true };
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
const elige = l => l[(Math.random() * l.length) | 0];
function grado(T, d) { const n = T.sc.length, o = Math.floor(d / n); return T.tonic + T.sc[d - o * n] + 12 * o; }

function nota(ac, out, f, t, dur, tipo, vol, o = {}) {
  const osc = ac.createOscillator(), g = ac.createGain(); osc.type = tipo; osc.frequency.value = f;
  const a = o.att || 0.01, r = o.rel || 0.08, fin = t + dur, tA = Math.min(t + a, fin);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, tA);
  if (o.dec) { const tD = Math.min(tA + o.dec, fin); if (tD > tA) g.gain.exponentialRampToValueAtTime(Math.max(0.0001, vol * Math.pow(o.sus == null ? 0.3 : o.sus, (tD - tA) / o.dec)), tD); }
  g.gain.exponentialRampToValueAtTime(0.0001, fin + r);
  let n = osc;
  if (o.lp) { const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; osc.connect(fl); n = fl; }
  n.connect(g); g.connect(out); osc.start(t); osc.stop(fin + r + 0.05);
}
function ruido(ac, buf, out, t, dur, vol, f, tipo = 'bandpass') {
  const s = ac.createBufferSource(); s.buffer = buf; const fl = ac.createBiquadFilter(); fl.type = tipo; fl.frequency.value = f; const g = ac.createGain();
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(fl); fl.connect(g); g.connect(out); s.start(t, Math.random() * 0.08); s.stop(t + dur + 0.02);
}
function bombo(ac, out, t, v, f0 = 165, f1 = 48, d = 0.22) {
  const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d * 0.6);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.9 * v, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(out); o.start(t); o.stop(t + d + 0.04);
}
const BATERIA = {
  k: (A, o, t, v) => bombo(A.ac, o, t, v),
  s: (A, o, t, v) => { ruido(A.ac, A.ruido, o, t, 0.13, 0.5 * v, 1900); nota(A.ac, o, 190, t, 0.07, 'triangle', 0.3 * v, { rel: 0.05 }); },
  c: (A, o, t, v) => { [0, 0.012, 0.024].forEach(d => ruido(A.ac, A.ruido, o, t + d, 0.05, 0.3 * v, 1500)); ruido(A.ac, A.ruido, o, t + 0.036, 0.16, 0.35 * v, 1300); },
  h: (A, o, t, v) => ruido(A.ac, A.ruido, o, t, 0.04, 0.16 * v, 7500, 'highpass'),
  o: (A, o, t, v) => ruido(A.ac, A.ruido, o, t, 0.2, 0.16 * v, 7000, 'highpass'),
  t: (A, o, t, v) => bombo(A.ac, o, t, v * 0.6, 190, 95, 0.35),
  X: (A, o, t, v) => ruido(A.ac, A.ruido, o, t, 0.9, 0.3 * v, 4500, 'highpass'),
};

// un paso (semicorchea) de la canción: igual que musicStep del juego, sin la paradoja de Shepard ni las prisas
function paso(A, T, out, p, compas, vuelta, t, sd) {
  const bi = compas % T.prog.length, d = T.prog[bi], cancion = !T.once, sec = cancion ? vuelta % 4 : 0, impar = cancion ? sec === 1 : vuelta % 2 === 1;
  const sube = cancion && Math.floor(vuelta / 4) % 2 === 1 ? (T.mod == null ? 2 : T.mod) : 0, f = g => hz(grado(T, g) + sube);
  const ultimo = bi === T.prog.length - 1, n7 = T.sc.length, tonos = [d, d + 2, d + 4, d + n7];
  if (p === 0) {
    if (T.pad) { const vs = T.seven ? [d, d + 2, d + 4, d + 6] : [d, d + 2, d + 4]; vs.forEach(x => nota(A.ac, out, f(x), t, sd * 16 * 0.98, T.pad.wave, T.pad.vol / vs.length * (sec === 3 ? 2 : 1.6), { att: T.pad.att, rel: 0.3, lp: T.pad.lp })); }
    if (T.crash && bi === 0) BATERIA.X(A, out, t, 1);
  }
  for (const ev of T.B) if (ev.s === p) {
    const sh = T.bass.oct == null ? -n7 : T.bass.oct, g = ev.v === 'r' ? d + sh : ev.v === 'f' ? d + 4 + sh : ev.v === 'o' ? d + sh + n7 : d + sh - n7;
    nota(A.ac, out, f(g), t, ev.n * sd * 0.92, T.bass.wave, T.bass.vol, { att: 0.012, rel: 0.06, lp: T.bass.lp });
  }
  if (T.drums) {
    const dv = T.dv || 1, corte = sec === 3 && bi < 2;
    for (const k in T.drums) if (T.drums[k][p] === 'x' && !(corte && (k === 'k' || k === 's' || k === 'c'))) BATERIA[k](A, out, t, dv);
    if (cancion && sec === 3 && ultimo && p >= 12 && T.drums.k) BATERIA.s(A, out, t, dv * (0.55 + (p - 12) * 0.15));
  }
  if (T.A && T.A[p] !== '.') nota(A.ac, out, f(tonos[+T.A[p]] + (T.arp.oct || 0)), t, sd * T.arp.gate, T.arp.wave, T.arp.vol, { att: 0.005, rel: 0.05, lp: T.arp.lp });
  const L = T.lead, resp = sec === 2 && bi % 2 === 1, frase = T.L[(resp ? bi + 2 : bi) % T.L.length];
  for (const ev of frase) if (ev.s === p) {
    if (sec === 3 && ev.s % 4 !== 0) continue;
    let v = ev.v === '?' ? elige([0, 1, 2, 4, 5, 7, 8, 9]) : ev.v;
    if (resp) v = 8 - v;
    const g = v + (L.oct || 0) + (impar ? (L.up || 0) : 0), dur = Math.max(ev.n * sd * (L.gate || 0.9) * (sec === 3 ? 2 : 1), L.min || 0), fr = f(g);
    if (L.bell) { nota(A.ac, out, fr, t, dur, 'sine', L.vol, { att: 0.004, rel: 0.4, dec: dur * 0.9, sus: 0.05 }); nota(A.ac, out, fr * 2.01, t, dur * 0.4, 'sine', L.vol * 0.3, { att: 0.002, rel: 0.2, dec: 0.2, sus: 0.05 }); }
    else nota(A.ac, out, fr, t, dur, L.wave, L.vol, { att: L.att || 0.012, rel: 0.07, lp: L.lp });
    if (sec === 1) nota(A.ac, out, f(g + 2), t, dur, L.bell ? 'sine' : L.wave, L.vol * 0.38, { att: L.att || 0.012, rel: 0.07, lp: L.lp });
  }
}

function bombear() {
  const A = audio();
  if (!A || !M.trk || !M.on || document.hidden) { if (A) M.sig = Math.max(M.sig, A.ac.currentTime + 0.05); return; }
  const T = M.trk, ahora = A.ac.currentTime;
  if (M.sig < ahora - 0.1) M.sig = ahora + 0.03;
  while (M.sig < ahora + 0.3 && M.trk === T) {
    const sd = 60 / T.bpm / 4, vuelta = Math.floor(M.compas / T.prog.length);
    paso(A, T, M.out, M.paso, M.compas, vuelta, M.sig + (M.paso % 2 === 1 ? (T.swing || 0) * sd : 0), sd);
    M.sig += sd; M.paso++;
    if (M.paso >= 16) { M.paso = 0; M.compas++; if (T.once && M.compas >= T.prog.length) { poner(T.despues || null, M.sig + 0.6); return; } }
  }
}

// cambia de canción (con un fundido corto). nombre = una de TRACKS, o null para callar
export function poner(nombre, cuando, despues) {
  const A = audio();
  if (typeof TRACKS === 'undefined' || !A) { M.pendiente = nombre; return; }
  if (!M.bus) { M.bus = A.ac.createGain(); M.bus.gain.value = M.on ? M.volumen : 0; M.bus.connect(A.salida); M.reloj = setInterval(bombear, 40); }
  const ahora = A.ac.currentTime, t0 = Math.max(ahora + 0.03, cuando || 0), viejo = M.out;
  if (viejo) { viejo.gain.setTargetAtTime(0, Math.max(ahora, cuando || ahora), 0.15); setTimeout(() => { try { viejo.disconnect(); } catch (e) { /* ya estaba */ } }, Math.max(0, t0 - ahora) * 1000 + 2500); }
  M.trk = nombre ? TRACKS[nombre] : null; M.out = null;
  if (!M.trk) return;
  if (despues !== undefined) M.trk = { ...M.trk, despues };
  M.out = A.ac.createGain(); M.out.gain.setValueAtTime(0.0001, t0); M.out.gain.linearRampToValueAtTime(1, t0 + (M.trk.once ? 0.02 : 0.6)); M.out.connect(M.bus);
  M.paso = 0; M.compas = 0; M.sig = t0 + 0.02;
}
// la que se pidió antes de que el jugador tocara la pantalla (el navegador no deja sonar hasta entonces)
export function arrancarPendiente() { if (M.pendiente !== undefined) { const n = M.pendiente; M.pendiente = undefined; poner(n); } }
export function musicaOn(si) { M.on = si; if (M.bus) M.bus.gain.value = si ? M.volumen : 0; }
// más bajita mientras alguien habla, para que se entienda
export function agachar(si) { if (M.bus && M.on) M.bus.gain.setTargetAtTime(si ? M.volumen * 0.45 : M.volumen, audio().ac.currentTime, 0.1); }
