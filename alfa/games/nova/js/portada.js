// Fans of Nova · Portada del prototipo: el botón que abre la partida (fase 1).
'use strict';
(function () {
  const portada = document.getElementById('nv-portada');
  {
    portada.querySelector('#nv-estado').textContent = tr('Fans of Nova · prototipo');
    const b = document.getElementById('nv-jugar');
    b.hidden = false; b.textContent = tr('Jugar el prototipo');
    b.onclick = nvJugar;
    nvEntrada();
    nvCargaArte();
    if (/[?&]auto=1/.test(location.search)) NVP.auto = true;
    const v = /[?&]vel=(\d+)/.exec(location.search); if (v) NVP.vel = +v[1];
    if (/[?&]jugar=1/.test(location.search)) nvJugar();
    const ff = /[?&]ff=(\d+)/.exec(location.search);   // pruebas: adelanta la partida N segundos con el bot antes de enseñarla
    if (ff && NVP.S) { const S = NVP.S; NVP.auto = true; while (S.t < +ff[1] && S.estado !== 'derrota' && S.estado !== 'victoria') { if (S.estado === 'cartas') nvElegirCarta(S, 0); else nvPaso(S, 1 / 30); } }
  }
  portada.hidden = false;
})();
