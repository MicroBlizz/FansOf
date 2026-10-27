// Fans Of Taxi · MENÚ DE ESTACIONES (solo en el circuito de pruebas): un botón «Estaciones» abre una botonera para ir a cada una;
// «Reaparecer» (o la tecla R) devuelve el coche a la última estación por la que has pasado.
//
// Es un adaptador de pantalla: no sabe mover el coche, solo llama a `ir(estacion)`. Quién es la última estación lo decide principal.js.
'use strict';
const ESTACIONES_MENU = (() => {
  let panel = null;

  function boton(texto, alPulsar, clase = '') {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'est-boton ' + clase; b.textContent = texto;
    b.addEventListener('click', e => { e.stopPropagation(); alPulsar(); });
    return b;
  }

  function abreOCierra() { panel.classList.toggle('abierto'); }

  // estaciones: [{ numero, nombre }]; ir(estacion); reaparecer()
  function montar({ estaciones, ir, reaparecer }) {
    const caja = document.createElement('div');
    caja.id = 'estaciones';
    panel = document.createElement('div');
    panel.className = 'est-panel';
    for (const e of estaciones) panel.appendChild(boton(e.numero + ' · ' + tr(e.nombre), () => { ir(e); panel.classList.remove('abierto'); }));
    caja.append(boton(tr('Estaciones'), abreOCierra, 'fuerte'), boton(tr('Reaparecer') + ' (R)', reaparecer), panel);
    document.getElementById('capa').appendChild(caja);
    window.addEventListener('keydown', e => { if (e.code === 'KeyR' && !e.repeat) reaparecer(); });
  }

  return { montar };
})();
