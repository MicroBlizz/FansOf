// Fans of Nova · Portada: la pantalla «en construcción» y, en modo desarrollo, el botón del prototipo de partida (fase 1).
// Solo con NUCLEO.desarrollo o en la alfa se ve algo jugable; en la release no existe (herramientas/publico_excluye.py).
'use strict';
(function () {
  const portada = document.getElementById('nv-portada');
  if (!(NUCLEO.desarrollo || NUCLEO.alfa)) {   // oculto: solo en modo desarrollo o en la alfa (rol alfa) hay algo que jugar
    portada.querySelector('#nv-estado').textContent = tr('Este juego aún no está disponible');
  } else {
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
