// Fans Of · /gestion: la NAVEGACIÓN. Arriba, el menú de ámbitos: «Global» (lo común a toda la web) y un botón por juego; debajo, las pestañas del ámbito elegido.
// Lo que es de un solo juego vive como pestaña dentro de ese juego (Rouflage: Reportes y Códigos; Taxi: Reportes de prueba…). Cada archivo de sección se apunta con
// GESTION_NAV.seccion({ id, pan, etiqueta, orden, juego?, cargar? }): sin `juego` es una pestaña de Global; `pan` es el id de su panel en index.html y `cargar` se llama cada vez que se abre.
// Quien cambia la etiqueta de una pestaña (por ejemplo, con un contador) usa GESTION_NAV.etiqueta(id, texto, juego?). Esto solo muestra y oculta: no sabe de datos.
'use strict';
const GESTION_NAV = (() => {
  const JUEGOS = [['rumble', 'Rumble'], ['td', 'TD'], ['survivors', 'Survivors'], ['decks', 'Decks'], ['tacticas', 'Tácticas'], ['nova', 'Nova'], ['crush', 'Crush'], ['ratkov', 'Ratkov'], ['rouflage', 'Rouflage'], ['taxi', 'Taxi']];
  const S = [], el = id => document.getElementById(id), ambito = s => s.juego || 'global';
  const recuerda = {};   // la pestaña abierta en cada ámbito
  let actual = 'global';
  const seccion = s => { S.push(s); };
  const de = a => S.filter(s => ambito(s) === a).sort((x, y) => (x.orden || 0) - (y.orden || 0));
  const buscar = (id, juego) => S.find(s => s.id === id && ambito(s) === (juego || 'global'));
  function pinta() {
    const L = de(actual), id = recuerda[actual] && L.some(s => s.id === recuerda[actual]) ? recuerda[actual] : (L[0] || {}).id;
    document.querySelectorAll('#menu button[data-j]').forEach(b => b.classList.toggle('activa', b.dataset.j === actual));
    el('tabs').innerHTML = L.map(s => `<button type="button" data-s="${s.id}"${s.id === id ? ' class="activa"' : ''}>${s.etiqueta}</button>`).join('');
    el('tabs').hidden = L.length < 2;
    S.forEach(s => { el(s.pan).hidden = true; });
    const s = L.find(x => x.id === id); if (!s) return;
    el(s.pan).hidden = false; recuerda[actual] = id;
    if (s.cargar) s.cargar(s.juego || null);
  }
  function ir(juego, id) { actual = juego || 'global'; if (id) recuerda[actual] = id; pinta(); }
  function etiqueta(id, texto, juego) {
    const s = buscar(id, juego); if (!s) return;
    s.etiqueta = texto; const b = el('tabs').querySelector(`button[data-s="${id}"]`); if (b && ambito(s) === actual) b.textContent = texto;
  }
  function arranca() {
    el('menu').innerHTML = '<button type="button" class="activa" data-j="global">Global</button><span class="sep"></span>' + JUEGOS.map(([id, n]) => `<button type="button" data-j="${id}">${n}</button>`).join('');
    el('menu').onclick = ev => { const b = ev.target.closest('button[data-j]'); if (b) ir(b.dataset.j); };
    el('tabs').onclick = ev => { const b = ev.target.closest('button[data-s]'); if (b) ir(actual, b.dataset.s); };
    el('salir').addEventListener('click', () => { Object.keys(recuerda).forEach(k => { delete recuerda[k]; }); ir('global'); });
    pinta();
  }
  return { JUEGOS, seccion, etiqueta, ir, arranca, actual: () => actual };
})();
