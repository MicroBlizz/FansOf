// Fans of Pop · el aviso de «hay más abajo» en las ventanas que se deslizan (tarea 436, boceto A de Pepins): sin barras de
// desplazamiento (css/barras.css) no se notaba que una ventana seguía. Abajo sale un difuminado con una flechita tenue que bota:
// - en la ventana (#pp-tarjeta), un aviso pegado al fondo, como la franja del título se pega arriba, con el marco repintado encima;
// - en las listas que se deslizan por dentro (tienda, pase, ranking, perfil…), el difuminado en la propia lista y la flechita suelta
//   encima, en su fondo.
// Se va al llegar al final y no sale en lo que no se desliza. Las cuentas: PP_HAY_MAS (js/hay-mas-regla.js). El dibujo: css/hay-mas.css.
'use strict';
const PP_HAY_MAS_VISTA = {
  // las listas con desplazamiento propio dentro de una ventana (las de overflow auto de css/pop.css y css/memoria.css)
  LISTAS: '.pp-packs, .pp-pase, .pp-ranking, .pp-pf-lista, .pp-cz-lista, .pp-mem-mundos',
  // los pies de algunas ventanas (Amigos, pase): si están pegados abajo (sticky), el aviso va justo encima de ellos
  PIES: ['.pp-am-pie', '.pp-pase-pie', '.pp-pase-cajon'].map(s => ':scope > ' + s).join(', '),
  pedido: false,      // ya hay una mirada pedida para el siguiente fotograma
  tamanos: null,      // vigila el tamaño de lo de dentro de la ventana (imágenes que cargan, el cajón del pase que se abre)

  // se desliza de verdad (overflow auto o scroll; Memoria a pantalla completa es hidden) y queda algo debajo
  queda(c) {
    const o = getComputedStyle(c).overflowY;
    return (o === 'auto' || o === 'scroll') && PP_HAY_MAS.queda(c.scrollTop, c.clientHeight, c.scrollHeight);
  },
  flechaNueva() {
    const f = document.createElement('span'); f.className = 'pp-hay-mas-flecha'; f.setAttribute('aria-hidden', 'true');
    f.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>';
    return f;
  },
  // el aviso de la ventana `t`: se crea la primera vez (encima del pie, si lo hay) y se coloca en el fondo de lo que se ve
  aviso(t) {
    let a = t.querySelector(':scope > .pp-hay-mas');
    const pie = [...t.querySelectorAll(this.PIES)].find(p => getComputedStyle(p).position === 'sticky') || null;
    if (!a) { a = document.createElement('div'); a.className = 'pp-hay-mas'; a.setAttribute('aria-hidden', 'true'); a.append(this.flechaNueva()); }
    // siempre lo último (o justo antes del pie): si una ventana añade algo después, el aviso baja; si no, se quedaría a media lista
    if (a.parentNode !== t || a.nextElementSibling !== (pie || null)) t.insertBefore(a, pie);
    const est = getComputedStyle(t);
    a.style.marginTop = -(a.offsetHeight + (parseFloat(est.rowGap) || 0)) + 'px';   // no ocupa sitio: se pinta sobre lo de abajo
    // el sticky se mide desde dentro del relleno (como la franja del título, css/pop.css): para llegar al borde, el relleno en negativo
    a.style.bottom = (pie ? pie.offsetHeight : -(parseFloat(est.paddingBottom) || 0)) + 'px';
    a.classList.toggle('pp-hay-mas-pie', !!pie);
    return a;
  },
  // la flechita de cada lista de `listas`, suelta en #pp-modal y puesta en el fondo de su lista (PP_HAY_MAS.flecha)
  flechas(m, t, listas) {
    const sueltas = [...m.querySelectorAll(':scope > .pp-hay-mas-suelta')];
    const rm = m.getBoundingClientRect(), rt = t.getBoundingClientRect(), cab = t.querySelector(':scope > .pp-cab');
    const zona = { top: cab ? cab.getBoundingClientRect().bottom : rt.top, bottom: rt.bottom };
    const escala = rm.width / m.offsetWidth;
    listas.forEach((l, i) => {
      let f = sueltas[i];
      if (!f) { f = this.flechaNueva(); f.classList.add('pp-hay-mas-suelta'); m.append(f); }
      const p = PP_HAY_MAS.flecha(l.getBoundingClientRect(), zona, rm, escala);
      f.hidden = !p.ve;
      f.style.left = p.x + 'px'; f.style.top = p.y + 'px';
    });
    for (const f of sueltas.slice(listas.length)) f.remove();
  },
  // lo de dentro de la ventana, vigilado por tamaño. Solo se cambia lo vigilado si cambian las piezas (otra ventana): empezar a vigilar
  // avisa una vez, y hacerlo en cada mirada no pararía nunca
  vigilados: [],
  vigila(t) {
    const hijos = [...t.children].filter(h => !h.classList.contains('pp-hay-mas'));
    if (hijos.length === this.vigilados.length && hijos.every((h, i) => h === this.vigilados[i])) return;
    this.tamanos.disconnect();
    for (const h of hijos) this.tamanos.observe(h);
    this.vigilados = hijos;
  },
  mira() {
    const m = document.querySelector('#pp-modal'), t = document.querySelector('#pp-tarjeta');
    if (!m || !t) return;
    // cerrada, o la victoria y la derrota (caben siempre, ppVicEncaja, y no llevan fondo de ventana): sin avisos
    const nada = m.hidden || t.classList.contains('pp-gana');
    const queda = !nada && this.queda(t);
    if (queda || t.querySelector(':scope > .pp-hay-mas')) this.aviso(t).classList.toggle('pp-hay-mas-si', queda);
    const listas = [];
    for (const l of t.querySelectorAll(this.LISTAS)) {
      const q = !nada && this.queda(l);
      l.classList.toggle('pp-hay-mas-lista', q);
      if (q) listas.push(l);
    }
    this.flechas(m, t, listas);
    if (this.tamanos && !nada) this.vigila(t);
  },
  // se mira al cambiar lo de dentro, su tamaño o la clase de la ventana, al deslizar y al girar el móvil; una vez por fotograma
  pide() {
    if (this.pedido) return;
    this.pedido = true;
    requestAnimationFrame(() => { this.pedido = false; this.mira(); });
  },
  empieza() {
    const m = document.querySelector('#pp-modal'), t = document.querySelector('#pp-tarjeta');
    if (!m || !t) return;
    const pide = () => this.pide();
    new MutationObserver(pide).observe(t, { childList: true, subtree: true });
    new MutationObserver(pide).observe(t, { attributes: true, attributeFilter: ['class'] });   // p. ej. el cajón del pase
    new MutationObserver(pide).observe(m, { attributes: true, attributeFilter: ['hidden'] });
    if (typeof ResizeObserver === 'function') this.tamanos = new ResizeObserver(pide);
    m.addEventListener('scroll', pide, { capture: true, passive: true });   // el scroll no sube: se coge al bajar
    addEventListener('resize', pide);
    this.pide();
  },
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => PP_HAY_MAS_VISTA.empieza());
else PP_HAY_MAS_VISTA.empieza();
