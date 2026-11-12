// Fans Of · LA PORTADA · reparte las tarjetas de la biblioteca en sus grupos (ADR 102): Juega ya, Próximamente, Prototipos y En pausa.
// Prototipos y En pausa van plegados (y se acuerdan de si los abriste en este navegador). Usa GRUPOS (biblioteca/grupos.js), esc() y t() de la página.
// Lo que el menú o un enlace señala (#prototipos, #en-pausa…) despliega su grupo.
'use strict';
const AGRUPAR = (() => {
  const GUARDADO = 'fansof-portada-abiertos', PLEGABLES = ['lista-prototipos', 'en-pausa'];
  const leer = () => { try { const l = JSON.parse(localStorage.getItem(GUARDADO) || '[]'); return Array.isArray(l) ? l : []; } catch (e) { return []; } };
  const guardar = l => { try { localStorage.setItem(GUARDADO, JSON.stringify(l)); } catch (e) { /* sin almacenamiento: vale mientras la página esté abierta */ } };
  const rejilla = id => document.querySelector(`#${id} .rejilla`);
  function crearProximamente() {
    const sec = document.createElement('div'); sec.className = 'subsec'; sec.id = 'proximamente';
    sec.innerHTML = `<h3 class="grupo ol">${esc(t('PRÓXIMAMENTE'))}</h3><p class="note grupo">${esc(t('Los juegos que vienen en camino. Vota en su ficha los que más quieres que salgan.'))}</p><div class="rejilla"></div>`;
    document.getElementById('lista-juegos').after(sec);
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
  function colocar(tarjetas, jugable) {
    crearProximamente();
    const sitio = { jugar: 'lista-juegos', proximamente: 'proximamente', prototipos: 'lista-prototipos', pausa: 'en-pausa' };
    for (const s of tarjetas) rejilla(sitio[GRUPOS.de(s.dataset.tipo, jugable(s))]).append(s);
    document.querySelectorAll('#biblioteca .subsec').forEach(g => { if (!g.querySelector('section.game')) g.remove(); });
    const abiertos = leer();
    PLEGABLES.forEach(id => plegar(id, abiertos));
    addEventListener('hashchange', () => abrirElDe(location.hash));
    abrirElDe(location.hash);
  }
  return { colocar };
})();
