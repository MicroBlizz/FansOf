// Fans Of · /gestion, pestaña RECURSOS: las reglas de las FECHAS (dominio: sin red, reloj, DOM ni almacenamiento; «ahora» llega de fuera). La fecha de
// cada archivo es la del commit que lo subió a la rama recursos (recursos-github.js, fechas()); aquí: qué archivos de cada ficha hay que fechar, la fecha
// de una ficha (la más nueva de sus archivos), el orden de la lista (más nuevas, más antiguas o por nombre), el tramo de día de cada ficha (Hoy, Ayer,
// Esta semana, Este último mes, Antes) y su fecha en palabras («hoy 08:39», «hace 3 días»), y lo que se recuerda en el navegador (por ruta, con su sha).
// Lo usa recursos.js (tarea 388). Guía: docs/guia/herramientas/galeria.md
'use strict';
const RECURSOS_FECHAS = (() => {
  const DIA = 86400000;
  const ORDENES = ['nuevas', 'viejas', 'nombre'];
  const TRAMOS = ['Hoy', 'Ayer', 'Esta semana', 'Este último mes', 'Antes', 'Sin fecha'];

  /** Los archivos de una ficha que dan su fecha: el -cadena.json de un encargo (se sube al acabar), las salidas de un grupo o el archivo suelto */
  const rutasDe = f => (f.tipo === 'encargo' || !f.salidas ? [f.ruta] : f.salidas);
  /** La fecha de una ficha (ISO): la más nueva de sus archivos; null si no se sabe ninguna */
  function fechaDe(f, fechas) {
    const l = rutasDe(f).map(r => fechas[r]).filter(Boolean).sort();
    return l.length ? l[l.length - 1] : null;
  }
  const porNombre = (a, b) => (a.nombre < b.nombre ? -1 : a.nombre > b.nombre ? 1 : 0);
  /** La lista ordenada (una copia): «nuevas» (por defecto) o «viejas» por fecha, lo que no tiene fecha al final y por nombre; «nombre», de la A a la Z */
  function ordena(fichas, fechas, orden) {
    const conFecha = fichas.map(f => ({ f, d: fechaDe(f, fechas) }));
    const signo = orden === 'viejas' ? 1 : -1;
    const cmp = orden === 'nombre' ? (a, b) => porNombre(a.f, b.f)
      : (a, b) => (!a.d - !b.d) || (a.d && b.d && a.d !== b.d ? (a.d < b.d ? -signo : signo) : 0) || porNombre(a.f, b.f);
    return conFecha.sort(cmp).map(x => x.f);
  }
  const medianoche = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  // cuántos días de calendario (hora local) van de la fecha a ahora: 0 hoy, 1 ayer…
  const dias = (iso, ahora) => Math.round((medianoche(ahora) - medianoche(Date.parse(iso))) / DIA);
  /** El tramo de la lista en que cae una fecha (TRAMOS); «Sin fecha» si no la hay */
  function tramo(iso, ahora) {
    if (!iso || Number.isNaN(Date.parse(iso))) return 'Sin fecha';
    const n = dias(iso, ahora);
    return n <= 0 ? 'Hoy' : n === 1 ? 'Ayer' : n < 7 ? 'Esta semana' : n < 31 ? 'Este último mes' : 'Antes';
  }
  const dos = n => String(n).padStart(2, '0');
  /** La fecha en palabras para la ficha: «hoy 08:39», «ayer 22:10», «hace 3 días», «hace 2 semanas» o «20-10-2026»; '' sin fecha */
  function texto(iso, ahora) {
    if (!iso || Number.isNaN(Date.parse(iso))) return '';
    const d = new Date(iso), n = dias(iso, ahora), hora = dos(d.getHours()) + ':' + dos(d.getMinutes());
    if (n <= 0) return 'hoy ' + hora;
    if (n === 1) return 'ayer ' + hora;
    if (n < 7) return `hace ${n} días`;
    if (n < 31) { const s = Math.floor(n / 7); return s === 1 ? 'hace 1 semana' : `hace ${s} semanas`; }
    return `${dos(d.getDate())}-${dos(d.getMonth() + 1)}-${d.getFullYear()}`;
  }
  /** Lo recordado que sigue valiendo (misma ruta y mismo sha) y los archivos que faltan por fechar. recuerdo: { ruta: [sha, iso] }; shas: Map ruta → sha */
  function deRecuerdo(recuerdo, rutas, shas) {
    const fechas = {}, faltan = [];
    for (const r of new Set(rutas)) {
      const x = recuerdo[r];
      if (Array.isArray(x) && x[0] === shas.get(r) && x[1]) fechas[r] = x[1]; else faltan.push(r);
    }
    return { fechas, faltan };
  }
  /** El recuerdo con las fechas nuevas (una copia): solo los archivos que siguen en la rama con el mismo sha (así no crece sin fin con lo borrado o
   *  cambiado); lo que no tiene fecha no se recuerda, para volver a pedirlo */
  function recuerda(recuerdo, nuevas, shas) {
    const r = {};
    for (const [ruta, x] of Object.entries(recuerdo)) if (Array.isArray(x) && x[0] === shas.get(ruta)) r[ruta] = x;
    for (const [ruta, iso] of Object.entries(nuevas)) if (iso && shas.has(ruta)) r[ruta] = [shas.get(ruta), iso];
    return r;
  }
  return Object.freeze({ ORDENES, TRAMOS, rutasDe, fechaDe, ordena, tramo, texto, deRecuerdo, recuerda });
})();
if (typeof module !== 'undefined') module.exports = RECURSOS_FECHAS;   // en node (tests/gestion/recursos-fechas.test.mjs) solo se carga
