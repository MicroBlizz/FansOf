// Fans Of · LA PORTADA · reparte las tarjetas de la biblioteca en sus grupos (ADR 102, 103 y 104): Nuestros favoritos, Los más pedidos, Prototipos y Archivo.
// Prototipos y Archivo van plegados (y se acuerdan de si los abriste en este navegador). Usa GRUPOS (biblioteca/grupos.js), esc() y t() de la página.
// Lo que un enlace señala (#prototipos, #archivo…) despliega su grupo.
'use strict';
const AGRUPAR = (() => {
  const GUARDADO = 'fansof-portada-abiertos', PLEGABLES = ['lista-prototipos', 'lista-archivo'];
  const leer = () => { try { const l = JSON.parse(localStorage.getItem(GUARDADO) || '[]'); return Array.isArray(l) ? l : []; } catch (e) { return []; } };
  const guardar = l => { try { localStorage.setItem(GUARDADO, JSON.stringify(l)); } catch (e) { /* sin almacenamiento: vale mientras la página esté abierta */ } };
  const rejilla = id => document.querySelector(`#${id} .rejilla`);
  // LOS MÁS PEDIDOS: los 4 prototipos con más votos (ADR 103). Llega cuando contesta el servidor (votos.js); si no contesta, no sale.
  function crearMasPedidos() {
    const sec = document.createElement('div'); sec.className = 'subsec'; sec.id = 'mas-pedidos';
    sec.innerHTML = `<h3 class="grupo ol">${esc(t('LOS MÁS PEDIDOS'))}</h3><p class="note grupo">${esc(t('Todo lo que hay aquí son prototipos: pruebas en las que trabajamos. Lo que votáis decide en cuáles nos centramos.'))}</p><div class="rejilla"></div>`;
    (document.getElementById('lista-favoritos') || document.querySelector('#biblioteca .note')).after(sec);
    return sec;
  }
  function destacar(datos) {
    const ids = [...document.querySelectorAll('#lista-prototipos section.game')].map(s => s.id.replace(/^g-/, ''));
    const top = GRUPOS.masPedidos(datos, ids);
    if (!top.length || document.getElementById('mas-pedidos')) return;
    const caja = crearMasPedidos().querySelector('.rejilla');
    top.forEach(({ id, puntos }, i) => {
      const s = document.getElementById('g-' + id); s.dataset.puesto = String(i + 1);   // votos.js no la recoloca dentro de este grupo
      s.insertAdjacentHTML('afterbegin', `<div class="puesto ol">${esc(t('Nº {n}', { n: i + 1 }))} · ${esc(puntos === 1 ? t('1 punto') : t('{p} puntos', { p: puntos }))}</div>`);
      caja.append(s);
    });
    const resto = document.querySelector('#lista-prototipos .cuantos'); if (resto) resto.textContent = String(document.querySelectorAll('#lista-prototipos section.game').length);
  }
  // el título pasa a ser lo que se pulsa para desplegar; dentro quedan la nota y la rejilla
  function plegar(id, abiertos) {
    const sub = document.getElementById(id); if (!sub) return;
    const det = document.createElement('details'); det.className = 'plegable'; det.open = abiertos.includes(id);
    const res = document.createElement('summary'), n = sub.querySelectorAll('section.game').length;
    res.append(sub.querySelector('h3.grupo'));
    res.insertAdjacentHTML('beforeend', `<span class="cuantos">${n}</span>`);
    det.append(res, ...sub.querySelectorAll(':scope > :not(details)'));
    sub.append(det);
    det.addEventListener('toggle', () => { const l = leer().filter(x => x !== id); if (det.open) l.push(id); guardar(l); });
  }
  function abrirElDe(hash) {
    const el = hash.length > 1 && document.getElementById(hash.slice(1));
    const det = el && el.closest('details.plegable'); if (det) det.open = true;
  }
  function colocar(tarjetas) {
    const sitio = { favoritos: 'lista-favoritos', prototipos: 'lista-prototipos', archivo: 'lista-archivo' };
    for (const s of tarjetas) rejilla(sitio[GRUPOS.de(s.dataset.tipo, 'favorito' in s.dataset)]).append(s);
    document.querySelectorAll('#biblioteca .subsec').forEach(g => { if (!g.querySelector('section.game')) g.remove(); });
    const abiertos = leer();
    PLEGABLES.forEach(id => plegar(id, abiertos));
    addEventListener('hashchange', () => abrirElDe(location.hash));
    abrirElDe(location.hash);
  }
  return { colocar, destacar };
})();
