// Fans of Asalto · ADAPTADORES · La ventana de las piedras de destino (HTML sobre el lienzo): la misión de piedra en marcha con lo que
// pide, por dónde va, el plazo que le queda y la piedra que da; y la bolsa, con el botón USAR de cada piedra (y lo que trae además).
// Usar una cierra la ventana y lanza su tirada en el Altar (pantalla.js); la Piedra de la clase abre antes la ventana de elegir clase.
// No decide reglas.
'use strict';
AS.ventanas.piedras = (() => {
  const V = AS.ventanas, btn = V.btn, PP = AS.pinta.piedras;
  const barra = (va, meta) => `<div class="as-barra"><i style="width:${Math.min(100, Math.round(va / meta * 100))}%"></i></div>`;
  const sube = piedra => { const n = ASALTO.piedras.tipos[piedra].sube; return n === 1 ? tr('sube la rareza 1 nivel') : tr('sube la rareza {n} niveles', { n }); };
  // lo que dice una piedra debajo de su nombre: lo que sube y, si trae algo más, eso
  const dice = piedra => (PP.que(piedra) ? sube(piedra) + ' · ' + PP.que(piedra) : sube(piedra));
  function htmlMision(m) {
    if (!m) return `<p class="as-nota">${tr('Ahora no hay misión de piedra. Sale una cada pocas oleadas.')}</p>`;
    return `<ul class="as-lista as-metas"><li class="as-item">${PP.img(m.piedra)}<div><b>${PP.pide(m)}</b><span>${m.va}/${m.meta} · ${PP.plazo(m.quedan)}</span>${barra(m.va, m.meta)}
      <span>${tr('Premio')}: ${PP.nombre(m.piedra)} (${sube(m.piedra)})${PP.que(m.piedra) ? ' · ' + PP.que(m.piedra) : ''}</span></div></li></ul>`;
  }
  const htmlPiedra = (piedra, i) => `<li class="as-item">${PP.img(piedra)}<div><b>${PP.nombre(piedra)}</b><span>${dice(piedra)}</span></div>${btn('', tr('USAR'), 'as-oro as-chico').replace('id=""', `data-usa="${i}"`)}</li>`;
  // el tope de las piedras: la rareza más alta abierta en Mejoras (la del comodín da su Épico aunque no esté abierto)
  function htmlTope(abiertas) {
    if (!abiertas) return `<p class="as-nota">${tr('Aún no tienes rarezas abiertas: la piedra te da la invocación gratis con línea segura, pero los héroes llegan Comunes, salvo con la Piedra del comodín, que da un Épico seguro. Ábrelas en Mejoras.')}</p>`;
    return `<p class="as-nota">${tr('Tu tope ahora: {rareza}. Se abren más en Mejoras.', { rareza: tr(ASALTO.rarezas[abiertas].nombre) })}</p>`;
  }
  function abre(E) {
    const s = E.casos.partida.piedras, n = s.bolsa.length;
    const bolsa = n ? `<ul class="as-lista">${s.bolsa.map(htmlPiedra).join('')}</ul>` : `<p class="as-nota">${tr('No tienes piedras. Cumple la misión de piedra antes de que se acabe su plazo.')}</p>`;
    const caja = V.abre(`<h2>${tr('PIEDRAS DE DESTINO')}</h2>
      <p class="as-nota">${tr('Usar una piedra es una invocación aparte: no cuesta oro, no encarece las siguientes, trae línea segura y sus héroes llegan con más rareza.')}</p>
      <h3>${tr('MISIÓN DE PIEDRA')}</h3>${htmlMision(s.mision)}
      <h3>${tr('TUS PIEDRAS {n}/{de}', { n, de: ASALTO.piedras.bolsa })}</h3>${bolsa}${htmlTope(s.abiertas)}` + btn('as-cerrar', tr('CERRAR'), 'as-azul'));
    V.alPulsar('as-cerrar', V.cierra);
    for (const b of caja.querySelectorAll('[data-usa]')) b.onclick = () => usa(E, +b.dataset.usa, s.bolsa[+b.dataset.usa]);
  }
  // usar la piedra i: la de la clase pregunta antes cuál; las demás tiran ya
  function usa(E, i, piedra) {
    V.cierra();
    if (AS.piedrasEfectos.pideClase(ASALTO, piedra)) eligeClase(E, i, piedra); else AS.pantalla.tiraPiedra(i);
  }
  // la ventana de elegir clase (Piedra de la clase): una losa por clase, con su icono y su color; tocar una lanza la tirada
  function eligeClase(E, i, piedra) {
    const fila = k => `<li class="as-item">${V.ico('clase-' + k, 'as-ico2')}<div><b style="color:${ASALTO.clases[k].col}">${tr(ASALTO.clases[k].nombre)}</b></div>${btn('', tr('ELEGIR'), 'as-oro as-chico').replace('id=""', `data-clase="${k}"`)}</li>`;
    const caja = V.abre(`<h2>${PP.nombre(piedra)}</h2><p class="as-nota">${tr('Elige la clase del héroe que llega. La línea segura sale de esa clase.')}</p>
      <ul class="as-lista">${Object.keys(ASALTO.clases).map(fila).join('')}</ul>` + btn('as-cerrar', tr('CANCELAR'), 'as-azul'), 'as-elige-clase');
    V.alPulsar('as-cerrar', V.cierra);
    for (const b of caja.querySelectorAll('[data-clase]')) b.onclick = () => { V.cierra(); AS.pantalla.tiraPiedra(i, { clase: b.dataset.clase }); };
  }
  return Object.assign(abre, { eligeClase });
})();
