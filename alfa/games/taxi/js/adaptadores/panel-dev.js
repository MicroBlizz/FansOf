// Fans Of Taxi · ADAPTADOR del panel DEV (core/js/sistema/desarrollo.js, solo en modo desarrollo): elegir el mapa (la ciudad o el
// circuito de pruebas) y la física del coche (Rapier o la arcade de antes). Cambia la dirección (?mapa=, ?fisica=) y recarga: index.html
// lee esa dirección para decidir si baja Rapier, y FUENTES.elegida() para el mapa.
'use strict';
const UTILIDADES_JUEGO = (() => {
  const params = () => new URLSearchParams(location.search);
  const mapaActual = () => (params().get('mapa') === 'pruebas' ? 'pruebas' : 'ciudad');
  const fisicaActual = () => (typeof RAPIER !== 'undefined' ? 'rapier' : 'arcade');

  // recarga con ese valor en la dirección (o sin él, si es el de por defecto)
  function recarga(nombre, valor, porDefecto) {
    const p = params();
    if (valor === porDefecto) p.delete(nombre); else p.set(nombre, valor);
    const q = p.toString();
    location.href = location.pathname + (q ? '?' + q : '') + location.hash;
  }
  // una fila de botones; el elegido va marcado
  function fila(caja, titulo, opciones, actual, elegir) {
    const div = document.createElement('div'); div.className = 'fila';
    div.append(Object.assign(document.createElement('span'), { textContent: titulo + ':', style: 'align-self:center;color:#cdb9ea;min-width:56px' }));
    for (const [valor, texto] of opciones) {
      const b = Object.assign(document.createElement('button'), { textContent: (valor === actual ? '● ' : '') + texto, onclick: () => elegir(valor) });
      if (valor === actual) b.style.background = '#ffcb3d';
      div.append(b);
    }
    caja.append(div);
  }

  return [{ titulo: 'Taxi: mapa y física', pinta(caja) {
    const mapa = mapaActual();
    fila(caja, 'Mapa', [['ciudad', 'CIUDAD'], ['pruebas', 'CIRCUITO DE PRUEBAS']], mapa, v => recarga('mapa', v, 'ciudad'));
    // por defecto: Rapier en el circuito y arcade en la ciudad (index.html); se apunta en la dirección solo si no es el de por defecto
    fila(caja, 'Física', [['rapier', 'RAPIER (DE VERDAD)'], ['arcade', 'ARCADE (LA DE ANTES)']], fisicaActual(), v => recarga('fisica', v, mapa === 'pruebas' ? 'rapier' : 'arcade'));
    caja.append(Object.assign(document.createElement('p'), { textContent: 'Cambiar recarga la página. Por defecto: Rapier en el circuito, arcade en la ciudad.' }));
  } }];
})();
