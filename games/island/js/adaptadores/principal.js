// Fans of Island · adaptadores/principal: EL ARRANQUE: crea el lienzo, los mandos, las pantallas y la partida; fabrica las piezas de
// IS.TAREAS de una en una (con el botón «Cargando...») y lleva el bucle de cada fotograma; la música es la de los Animales Locos en
// partida («win» y «lose» al acabar, en pantallas.js).
'use strict';
{
  const lienzo = IS.creaLienzo(), mandos = IS.creaMandos(), pantallas = IS.creaPantallas();
  const { sesion, vista, nueva, empieza } = IS.creaPartida({ lienzo, mandos, pantallas });
  let antes = performance.now();

  function cargaUna() {   // una pieza de arte por fotograma, para no congelar el móvil; el fondo azul hasta que estén todas
    IS.TAREAS.shift()(sesion.nivel);
    lienzo.ctx.fillStyle = '#4fb8ee'; lienzo.ctx.fillRect(0, 0, lienzo.vw, lienzo.vh); lienzo.presenta();
    if (!IS.TAREAS.length) pantallas.listo();
  }
  function bucle(t) {
    const dt = Math.min(0.033, (t - antes) / 1000); antes = t;
    const reloj = vista.avanza(dt);
    if (IS.TAREAS.length) cargaUna();
    else {
      sesion.paso(dt, reloj);
      vista.pasoParts(dt);
      vista.dibuja(); lienzo.presenta();
    }
    requestAnimationFrame(bucle);
  }
  pantallas.alEmpezar(() => { IS.fuera.audioInit(); IS.fuera.musicSet('animales'); empieza(); });
  nueva();
  requestAnimationFrame(bucle);
}
