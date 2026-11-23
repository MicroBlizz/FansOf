// Fans Of · LA PORTADA · qué marcas lleva cada tarjeta tras los cambios de /gestion → Juegos (ADR 203). Regla pura: sin pantalla, almacenamiento ni red.
// La usa biblioteca/portada-juegos.js. Cada tarjeta se describe con lo que dice el repo en su <section> de index.html:
//   { id, tipo: 'Prototipo'|'Archivo', favorito, archivo: texto de data-archivo, alfa: lleva data-alfa }.
// De ahí sale el catálogo que pide JUEGOS_PORTADA (core/js/sistema/juegos-portada.js), con el mismo estado que herramientas/juegos_catalogo.py,
// y, con las filas y la plataforma, las marcas que hacen que grupos.js, agrupar.js y tienda.js la pinten en su sitio:
//   archivo    → data-tipo «Archivo», sin data-favorito (un favorito archivado deja de serlo) y data-archivo con su motivo (el del repo o, si no tenía, el de siempre).
//   favoritos  → data-tipo «Prototipo», con data-favorito y sin data-archivo.
//   prototipos → data-tipo «Prototipo», sin data-favorito ni data-archivo.
//   oculta     → fuera de la portada (hidden).
'use strict';
const PORTADA_JUEGOS_REGLA = (() => {
  const TEXTO_ARCHIVO = 'Archivado: ya no lo mantenemos. Se juega tal cual está, sin arreglos. Si quieres que vuelva, vota aquí.';   // su inglés, en biblioteca/en.js

  const estadoDe = r => {
    if (r.tipo === 'Archivo') return 'archivo';
    return r.alfa ? 'alfa' : 'vivo';
  };
  const catalogoDe = repos => repos.map(r => ({ id: r.id, estado: estadoDe(r), favorito: !!r.favorito }));

  const marcasDe = (repo, seccion) => {
    if (seccion === 'archivo') return { tipo: 'Archivo', favorito: false, archivo: repo.archivo || TEXTO_ARCHIVO };
    return { tipo: 'Prototipo', favorito: seccion === 'favoritos', archivo: '' };
  };

  // Una entrada congelada por tarjeta, en su orden: { id, seccion, tipo, favorito, archivo, oculta }. Sin filas, las marcas son las del repo.
  const plan = (repos, filas, plataforma) => JUEGOS_PORTADA.aplica(catalogoDe(repos), filas, plataforma).map((a, i) => Object.freeze({
    id: a.id, seccion: a.seccion, ...marcasDe(repos[i], a.seccion), oculta: !a.enPortada,
  }));

  // ¿Cambia algo de lo que se ve entre dos planes? (para recolocar solo si hace falta)
  const difieren = (a, b) => JSON.stringify(a) !== JSON.stringify(b);

  return Object.freeze({ catalogoDe, plan, difieren, TEXTO_ARCHIVO });
})();
