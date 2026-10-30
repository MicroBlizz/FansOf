// Fans of Rouflage · ELEGIR MAPA: los botones de mapa de la pantalla CONTRA BOTS (la estación, el parking…). Al tocar uno, el mapa
// se construye al momento y se ve de fondo con las alubias de paseo. La elección se guarda con la partida (SAVE.mapa) y vale para
// las partidas en solitario; por internet el mapa lo decide la semilla de la sala (mapaDeSemilla), el mismo para todos.
// MAPAS CON CANDADO (decidido por Daniel el 25-10-2026): mientras no acabas el tutorial (una partida de camaleón y otra de cazador, tutorial.js)
// solo se juega en la estación; después, cada partida GANADA (contra bots o en línea, con cualquier papel) abre el siguiente mapa de
// ORDEN_ABRIR, y las Backrooms son el último. Las victorias se cuentan en SAVE.mapasGana. Con amigos, el anfitrión solo elige entre los suyos.
'use strict';

// el orden en que se abren (aparte de ORDEN_MAPAS, que no se toca: de él sale el mapa de la semilla y debe ser igual en todas las versiones)
const ORDEN_ABRIR = ['estacion', 'parking', 'cloacas', 'jardines', 'residencial', 'hotel', 'backrooms'];

// cuántos mapas de ORDEN_ABRIR tienes abiertos (DESBLOQUEAR TODO de las pruebas los abre todos)
function mapasAbiertos() {
  if (typeof armarioEstado === 'function' && armarioEstado().todo && arPruebasVisibles()) return ORDEN_ABRIR.length;
  if (SAVE.mapasDev) return ORDEN_ABRIR.length;     // el código regalo de desarrollo (codigos.js, servidor/95)
  if (tutoFaltan().length) return 1;
  return Math.min(ORDEN_ABRIR.length, 1 + (SAVE.mapasGana | 0));
}
// un mapa que no está en la lista (MI ESCENARIO, uno nuevo sin apuntar) siempre se puede
const mapaAbierto = id => { const i = ORDEN_ABRIR.indexOf(id); return i < 0 || i < mapasAbiertos(); };
const mapasAbiertosLista = () => ORDEN_MAPAS.filter(mapaAbierto);

const mapaElegido = () => (SAVE.mapa && MAPAS[SAVE.mapa] && mapaAbierto(SAVE.mapa) ? SAVE.mapa : ORDEN_ABRIR[0]);
const mapaDeSemilla = semilla => ORDEN_MAPAS[Math.abs(semilla | 0) % ORDEN_MAPAS.length];

// al acabar una partida (sin conexión o en línea): si has ganado, apunta la victoria y devuelve la frase del mapa nuevo (o '')
function mapasFin(victoria) {
  if (!victoria || tutoFaltan().length) return '';      // las del tutorial no cuentan: primero hay que acabarlo
  const antes = mapasAbiertos();
  SAVE.mapasGana = (SAVE.mapasGana | 0) + 1; guardaPartida();
  const ahora = mapasAbiertos(); if (ahora <= antes) return '';
  const id = ORDEN_ABRIR[ahora - 1]; if (!MAPAS[id]) return '';
  return tr('¡Mapa nuevo: {mapa}! Ya puedes elegirlo.', { mapa: tr(MAPAS[id].nombre) });
}

function eligeMapa(id) {
  if (!MAPAS[id]) return;
  if (!mapaAbierto(id)) { play('deny'); avisa(textoCandado(id)); return; }
  if (id === MAPA.id) return;
  SAVE.mapa = id; guardaPartida();
  cargaMapa(id); escenaTitulo(); play('select');
  pintaBotonesMapa();
}
// lo que falta para abrir un mapa (corto: lo que cabe en el botón)
function textoCandado(id, corto) {
  if (tutoFaltan().length) return corto ? tr('Acaba el tutorial') : tr('Acaba el tutorial para abrir más mapas: juega una partida de camaleón y otra de cazador.');
  const faltan = ORDEN_ABRIR.indexOf(id) + 1 - mapasAbiertos();
  if (corto) return faltan === 1 ? tr('Gana 1 partida más') : tr('Gana {n} partidas más', { n: faltan });
  return faltan === 1 ? tr('Gana 1 partida más para abrir este mapa.') : tr('Gana {n} partidas más para abrir este mapa.', { n: faltan });
}
// el candado dibujado (contorno grueso, como los iconos de la serie)
const SVG_CANDADO = '<svg class="candado" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 11V8a5 5 0 0 1 10 0v3" fill="none" stroke="#14192b" stroke-width="4.5" stroke-linecap="round"/><path d="M7 11V8a5 5 0 0 1 10 0v3" fill="none" stroke="#c9d3e6" stroke-width="2" stroke-linecap="round"/><rect x="4" y="10.5" width="16" height="12" rx="3" fill="#f2c94c" stroke="#14192b" stroke-width="2.4"/><circle cx="12" cy="16" r="1.8" fill="#14192b"/></svg>';

function pintaBotonesMapa() {
  for (const b of document.querySelectorAll('#mapas .mapa')) {
    const id = b.dataset.mapa, cerrado = !mapaAbierto(id);
    b.classList.toggle('activo', id === MAPA.id && !cerrado);
    b.classList.toggle('cerrado', cerrado);
    b.setAttribute('aria-disabled', String(cerrado));
    b.querySelector('span').textContent = cerrado ? textoCandado(id, true) : tr(MAPAS[id].lema);
  }
}
function preparaEligeMapa() {
  const caja = E('mapas'); if (!caja) return;
  caja.innerHTML = '';
  for (const id of ORDEN_ABRIR.filter(id => MAPAS[id]).concat(ORDEN_MAPAS.filter(id => !ORDEN_ABRIR.includes(id)))) {
    const d = MAPAS[id], b = document.createElement('button');
    b.type = 'button'; b.className = 'mapa'; b.dataset.mapa = id;
    b.innerHTML = '<b class="ol"></b><span></span>' + SVG_CANDADO;
    b.querySelector('b').textContent = tr(d.nombre);
    b.onclick = () => eligeMapa(id);
    caja.appendChild(b);
  }
  pintaBotonesMapa();
}
