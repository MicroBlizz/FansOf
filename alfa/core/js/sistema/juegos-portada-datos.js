// Fans Of · CORE · LOS CAMBIOS DE /gestion → Juegos (tabla juego_portada, ADR 203): las filas que la portada y nuestro anuncio aplican encima del catálogo del repo.
// Adaptador: la tabla se pide una sola vez al cargar (por REST y sin sesión) y la última respuesta se guarda en el navegador, como los flags (flags.js).
//   filas()       → las filas guardadas, al instante (sin esperar a la red); sin nada guardado, ninguna (= todo como en el repo).
//   plataforma()  → 'alfa' en la copia de pruebas; si no, 'web' (la app de Android cuenta como web).
//   alCambiar(fn) → fn() cuando llegan filas distintas de las guardadas; si no cambian, no avisa.
// Sin red, con un error o con algo que no es la lista de filas se queda con lo guardado. ?sinflags (el comparador de partidas) no pide nada.
// La regla de qué hace cada fila está en juegos-portada.js (JUEGOS_PORTADA).
'use strict';
const JUEGOS_PORTADA_DATOS = (() => {
  const GUARDADO = 'fansof-juego-portada';
  const URL_TABLA = 'https://awivkedbmumwnkqlfixm.supabase.co/rest/v1/juego_portada?select=juego,plataforma,seccion,en_portada,en_anuncio&order=juego,plataforma';   // en orden: el mismo contenido no cuenta como cambio
  const CLAVE = 'sb_publishable_iQ9OrvJmMx87u_uUMQ_uNw_UdBz78gn';
  const oyentes = [];
  // solo filas con juego y plataforma de texto; lo demás de cada fila lo limpia la regla
  const validas = d => (Array.isArray(d) ? d.filter(f => f && typeof f === 'object' && typeof f.juego === 'string' && typeof f.plataforma === 'string') : null);
  const leer = () => {
    try { return validas(JSON.parse(localStorage.getItem(GUARDADO) || 'null')) || []; } catch (e) { return []; /* sin almacenamiento o guardado roto: como el repo */ }
  };
  let filas = Object.freeze(leer());

  const guardar = l => { try { localStorage.setItem(GUARDADO, JSON.stringify(l)); } catch (e) { /* sin almacenamiento: vale mientras la página esté abierta */ } };
  const recibe = datos => {
    const nuevas = validas(datos);
    if (!nuevas) return;   // no es la lista de filas: se queda lo guardado
    const cambio = JSON.stringify(nuevas) !== JSON.stringify(filas);
    filas = Object.freeze(nuevas); guardar(nuevas);
    if (cambio) oyentes.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
  };
  const pide = () => {
    if (typeof fetch !== 'function' || !/^https?:$/.test(location.protocol) || /[?&]sinflags\b/.test(location.search)) return;
    fetch(URL_TABLA, { cache: 'no-store', headers: { apikey: CLAVE } })
      .then(r => { if (!r.ok) throw new Error('juego_portada ' + r.status); return r.json(); })
      .then(recibe, () => { /* sin red, 404 o JSON roto: se queda lo guardado */ });
  };
  const plataforma = () => (typeof NUCLEO !== 'undefined' && NUCLEO.alfa ? 'alfa' : 'web');
  pide();
  return Object.freeze({ filas: () => filas, plataforma, alCambiar: fn => { oyentes.push(fn); } });
})();
