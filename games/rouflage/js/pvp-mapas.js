// Fans of Rouflage · EL MAPA DE LA SALA CON AMIGOS: en las opciones de la sala el anfitrión elige el mapa (o «al azar», que lo decide la
// semilla como siempre) viendo una imagen pequeña de cada uno. La elección viaja dentro del modo de la sala (`modo.mapa`), que el servidor
// ya reparte a todos tal cual; sin ella (salas públicas, versiones antiguas) manda la semilla. Las miniaturas salen del propio fondo del mapa.
'use strict';

const MINIS_MAPA = {};      // id → dataURL de la miniatura (se hace una vez por navegador)
const MINI_ANCHO = 150;

// construye lo que falte (cada mapa se carga un momento) y deja cargado el mapa que había
function miniaturasMapas() {
  const faltan = ORDEN_MAPAS.filter(id => !MINIS_MAPA[id]); if (!faltan.length) return;
  const previo = MAPA.id;
  for (const id of faltan) {
    try {
      cargaMapa(id);
      const f = MAPA.fondo, [cv, c] = lienzo(MINI_ANCHO, Math.round(MINI_ANCHO * f.height / f.width));
      c.imageSmoothingQuality = 'high'; c.drawImage(f, 0, 0, cv.width, cv.height);
      MINIS_MAPA[id] = cv.toDataURL('image/jpeg', 0.75);
    } catch (_) { MINIS_MAPA[id] = ''; }
  }
  if (previo && previo !== MAPA.id) { cargaMapa(previo); if (typeof escenaTitulo === 'function' && !RFP.activo) escenaTitulo(); }
}
const mapaDeSala = d => (d && d.mapa && MAPAS[d.mapa] ? d.mapa : '');      // '' = al azar (semilla)

// el selector dentro de #busca-modo: una tira de miniaturas, la marcada resaltada; solo el anfitrión puede tocar
function pvpPintaMapas(d, soyAnf) {
  const caja = E('busca-mapas'); if (!caja) return;
  if (caja.dataset.anf !== String(soyAnf) || !caja.children.length) {
    caja.dataset.anf = String(soyAnf); miniaturasMapas();
    const celda = (id, nombre, img) => `<button type="button" class="mapa-mini" data-mapa="${id}" ${soyAnf ? '' : 'disabled'}>${img ? `<img src="${img}" alt="">` : '<i class="azar ol">?</i>'}<span>${esc(tr(nombre))}</span></button>`;
    caja.innerHTML = `<small>${esc(tr('MAPA'))}</small><div class="mapas-mini">${celda('', 'AL AZAR', '')}${ORDEN_MAPAS.map(id => celda(id, MAPAS[id].nombre, MINIS_MAPA[id])).join('')}</div>`;
    if (soyAnf) for (const b of caja.querySelectorAll('.mapa-mini')) b.onclick = () => { play('select'); MODO_ELEGIDO.mapa = b.dataset.mapa; pvpMandaModo(); };
  }
  const sel = mapaDeSala(d);
  for (const b of caja.querySelectorAll('.mapa-mini')) { const si = b.dataset.mapa === sel; b.classList.toggle('puesto', si); b.setAttribute('aria-pressed', String(si)); }
}
