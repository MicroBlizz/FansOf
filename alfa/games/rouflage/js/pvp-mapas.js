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
  const conEsc = !!(RFP.info && RFP.info.privada && MAPAS[MAPA_ESC.id]);      // con amigos, también ESTE ESCENARIO: el del anfitrión (mapa-escenario.js)
  if (caja.dataset.anf !== String(soyAnf) || caja.dataset.esc !== String(conEsc) || !caja.children.length) {
    caja.dataset.anf = String(soyAnf); caja.dataset.esc = String(conEsc); miniaturasMapas();
    const celda = (id, nombre, img) => `<button type="button" class="mapa-mini" data-mapa="${id}" ${soyAnf ? '' : 'disabled'}>${img ? `<img src="${img}" alt="">` : '<i class="azar ol">?</i>'}<span>${esc(tr(nombre))}</span></button>`;
    caja.innerHTML = `<small>${esc(tr('MAPA'))}</small><div class="mapas-mini">${celda('', 'AL AZAR', '')}${conEsc ? celda(MAPA_ESC.id, 'ESTE ESCENARIO', MINIS_MAPA[MAPA_ESC.id] || '') : ''}${ORDEN_MAPAS.map(id => celda(id, MAPAS[id].nombre, MINIS_MAPA[id])).join('')}</div>`;
    if (soyAnf) for (const b of caja.querySelectorAll('.mapa-mini')) b.onclick = () => { play('select'); MODO_ELEGIDO.mapa = b.dataset.mapa; pvpMandaModo(); };
  }
  const im = conEsc && caja.querySelector(`.mapa-mini[data-mapa="${MAPA_ESC.id}"] img`); if (im && MINIS_MAPA[MAPA_ESC.id] && im.getAttribute('src') !== MINIS_MAPA[MAPA_ESC.id]) im.src = MINIS_MAPA[MAPA_ESC.id];      // si el anfitrión cambia su escenario
  const sel = mapaDeSala(d);
  for (const b of caja.querySelectorAll('.mapa-mini')) { const si = b.dataset.mapa === sel; b.classList.toggle('puesto', si); b.setAttribute('aria-pressed', String(si)); }
}

// BUSCAR PARTIDA (la sala pública): lo que se enseña es lo que de verdad se jugará. Con la semilla (al arrancar la sala) se sabe todo: modoPublico
// (modos.js), y el mapa, el de la semilla. Antes solo se sabe lo que puso el servidor (el modo, la luz y algún extra): las reglas, la luz si no vino
// el modo y un posible extra más se sortean al empezar, así que no se enseñan. Las filas solo de amigos (BECARIOS, COLADOS, GANAN y TALENTOS) nunca.
function salaPublicaModo(i) {
  const d0 = i && i.modo;
  if (i && i.semilla != null) { const d = modoPublico(d0, i.semilla); d.mapa = mapaDeSala(d0) || mapaDeSemilla(i.semilla); return { d, sabe: true, luz: true }; }
  const fijo = !!(d0 && MODOS[d0.m]);
  return { d: { m: fijo ? d0.m : '', x: Object.assign({}, d0 && d0.x), a: {}, mapa: mapaDeSala(d0) || undefined }, sabe: false, luz: fijo };
}
// esconde en #busca-extras lo que no toca (vp: lo de salaPublicaModo; null en la sala con amigos, que lo enseña todo)
function salaPublicaFiltra(ex, vp) {
  for (const b of ex.querySelectorAll('.luz-b[data-aj]')) b.closest('.luz-sala').hidden = !!vp && (AJUSTES_SALA[b.dataset.aj].amigos || !vp.sabe);
  const luz = E('luz-texto'); if (luz) luz.closest('.luz-sala').hidden = !!vp && !vp.luz;
  for (const l of ex.querySelectorAll('label')) l.hidden = !!vp && !vp.sabe && !l.classList.contains('on');      // los extras apagados aún pueden tocar
}
