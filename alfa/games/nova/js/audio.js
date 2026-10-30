// Fans of Nova · SONIDO: ajustes de volumen, efectos propios y qué canción suena en cada momento. Usa el motor de core (core/js/sistema/sonido.js):
// todo se crea con código. Las canciones están en musica.js. Muchos disparos por segundo: cada efecto tiene su pausa mínima (THROTTLE),
// hay un tope de sonidos por décima de segundo y los enemigos fuera de pantalla no suenan.
'use strict';
const NV_SON_CLAVE = 'fonova-sonido';
const NV_SON = (() => {   // la música empieza al 50 % (lo guardado manda)
  let s = null; try { s = JSON.parse(localStorage.getItem(NV_SON_CLAVE) || 'null'); } catch (e) { s = null; }
  return Object.assign({ mudo: false, vol: 0.8, mus: 0.5 }, s || {});
})();
function nvSonGuarda() { try { localStorage.setItem(NV_SON_CLAVE, JSON.stringify(NV_SON)); } catch (e) { /* sin almacenamiento: vale hasta cerrar la pestaña */ } applyVolume(); }
function sonidoApagado() { return NV_SON.mudo; }
function volGeneral() { return NV_SON.mudo ? 0 : 0.55 * NV_SON.vol; }
function volMusica() { return 0.7 * NV_SON.mus; }

Object.assign(SFX, {
  nvLaser: (v = 1) => tone(1900, 420, 0.1, 'sawtooth', 0.03 * v),
  nvRail: (v = 1) => { tone(520, 70, 0.26, 'sawtooth', 0.07 * v); noise(0.08, 0.12 * v, 1800, 'bandpass'); },
  nvFlak: (v = 1) => { noise(0.09, 0.1 * v, 2400, 'bandpass'); tone(240, 90, 0.08, 'square', 0.04 * v); },
  nvMisil: (v = 1) => { noise(0.28, 0.1 * v, 1500, 'bandpass'); tone(260, 800, 0.24, 'sawtooth', 0.035 * v); },
  nvDron: (v = 1) => tone(1300, 1700, 0.05, 'sine', 0.035 * v),
  nvLaserE: (v = 1) => tone(900, 240, 0.12, 'square', 0.03 * v),
  nvDisparoE: (v = 1) => { noise(0.06, 0.07 * v, 1500, 'bandpass'); tone(420, 160, 0.07, 'triangle', 0.04 * v); },
  nvImpacto: (v = 1) => noise(0.05, 0.08 * v, 2800, 'bandpass'),
  nvGolpeNave: () => { noise(0.18, 0.25, 700); tone(130, 55, 0.2, 'sawtooth', 0.14); },
  nvEstalla: (v = 1) => { noise(0.22, 0.2 * v, 900); tone(140, 50, 0.2, 'sine', 0.2 * v); },
  nvBoom: (v = 1) => { noise(0.35, 0.25 * v, 800); tone(110, 42, 0.3, 'sine', 0.25 * v); },
  nvBoomGrande: () => { noise(0.9, 0.5, 560); tone(90, 32, 0.7, 'sine', 0.45); noise(0.5, 0.25, 2200, 'bandpass', 0.18); },
  nvChatarra: () => tone(1400, 1900, 0.05, 'triangle', 0.035),
  nvSalto: () => { noise(0.7, 0.14, 500, 'bandpass'); tone(120, 900, 0.6, 'sawtooth', 0.05); tone(900, 200, 0.3, 'sine', 0.05, 0.55); },
  nvJefeLlega: () => { tone(110, 110, 0.9, 'sawtooth', 0.12); tone(165, 150, 0.9, 'sawtooth', 0.09, 0.05); noise(0.9, 0.12, 400); },
  nvRango: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, f, 0.14, 'triangle', 0.08, i * 0.07)),
  nvEvolucion: () => { [392, 523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, f, 0.2, 'triangle', 0.09, i * 0.09)); noise(0.6, 0.12, 3000, 'highpass', 0.2); },
  nvCartas: () => { noise(0.2, 0.06, 5000, 'highpass'); tone(660, 1320, 0.2, 'sine', 0.06); tone(990, 1760, 0.2, 'sine', 0.05, 0.1); },
  nvElige: () => { tone(880, 1320, 0.1, 'triangle', 0.08); tone(1320, 1760, 0.12, 'triangle', 0.07, 0.07); },
  nvEstacion: () => { tone(300, 180, 0.35, 'sine', 0.12); noise(0.3, 0.1, 600); tone(660, 660, 0.12, 'triangle', 0.06, 0.3); tone(880, 880, 0.2, 'triangle', 0.06, 0.4); },
});
Object.assign(THROTTLE, { nvLaser: 90, nvRail: 90, nvFlak: 110, nvMisil: 140, nvDron: 120, nvLaserE: 110, nvDisparoE: 110, nvImpacto: 55, nvGolpeNave: 160, nvEstalla: 90, nvBoom: 60, nvChatarra: 90, nvSalto: 300 });

