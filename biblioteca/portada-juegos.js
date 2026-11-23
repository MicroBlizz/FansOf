// Fans Of · LA PORTADA · aplica los cambios de /gestion → Juegos (ADR 203) a las tarjetas de index.html: cada una a su sección y fuera de la portada las quitadas.
// Se carga después de flags.js, juegos-portada.js, juegos-portada-datos.js y portada-juegos-regla.js, y ANTES de novedades/ventana.js y tienda.js:
//   · al cargar, sin esperar a la red, aplica las filas guardadas en el navegador: cambia data-tipo, data-favorito y data-archivo (de eso tiran grupos.js,
//     agrupar.js, tienda.js y votos.js), lleva la tarjeta a la rejilla de su sección y esconde (hidden) las que no salen; así la portada no salta.
//   · si luego llegan filas que cambian algo, recoloca una sola vez con la página ya montada (AGRUPAR.recolocar) y avisa con «portada:recolocada»
//     (el catálogo de la portada nueva vuelve a leer las tarjetas). Novedades se queda con lo de la carga: lo nuevo sale al volver a abrir la portada.
// Sin filas no toca nada: todo como en el repo. La regla está en portada-juegos-regla.js (PORTADA_JUEGOS_REGLA).
'use strict';
const PORTADA_JUEGOS = (() => {
  const R = PORTADA_JUEGOS_REGLA, D = JUEGOS_PORTADA_DATOS;
  const tarjetas = [...document.querySelectorAll('section.game')];
  const repos = tarjetas.map(s => ({ id: s.id.replace(/^g-/, ''), tipo: s.dataset.tipo || '', favorito: 'favorito' in s.dataset, archivo: s.dataset.archivo || '', alfa: 'alfa' in s.dataset }));
  const planDe = filas => R.plan(repos, filas, D.plataforma());
  let puesto = planDe([]);   // lo que se ve ahora (al empezar, lo del repo)

  const pon = (s, nombre, valor) => { if (valor) s.dataset[nombre] = valor === true ? '' : valor; else delete s.dataset[nombre]; };
  const marca = (s, p) => {
    s.dataset.tipo = p.tipo; pon(s, 'favorito', p.favorito); pon(s, 'archivo', p.archivo);
    s.hidden = p.oculta;
  };
  // la etiqueta de tipo que tienda.js pinta solo en las del Archivo
  const etiquetaTipo = s => {
    const v = s.querySelector(':scope > .tipo'), img = s.querySelector(':scope > .cap-img');
    if (s.dataset.archivo && !v && img) { const e = document.createElement('span'); e.className = 'tipo'; e.textContent = s.dataset.tipo; img.after(e); }
    if (!s.dataset.archivo && v) v.remove();
  };
  // las tarjetas cuyo plan cambia; las marca y devuelve cuáles y si cambian de sección
  const aplica = plan => {
    const cambiadas = [];
    plan.forEach((p, i) => {
      if (!R.difieren(p, puesto[i]) || !tarjetas[i].isConnected) return;   // fuera de la página: la de alfa que tienda.js quitó en la web no vuelve
      marca(tarjetas[i], p);
      cambiadas.push({ s: tarjetas[i], seccion: p.seccion !== puesto[i].seccion ? p.seccion : null });
    });
    puesto = plan;
    return cambiadas;
  };

  // al cargar: antes de que agrupar.js reparta, así que basta con llevarla a la rejilla de su sección
  for (const { s, seccion } of aplica(planDe(D.filas()))) {
    const rejilla = seccion && document.querySelector(`#lista-${seccion} .rejilla`);
    if (rejilla) rejilla.append(s);
  }

  const tarde = () => {
    const cambiadas = aplica(planDe(D.filas()));
    if (!cambiadas.length) return;
    cambiadas.forEach(c => etiquetaTipo(c.s));
    AGRUPAR.recolocar(cambiadas.map(c => c.s));
    document.dispatchEvent(new CustomEvent('portada:recolocada'));
  };
  // las filas que llegan de la red: con la página ya montada (tienda.js y agrupar.js ya han pasado)
  D.alCambiar(() => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tarde, { once: true }); else tarde();
  });
  return Object.freeze({ plan: () => puesto });
})();
