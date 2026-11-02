// Fans of Soccer · Tutorial de la primera vez: cinco avisos cortos que se van cumpliendo jugando (moverse, pasar, carrerilla,
// tirar, barrida/empujón). Cada uno se quita al hacerlo o a los pocos segundos; al acabar no vuelve a salir.
'use strict';
var SOCCER = globalThis.SOCCER || (globalThis.SOCCER = {});
(function (S) {
  const PASOS = [
    { texto: 'Arrastra en la mitad izquierda para moverte', hecho: (ev, j) => j.movido > 1, sitio: [250, 560] },
    { texto: 'Botón azul: pasa al compañero que marca la flecha', hecho: (ev) => ev.tipo === 'pase' && ev.eq === 0, sitio: [1035, 540] },
    { texto: 'Corre con el balón sin que te toquen: la carrerilla carga el súper tiro', hecho: (ev) => ev.tipo === 'cargado' && ev.quien < 4, sitio: [640, 140] },
    { texto: 'Botón rojo: ¡tira! Con el aura brillando es un súper tiro', hecho: (ev) => (ev.tipo === 'tiro' || ev.tipo === 'super') && ev.eq === 0, sitio: [1175, 460] },
    { texto: 'Sin balón: azul empuja y rojo hace una barrida', hecho: (ev) => (ev.tipo === 'barrida' || ev.tipo === 'empujon') && ev.quien < 4, sitio: [1100, 520] },
  ];
  const T = S.tutorial = { activo: false, paso: 0, t: 0, movido: 0 };

  T.empezar = function () { Object.assign(T, { activo: true, paso: 0, t: 0, movido: 0 }); };

  // Cada paso de juego: mira si el aviso actual se ha cumplido (o caducado). Devuelve true al terminar el tutorial.
  T.mirar = function (eventos, dt, moviendo) {
    if (!T.activo) return false;
    T.t += dt; if (moviendo) T.movido += dt;
    const p = PASOS[T.paso], cumplido = eventos.some((ev) => p.hecho(ev, T));
    if (!cumplido && !(T.paso > 0 && T.t > 14) && !(T.paso === 0 && T.movido > 1)) return false;
    T.paso++; T.t = 0;
    if (T.paso < PASOS.length) return false;
    T.activo = false;
    return true;
  };

  T.dibujar = function (g, tiempo) {
    if (!T.activo) return;
    const p = PASOS[T.paso], ui = S.ui;
    g.fillStyle = 'rgba(10,12,30,.82)'; g.strokeStyle = '#ffe14a'; g.lineWidth = 4;
    g.beginPath(); g.roundRect(260, 130, 760, 56, 14); g.fill(); g.stroke();
    ui.texto(g, tr(p.texto), 640, 166, 11, '#fff');
    const [x, y] = p.sitio, bote = Math.sin(tiempo * 8) * 8;
    g.fillStyle = '#ffe14a'; g.strokeStyle = '#111'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(x - 14, y - 40 + bote); g.lineTo(x + 14, y - 40 + bote); g.lineTo(x, y - 18 + bote); g.closePath(); g.fill(); g.stroke();
  };
})(SOCCER);
