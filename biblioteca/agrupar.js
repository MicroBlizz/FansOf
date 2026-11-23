// Fans Of · LA PORTADA · reparte las tarjetas de la biblioteca en sus grupos (ADR 102, 103 y 104): Nuestros favoritos, Los más pedidos, Prototipos y Archivo.
// Prototipos y Archivo van plegados (y se acuerdan de si los abriste en este navegador). Usa GRUPOS (biblioteca/grupos.js), esc() y t() de la página.
// Lo que un enlace señala (#prototipos, #archivo…) despliega su grupo.
// Los puntos que llegan del servidor se guardan para quien los pida: alVotos(fn) llama a fn con ellos (ya, si ya llegaron), lo usa el orden «Más votados» del catálogo.
// Mientras no llegan, un aviso ocupa el sitio de LOS MÁS PEDIDOS (esperarPedidos); si el servidor no contesta tras los reintentos de votos.js, el aviso
// ofrece REINTENTAR (sinPedidos). Lleva data-sin-tarjetas: contar() no lo esconde por no tener tarjetas (igual que la fila de favoritos de portada-catalogo.js).
// Una tarjeta escondida (hidden: /gestion → Juegos la quita de la portada, ADR 203) no cuenta en ningún grupo ni entra en «Los más pedidos»; un grupo sin
// ninguna tarjeta que se vea se esconde. recolocar(tarjetas) vuelve a poner en su grupo las que /gestion cambió después de colocar (portada-juegos.js).
'use strict';
const AGRUPAR = (() => {
  const GUARDADO = 'fansof-portada-abiertos', PLEGABLES = ['lista-prototipos', 'lista-archivo'];
  const leer = () => { try { const l = JSON.parse(localStorage.getItem(GUARDADO) || '[]'); return Array.isArray(l) ? l : []; } catch (e) { return []; } };
  const guardar = l => { try { localStorage.setItem(GUARDADO, JSON.stringify(l)); } catch (e) { /* sin almacenamiento: vale mientras la página esté abierta */ } };
  const rejilla = id => document.querySelector(`#${id} .rejilla`);
  const VISIBLES = 'section.game:not([hidden])';
  const SITIO = { favoritos: 'lista-favoritos', prototipos: 'lista-prototipos', archivo: 'lista-archivo' };
  const sitioDe = s => SITIO[GRUPOS.de(s.dataset.tipo, 'favorito' in s.dataset)];
  // LOS MÁS PEDIDOS: los 4 prototipos con más votos (ADR 103). Llega cuando contesta el servidor (votos.js); hasta entonces, el aviso de espera.
  function crearMasPedidos() {
    const sec = document.createElement('div'); sec.className = 'subsec'; sec.id = 'mas-pedidos';
    sec.innerHTML = `<h3 class="grupo ol">${esc(t('LOS MÁS PEDIDOS'))}</h3><p class="note grupo">${esc(t('Todo lo que hay aquí son prototipos: pruebas en las que trabajamos. Lo que votáis decide en cuáles nos centramos.'))}</p><div class="rejilla"></div>`;
    sitioPedidos().after(sec);
    return sec;
  }
  const sitioPedidos = () => document.getElementById('lista-favoritos') || document.querySelector('#biblioteca .note');
  function avisoPedidos() {
    let a = document.getElementById('pedidos-espera'); if (a) return a;
    a = document.createElement('div'); a.className = 'subsec pedidos-espera'; a.id = 'pedidos-espera'; a.dataset.sinTarjetas = '';
    a.setAttribute('role', 'status'); sitioPedidos().after(a);
    return a;
  }
  function esperarPedidos() {
    if (votos) return;
    avisoPedidos().innerHTML = `<h3 class="grupo ol">${esc(t('LOS MÁS PEDIDOS'))}</h3><p class="note grupo">${esc(t('Cargando los votos…'))}</p>`;
  }
  // reintentar: lo que vuelve a pedir los puntos (votos.js); el botón pone otra vez el aviso de espera
  function sinPedidos(reintentar) {
    if (votos) return;
    const a = avisoPedidos();
    a.innerHTML = `<h3 class="grupo ol">${esc(t('LOS MÁS PEDIDOS'))}</h3><p class="note grupo">${esc(t('No hemos podido traer los votos.'))}</p>
      <button type="button" class="boton pedidos-reintentar ol">${esc(t('REINTENTAR'))}</button>`;
    a.querySelector('button').addEventListener('click', () => { esperarPedidos(); reintentar(); });
  }
  let votos = null; const oyentes = [];
  const alVotos = fn => { if (votos) fn(votos); else oyentes.push(fn); };
  function destacar(datos) {
    votos = datos; oyentes.splice(0).forEach(fn => fn(datos));
    const aviso = document.getElementById('pedidos-espera'); if (aviso) aviso.remove();
    ponerPedidos();
  }
  // LOS MÁS PEDIDOS con los votos guardados, sobre los prototipos que se ven
  function ponerPedidos() {
    const ids = [...document.querySelectorAll(`#lista-prototipos ${VISIBLES}`)].map(s => s.id.replace(/^g-/, ''));
    const top = GRUPOS.masPedidos(votos, ids);
    if (!top.length || document.getElementById('mas-pedidos')) return;
    const caja = crearMasPedidos().querySelector('.rejilla');
    top.forEach(({ id, puntos }, i) => {
      const s = document.getElementById('g-' + id); s.dataset.puesto = String(i + 1);   // votos.js no la recoloca dentro de este grupo
      s.insertAdjacentHTML('afterbegin', `<div class="puesto ol">${esc(t('Nº {n}', { n: i + 1 }))} · ${esc(puntos === 1 ? t('1 punto') : t('{p} puntos', { p: puntos }))}</div>`);
      caja.append(s);
    });
    const resto = document.querySelector('#lista-prototipos .cuantos'); if (resto) resto.textContent = String(document.querySelectorAll(`#lista-prototipos ${VISIBLES}`).length);
  }
  // el título pasa a ser lo que se pulsa para desplegar; dentro quedan la nota y la rejilla
  function plegar(id, abiertos) {
    const sub = document.getElementById(id); if (!sub) return;
    const det = document.createElement('details'); det.className = 'plegable'; det.open = abiertos.includes(id);
    const res = document.createElement('summary'), n = sub.querySelectorAll(VISIBLES).length;
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
  // cada grupo se ve si tiene alguna tarjeta que se vea; el número del título plegable cuenta solo esas
  function contar() {
    document.querySelectorAll('#biblioteca .subsec:not([data-sin-tarjetas])').forEach(g => {
      const n = g.querySelectorAll(VISIBLES).length, c = g.querySelector('summary .cuantos');
      g.hidden = !n; if (c) c.textContent = String(n);
    });
  }
  function colocar(tarjetas) {
    for (const s of tarjetas) rejilla(sitioDe(s)).append(s);
    contar();
    const abiertos = leer();
    PLEGABLES.forEach(id => plegar(id, abiertos));
    addEventListener('hashchange', () => abrirElDe(location.hash));
    abrirElDe(location.hash);
  }
  const quitaPuesto = s => { const p = s.querySelector(':scope > .puesto'); if (p) p.remove(); delete s.dataset.puesto; };
  // con los votos ya llegados, «Los más pedidos» se rehace desde cero: sus tarjetas vuelven a Prototipos y se vuelven a elegir (sin huecos en la numeración)
  function rehacerPedidos() {
    const sec = document.getElementById('mas-pedidos');
    if (sec) { for (const s of [...sec.querySelectorAll('section.game')]) { quitaPuesto(s); rejilla('lista-prototipos').append(s); } sec.remove(); }
    ponerPedidos();
  }
  // las que /gestion cambió con la portada ya pintada: cada una al final de su grupo; si ya habían llegado los votos, se rehace «Los más pedidos»
  function recolocar(tarjetas) {
    for (const s of tarjetas) {
      if (s.closest('#mas-pedidos') && sitioDe(s) === 'lista-prototipos') continue;   // sigue siendo un prototipo: rehacerPedidos decide
      quitaPuesto(s); rejilla(sitioDe(s)).append(s);
    }
    if (votos) rehacerPedidos();
    contar();
  }
  return { colocar, destacar, alVotos, recolocar, esperarPedidos, sinPedidos };
})();
