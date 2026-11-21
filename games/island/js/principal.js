// Fans of Island · EL ARRANQUE: fabrica las piezas de TAREAS de una en una (con el botón «Cargando...»), el bucle de cada fotograma,
// los botones de jugar, otra vez y silencio, y la música (Animales Locos en partida; «win» y «lose» al acabar).
'use strict';
const bJugar = document.getElementById('jugar'), bSonido = document.getElementById('sonido');
function pasoPartida(dt) {
  pasoJugador(dt);
  for (const e of enemigos) pasoEnemigo(e, dt);
  for (const f of peces) pasoPez(f, dt);
  for (const k of cangrejos) pasoCangrejo(k, dt);
  pasoGotas(dt); pasoGaviotas(dt); choques();
}
let antes = performance.now();
function bucle(t) {
  const dt = Math.min(0.033, (t - antes) / 1000); antes = t; reloj += dt;
  if (TAREAS.length) {
    TAREAS.shift()();
    ctx.fillStyle = '#4fb8ee'; ctx.fillRect(0, 0, VW, VH); presenta();
    if (!TAREAS.length) { bJugar.disabled = false; bJugar.textContent = tr('Jugar'); }
    requestAnimationFrame(bucle); return;
  }
  if (jugando) pasoPartida(dt);
  pasoParts(dt);
  dibuja(); presenta();
  requestAnimationFrame(bucle);
}
function empieza() {
  audioInit(); musicSet('animales'); nueva(); jugando = true;
  document.getElementById('inicio').classList.add('oculto'); document.getElementById('fin').classList.add('oculto');
}
function pintaSonido() {
  document.getElementById('ondas').style.display = SAVE.muted ? 'none' : '';
  document.getElementById('tachado').style.display = SAVE.muted ? '' : 'none';
}
bJugar.disabled = true; bJugar.textContent = tr('Cargando...');
bJugar.onclick = empieza;
document.getElementById('otra').onclick = empieza;
bSonido.addEventListener('pointerdown', e => e.stopPropagation());
bSonido.onclick = () => { SAVE.muted = !SAVE.muted; isGuarda(); applyVolume(); pintaSonido(); };
pintaSonido();
nueva();
requestAnimationFrame(bucle);
