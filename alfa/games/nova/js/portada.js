// Fans of Nova · Portada del prototipo: el botón que abre el menú de naves y la partida (fase 1).
// Para pruebas: ?jugar=1 abre el menú; ?casco=caza|crucero|fragata empieza directo; &auto=1 pone al bot; &vel=4 acelera; &ff=150 adelanta la partida N segundos.
'use strict';
(function () {
  const portada = document.getElementById('nv-portada'), q = location.search;
  portada.querySelector('#nv-estado').textContent = tr('Fans of Nova · prototipo');
  const b = document.getElementById('nv-jugar');
  b.textContent = tr('Jugar el prototipo');
  b.onclick = nvJugar;
  nvEntrada();
  nvCargaArte(() => {   // el botón aparece cuando el arte está cargado (el menú enseña las naves)
    b.hidden = false;
    if (/[?&]auto=1/.test(q)) NVP.auto = true;
    const v = /[?&]vel=(\d+)/.exec(q); if (v) NVP.vel = +v[1];
    const c = /[?&]casco=(\w+)/.exec(q);
    if (c) { nvJugar(); document.getElementById('nv-paneles').textContent = ''; NVP.casco = c[1]; nvEmpieza(c[1]); }
    else if (/[?&]jugar=1/.test(q)) nvJugar();
    const ff = /[?&]ff=(\d+)/.exec(q);
    if (ff && NVP.S) { const S = NVP.S; NVP.auto = true; while (S.t < +ff[1] && S.estado !== 'derrota' && S.estado !== 'victoria') { if (S.estado === 'cartas') nvElegirCarta(S, 0); else if (S.estado === 'estacion') nvBotEstacion(S); else nvPaso(S, 1 / 30); } }
  });
  portada.hidden = false;
})();
