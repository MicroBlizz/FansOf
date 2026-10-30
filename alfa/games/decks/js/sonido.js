// Fans Of Decks · SONIDO: volumen guardado en este navegador y qué canción suena en cada momento. El motor y las canciones son de core
// (core/js/sistema/sonido.js y core/js/serie/canciones.js): aquí solo los ganchos que pide y la elección de canción.
'use strict';
const DC_SON_CLAVE = 'decks-sonido';
const DC_SON = (() => {   // la música empieza al 50 % (lo guardado manda)
  let s = null; try { s = JSON.parse(localStorage.getItem(DC_SON_CLAVE) || 'null'); } catch (e) { s = null; }
  return Object.assign({ mudo: false, vol: 0.8, mus: 0.5 }, s || {});
})();
function dcSonGuarda() { try { localStorage.setItem(DC_SON_CLAVE, JSON.stringify(DC_SON)); } catch (e) { /* sin almacenamiento: vale hasta cerrar la pestaña */ } applyVolume(); }
function sonidoApagado() { return DC_SON.mudo; }
function volGeneral() { return DC_SON.mudo ? 0 : 0.55 * DC_SON.vol; }
function volMusica() { return 0.7 * DC_SON.mus; }

// Menús y agenda: la del menú. En una reunión: la de la facción del líder; con un jefe o un minijefe en la sala, la de jefe.
function dcMusicaDeseada() {
  const C = DCC.C, sala = document.getElementById('dc-combate');
  if (!C || !sala || sala.hidden) return 'menu';
  if (C.rivales.some(r => r.hp > 0 && DC_RIVALES[r.id] && (DC_RIVALES[r.id].jefe || DC_RIVALES[r.id].mini))) return 'boss';
  const L = DCP.run && DC_LIDERES[DCP.run.lider];
  return L && TRACKS[L.faccion] ? L.faccion : 'animales';
}
let dcMusicaQue = null;
setInterval(() => {
  if (!AC || !M.bus) return;   // hasta el primer toque no hay audio; se vuelve a intentar
  const q = dcMusicaDeseada(); if (q === dcMusicaQue) return;
  dcMusicaQue = q; musicSet(q);
}, 250);

// Los efectos propios de Decks (todo con código, como en core): uno por tipo de carta al jugarla, golpes, escudos, el reparto de la mano,
// el turno, el rival que cae y la mirilla que fija un blanco. Los botones suenan todos con 'select' (escucha de abajo).
Object.assign(SFX, {
  dcCoge: () => { noise(0.07, 0.05, 4200, 'highpass'); tone(420, 640, 0.06, 'triangle', 0.04); },
  dcReparte: () => { noise(0.05, 0.06, 5200, 'highpass'); tone(900, 1300, 0.04, 'triangle', 0.025); },
  dcEmpleado: () => { noise(0.12, 0.1, 1400, 'bandpass'); tone(520, 180, 0.16, 'sawtooth', 0.05); tone(140, 70, 0.14, 'sine', 0.2, 0.06); },
  dcTarea: () => { noise(0.08, 0.1, 3200, 'highpass'); tone(700, 1100, 0.08, 'triangle', 0.06); },
  dcTramite: () => { tone(180, 90, 0.1, 'square', 0.08); noise(0.09, 0.18, 700); tone(1200, 1200, 0.05, 'triangle', 0.04, 0.09); },
  dcDirectiva: () => [392, 494, 587, 784].forEach((f, i) => tone(f, f * 1.01, 0.22, 'triangle', 0.06, i * 0.06)),
  dcCompanero: () => { tone(660, 990, 0.1, 'square', 0.05); tone(880, 1320, 0.12, 'square', 0.045, 0.1); },
  dcProtocolo: () => { tone(1500, 1500, 0.03, 'square', 0.04); tone(1500, 1500, 0.03, 'square', 0.04, 0.07); tone(500, 1000, 0.14, 'sine', 0.05, 0.12); },
  dcGolpe: (v = 1) => { noise(0.08, 0.16 * v, 1800, 'bandpass'); tone(260, 90, 0.12, 'square', 0.05 * v); },
  dcAuch: () => { noise(0.18, 0.28, 600); tone(180, 60, 0.22, 'sawtooth', 0.09); },
  dcGolpeGordo: () => { noise(0.45, 0.4, 700); tone(110, 38, 0.4, 'sine', 0.35); tone(420, 120, 0.2, 'square', 0.05); },
  dcEscudo: () => { noise(0.08, 0.1, 3000, 'highpass'); tone(880, 880, 0.18, 'triangle', 0.05); tone(1320, 1320, 0.22, 'sine', 0.035, 0.04); },
  dcEmbiste: () => { noise(0.2, 0.12, 900, 'bandpass'); tone(200, 520, 0.18, 'sawtooth', 0.04); },
  dcPapel: () => { for (let i = 0; i < 3; i++) noise(0.05, 0.08, 4500, 'highpass', i * 0.05); },
  dcPoder: () => { tone(300, 900, 0.3, 'sawtooth', 0.04); tone(450, 1350, 0.3, 'triangle', 0.04, 0.05); },
  dcDebil: () => { tone(600, 200, 0.35, 'triangle', 0.06); },
  dcKO: () => { noise(0.3, 0.2, 1200); tone(700, 120, 0.4, 'square', 0.06); tone(1046, 1046, 0.1, 'triangle', 0.05, 0.3); },
  dcTurno: () => { tone(784, 784, 0.1, 'triangle', 0.06); tone(1046, 1046, 0.16, 'triangle', 0.06, 0.09); },
  dcFinTurno: () => { noise(0.25, 0.08, 1200, 'bandpass'); tone(500, 260, 0.22, 'triangle', 0.05); },
  dcFija: () => tone(1400, 1900, 0.05, 'square', 0.03),
});
Object.assign(THROTTLE, { select: 80, dcReparte: 45, dcGolpe: 60, dcEscudo: 120, dcFija: 60, dcPapel: 150, dcKO: 120, dcAuch: 120 });
// Cada botón suena al tocarlo (los que ya tocaban 'select' no suenan doble: 'select' tiene su pausa mínima; fin de turno, la jugada del líder y las meriendas llevan el suyo).
document.addEventListener('click', ev => { const b = ev.target.closest && ev.target.closest('button, .home-tile'); if (b && !b.disabled && !b.matches('.dc-fin, .dc-salto, .dc-merienda')) play('select'); }, true);
