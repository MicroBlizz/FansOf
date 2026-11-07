// Fans of Zombies · EL TUTORIAL DEL PRIMER DÍA (pantalla): en la primera partida, una nota arriba te va pidiendo cosas de una en una
// (andar, la mochila, registrar, clavar una tabla, agacharte, el mapa, comer o beber, pelear y qué hacer de noche). Cada paso se da por
// hecho al hacerlo; se puede saltar. Al acabar (o saltarlo) se apunta en SAVE.tutoHecho y no vuelve a salir.
'use strict';
const TUTO = { paso: 0, activo: false, x0: 0, z0: 0, uso: false, pelea: false, t: 0 };
const PASOS_TUTO = [
  { txt: 'Muévete con WASD y apunta con el ratón. Estás en tu casa del barrio.', hecho: (e) => ZOM.dist(e.jugador.x, e.jugador.z, TUTO.x0, TUTO.z0) > 3 },
  { txt: 'Abre la mochila con Tab. Cada cosa ocupa su forma: arrastra para moverla y usa la rueda para girarla.', hecho: () => VM.abierta },
  { txt: 'Registra la nevera, el armario o la cocina de tu casa (F) y elige qué coges.', hecho: (e) => e.stats.registros > 0 },
  { txt: 'Clava una tabla en una ventana (B). Llevas martillo, tablas y clavos.', hecho: (e) => Object.values(e.huecos || {}).some((h) => h.tablas > 0) },
  { txt: 'Agáchate (C): así no haces ruido al andar y te ven desde más cerca.', hecho: (e) => e.jugador.agacha },
  { txt: 'Abre el mapa (M): solo enseña lo que ya has visto.', hecho: () => VMAPA.abierto },
  { txt: 'Come (E) o bebe (Q) algo. Cuida el hambre, la sed y el sueño.', hecho: () => TUTO.uso },
  { txt: 'Si un fan se acerca, empújalo (clic derecho) o golpéalo (clic). Disparar se oye en medio distrito.', hecho: () => TUTO.pelea },
  { txt: 'Al anochecer llegan más fans. Quédate en casa con las ventanas tapadas y duerme (Z) cuando tengas sueño. ¡Suerte!', hecho: () => TUTO.t > 14 },
];
function empiezaTutorial(e) {
  TUTO.activo = !SAVE.tutoHecho; TUTO.paso = 0; TUTO.x0 = e.jugador.x; TUTO.z0 = e.jugador.z; TUTO.uso = TUTO.pelea = false; TUTO.t = 0;
  pintaTutorial();
}
function terminaTutorial() { TUTO.activo = false; SAVE.tutoHecho = true; guardaPartida(); pintaTutorial(); }
function pintaTutorial() {
  const n = el('h-tuto'); if (!n) return;
  n.hidden = !TUTO.activo;
  if (!TUTO.activo) return;
  n.innerHTML = '<b>' + esc(trf('TUTORIAL · %1 DE %2', TUTO.paso + 1, PASOS_TUTO.length)) + '</b><span>' + esc(tr(PASOS_TUTO[TUTO.paso].txt)) + '</span><button id="h-tuto-saltar">' + esc(tr('SALTAR')) + '</button>';
  el('h-tuto-saltar').onclick = terminaTutorial;
}
// cada fotograma: si el paso de ahora está hecho, al siguiente (con un sonidito)
function avanzaTutorial(e, dt) {
  if (!TUTO.activo) return;
  if (TUTO.paso === PASOS_TUTO.length - 1) TUTO.t += dt;
  if (!PASOS_TUTO[TUTO.paso].hecho(e)) return;
  play('compra');
  if (++TUTO.paso >= PASOS_TUTO.length) terminaTutorial(); else pintaTutorial();
}
