// Fans of Karts (prototipo) · GIROSCOPIO: girar el kart inclinando el móvil a los lados, como un volante (Opciones → Giroscopio).
// Se lee del sensor de orientación del móvil. Lo que cuenta es cuánto baja un lado de la pantalla respecto al horizonte, así da igual
// lo levantado que se tenga el móvil y vale de pie y tumbado. Los iPhone solo dan permiso si se pide dentro de un toque: por eso
// inclActiva() se llama desde el propio gesto (controles.js) y no desde el bucle del juego.
'use strict';

const INCL = { estado: 'no', crudo: 0, tPide: 0, escucha: false };     // estado: 'no', 'pide' (esperando datos), 'si', 'denegado' o 'sinsensor'
const INCL_MUERTA = 2.5, INCL_TOPE = 20;      // grados: por debajo de 2,5 no gira; a 20 gira a tope
// cuánto está girada la pantalla respecto al móvil según el sistema (0 = de pie, 90 = tumbado con la parte de arriba a la izquierda…)
function anguloSistema() { const o = screen.orientation; return o && typeof o.angle === 'number' ? o.angle : (((window.orientation || 0) % 360) + 360) % 360; }
function inclEvento(e) {
  if (typeof e.beta !== 'number' || typeof e.gamma !== 'number') return;
  const b = e.beta * RAD, g = e.gamma * RAD, ang = (anguloSistema() + GIRADA) % 360;      // la del sistema más el cuarto de vuelta que pone el juego
  // lo que baja el lado derecho del móvil y lo que sube su parte de arriba, en grados
  const deLado = Math.asin(limita(Math.cos(b) * Math.sin(g), -1, 1)) / RAD, deLargo = Math.asin(limita(Math.sin(b), -1, 1)) / RAD;
  const ahora = ang === 90 ? deLargo : ang === 270 ? -deLargo : ang === 180 ? -deLado : deLado;
  INCL.crudo += (ahora - INCL.crudo) * 0.4;      // un poco de suavizado: el sensor tiembla
  if (INCL.estado === 'pide') { INCL.estado = 'si'; INCL.crudo = ahora; }
}
// de -1 (todo a la izquierda) a 1 (todo a la derecha)
function inclValor() { const a = Math.abs(INCL.crudo); return a < INCL_MUERTA ? 0 : Math.sign(INCL.crudo) * Math.min(1, (a - INCL_MUERTA) / (INCL_TOPE - INCL_MUERTA)); }
const inclLista = () => AJUSTES.giro && INCL.estado === 'si';
function inclActiva() {
  if (typeof DeviceOrientationEvent === 'undefined') { INCL.estado = 'sinsensor'; return; }
  const escucha = () => { if (!INCL.escucha) { window.addEventListener('deviceorientation', inclEvento); INCL.escucha = true; } INCL.estado = 'pide'; INCL.tPide = performance.now(); };
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    INCL.estado = 'pide'; INCL.tPide = performance.now() + 120000;      // mientras el móvil pregunta, no se da por perdido
    DeviceOrientationEvent.requestPermission().then(r => { if (r === 'granted') escucha(); else INCL.estado = 'denegado'; }).catch(() => { INCL.estado = 'denegado'; });
  } else escucha();
}
function inclApaga() { if (INCL.escucha) window.removeEventListener('deviceorientation', inclEvento); INCL.escucha = false; INCL.estado = 'no'; INCL.crudo = 0; }
// cada fotograma: si se ha pedido y en dos segundos no llega ningún dato, es que no hay sensor (un ordenador, por ejemplo)
function inclVigila() { if (INCL.estado === 'pide' && performance.now() - INCL.tPide > 2000) INCL.estado = 'sinsensor'; }
// lo que se dice en Opciones según cómo esté
function inclTexto() {
  return !AJUSTES.giro ? '' : INCL.estado === 'si' ? 'Giroscopio encendido: inclina el móvil a los lados para girar.' : INCL.estado === 'denegado' ? 'El móvil no ha dado permiso para usar el giroscopio. Recarga la página y vuelve a probar.'
    : INCL.estado === 'sinsensor' ? 'Este aparato no tiene giroscopio, o el navegador no deja usarlo.' : 'Buscando el giroscopio…';
}