// Todos los efectos de la partida pasan por aquí: tope de sonidos por décima de segundo y volumen según lo cerca que esté (x, y: dónde suena).
let nvSonCuenta = 0, nvSonVentana = 0;
function nvSnd(nombre, S, x, y, v) {
  const t = performance.now(); if (t - nvSonVentana > 100) { nvSonVentana = t; nvSonCuenta = 0; }
  if (nvSonCuenta >= 6) return; nvSonCuenta++;
  if (S && x !== undefined) { if (!nvVisible(S, x, y, 80)) return; const k = Math.hypot(x - S.nave.x, y - S.nave.y) / (nvVista(S) || 1); v = (v || 1) * Math.max(0.35, 1 - k * 0.5); }
  play(nombre, v === undefined ? 1 : v);
}

// Qué canción suena: menús y galaxia, misión, jefe (también cuando está saltando hacia aquí), estación y los finales (que suenan una vez).
let nvMusicaQue = undefined;
function nvMusicaDeseada() {
  const S = NVP.S; if (!S) return 'nvMenu';
  if (S.estado === 'final') return S.fin.estado === 'victoria' ? 'nvVictoria' : 'nvDerrota';
  if (S.estado === 'victoria' || S.estado === 'derrota') return undefined;   // el final ya sonó: sigue lo que haya
  if (S.estado === 'estacion') return 'nvEstacion';
  return S.jefe || S.jefeSalto ? 'nvJefe' : 'nvMision';
}
setInterval(() => {
  if (!AC || !M.bus) return;   // hasta el primer toque no hay audio; se vuelve a intentar
  const q = nvMusicaDeseada(); if (q === undefined || q === nvMusicaQue) return;
  nvMusicaQue = q; musicSet(q);
}, 250);

// Todos los botones del juego hacen «clic»; el audio arranca con el primer toque (core lo engancha).
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('.nv-boton, button')) play('select'); }, true);

// Los controles de volumen (se pintan donde el juego quiera: galaxia).
function nvControlSonido() {
  const f = nvEl('nv-sonido');
  const fila = (txt, clave) => {
    const r = document.createElement('input'); r.type = 'range'; r.min = 0; r.max = 100; r.value = Math.round(NV_SON[clave] * 100); r.setAttribute('aria-label', txt);
    r.oninput = () => { NV_SON[clave] = r.value / 100; nvSonGuarda(); };
    const l = nvEl('nv-sonfila'); l.appendChild(nvEl('', txt)); l.appendChild(r); return l;
  };
  const mudo = nvEl('nv-boton', '', 'button'), pinta = () => { mudo.textContent = NV_SON.mudo ? tr('Sonido: no') : tr('Sonido: sí'); };
  mudo.onclick = () => { NV_SON.mudo = !NV_SON.mudo; nvSonGuarda(); pinta(); };
  pinta();
  f.appendChild(fila(tr('Música'), 'mus')); f.appendChild(fila(tr('Efectos'), 'vol')); f.appendChild(mudo);
  return f;
}
