// Fans Of · /gestion · ENLACE DIRECTO (tarea #338, ADR 211): la dirección de la página dice siempre dónde estás, para copiarla o compartirla y que abra
// lo mismo: ?seccion=<pestaña común>, ?juego=<id>&seccion=<pestaña de ese juego>, ?grupo=juegos (la lista de juegos), y detrás lo que tenga seleccionado
// esa pestaña (el Tablero, &tarea=N; Recursos, &rjuego y &ver). Funciones puras, sin `location` ni `history`: nav.js las usa con la página de verdad.
'use strict';
const GESTION_ENLACE = (() => {
  const ID = /^[a-z0-9][a-z0-9_-]{0,39}$/i;   // un id de grupo, juego o pestaña: nada raro entra en la página desde un enlace
  const id = v => (typeof v === 'string' && ID.test(v) ? v : null);
  // La carpeta de /gestion a partir de `pathname`: vale en producción (/FansOf/gestion/) y en la alfa (/FansOf/alfa/gestion/), con o sin index.html y la barra
  function carpeta(pathname) {
    const ruta = String(pathname || '/');
    const ultimo = ruta.slice(ruta.lastIndexOf('/') + 1);
    if (ultimo.includes('.')) return ruta.slice(0, ruta.length - ultimo.length);
    return ultimo ? ruta + '/' : ruta;
  }
  // Los parámetros de un sitio ({ grupo, juego, seccion }) y lo seleccionado (pares [clave, valor]; una clave puede repetirse). Lo vacío no se escribe
  function parametros(sitio, extra = []) {
    const p = new URLSearchParams();
    if (sitio.juego) p.append('juego', sitio.juego);
    if (sitio.seccion) p.append('seccion', sitio.seccion);
    else if (!sitio.juego && sitio.grupo) p.append('grupo', sitio.grupo);
    for (const [clave, valor] of extra) if (valor !== null && valor !== undefined && valor !== '') p.append(clave, String(valor));
    return p;
  }
  // La dirección completa: loc es { origin, pathname } (location)
  const arma = (loc, sitio, extra) => `${loc.origin}${carpeta(loc.pathname)}?${parametros(sitio, extra)}`;
  // Lo que pide un enlace (`location.search`): { grupo, juego, seccion } (null lo que no diga o no valga) y `valores(clave)`, todos los de esa clave
  function lee(search) {
    const p = new URLSearchParams(String(search || ''));
    return Object.freeze({ grupo: id(p.get('grupo')), juego: id(p.get('juego')), seccion: id(p.get('seccion')), valores: clave => p.getAll(clave) });
  }
  return Object.freeze({ carpeta, parametros, arma, lee });
})();
