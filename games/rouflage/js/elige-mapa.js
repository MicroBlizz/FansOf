// Fans of Rouflage · ELEGIR MAPA: los botones de mapa de la pantalla de título (la estación, las Backrooms…). Al tocar uno, el mapa
// se construye al momento y se ve de fondo con las alubias de paseo. La elección se guarda con la partida (SAVE.mapa) y vale para
// las partidas en solitario; por internet el mapa lo decide la semilla de la sala (mapaDeSemilla), el mismo para todos.
'use strict';

const mapaElegido = () => (SAVE.mapa && MAPAS[SAVE.mapa] ? SAVE.mapa : ORDEN_MAPAS[0]);
const mapaDeSemilla = semilla => ORDEN_MAPAS[Math.abs(semilla | 0) % ORDEN_MAPAS.length];

function eligeMapa(id) {
  if (!MAPAS[id] || id === MAPA.id) return;
  SAVE.mapa = id; guardaPartida();
  cargaMapa(id); escenaTitulo(); play('select');
  pintaBotonesMapa();
}
function pintaBotonesMapa() {
  for (const b of document.querySelectorAll('#mapas .mapa')) b.classList.toggle('activo', b.dataset.mapa === MAPA.id);
}
function preparaEligeMapa() {
  const caja = E('mapas'); if (!caja) return;
  caja.innerHTML = '';
  for (const id of ORDEN_MAPAS) {
    const d = MAPAS[id], b = document.createElement('button');
    b.type = 'button'; b.className = 'mapa'; b.dataset.mapa = id;
    b.innerHTML = '<b class="ol"></b><span></span>';
    b.querySelector('b').textContent = tr(d.nombre); b.querySelector('span').textContent = tr(d.lema);
    b.onclick = () => eligeMapa(id);
    caja.appendChild(b);
  }
  pintaBotonesMapa();
}
