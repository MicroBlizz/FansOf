// Fans Of · el panel ALFA de la librería: solo lo ve quien ha entrado con una cuenta con el rol «alfa» (servidor/34-alfa-roles.sql).
// Lista los juegos de la copia de pruebas (alfa/actual.json, lo escribe la Action alfa.yml) con su versión y los enlaza a alfa/games/<juego>/.
// Sin rol, sin sesión o sin esa función en la base de datos no se enseña nada, ni un botón. Usa lo que define index.html: t(), esc(), CUENTA.
'use strict';
(() => {
  if (NUCLEO.alfa || !CUENTA.activa) return;   // en la propia copia de pruebas no hace falta
  const base = location.pathname.replace(/[^/]*$/, '');
  async function pintar() {
    if (document.getElementById('alfa-panel') || CUENTA.invitado) return;
    let tiene = false;
    try { tiene = await CUENTA.rpc('tiene_rol', { p_rol: 'alfa' }); } catch (e) { return; }
    if (!tiene) return;
    let a; try { a = await (await fetch(base + 'alfa/actual.json', { cache: 'no-store' })).json(); } catch (e) { return; }
    const lugar = [...document.querySelectorAll('h2.sec')].pop(); if (!lugar) return;
    const sec = document.createElement('section'); sec.id = 'alfa-panel';
    const fecha = a.fecha ? new Date(a.fecha).toLocaleString() : '';
    sec.innerHTML = `<h2 class="sec ol">${esc(t('ALFA'))}</h2>
      <p class="note">${esc(t('Copia de pruebas con lo último de main.'))} <b>${esc(a.hash || '')}</b> · ${esc(fecha)}<br>${esc(a.mensaje || '')}</p>
      <div class="partes">${Object.entries(a.juegos || {}).map(([j, v]) => `<a href="${base}alfa/games/${esc(j)}/"><b>${esc(j)}</b><span>${esc(v)}</span></a>`).join('')}</div>`;
    lugar.closest('section').before(sec);
  }
  document.addEventListener('cuenta-cambio', pintar);
  window.addEventListener('load', () => setTimeout(pintar, 800));
})();
