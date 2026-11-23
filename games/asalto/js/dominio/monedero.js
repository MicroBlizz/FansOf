// Fans of Asalto · DOMINIO · Lo que el servidor sabe de las Coronas (ADR 200, tarea #317; docs/core/TIENDA-GEMAS.md y MONEDAS.md). Con cuenta, el saldo y lo
// comprado NO son del móvil (cualquiera se los escribiría): son del monedero 'asalto' del servidor, donde las Coronas son las «gemas». Una compra con euros la
// entrega el servidor (servidor/90: suma las gemas y apunta el derecho en reclamos) y un aspecto lo cobra comprar_fijo (servidor/112: resta las gemas y
// apunta 'fijo:aspecto:<id>' en reclamos). Aquí, sin red ni pantalla, las reglas de leer eso:
//   · la copia del servidor: { usuario, abierto, coronas, reclamos }; el móvil la guarda para pintar sin red, pero la verdad es el servidor
//   · qué aspectos tiene quien tiene ciertos reclamos ('fijo:aspecto:<id>', y el de Gala si tiene el derecho del Pack de inicio)
//   · la vista del jugador: su progreso con las Coronas, los aspectos y el Pack de inicio de la copia (poner un aspecto sigue siendo local)
//   · lo que se manda a comprar_fijo (juego, artículo y clave) y qué nombre de error de Asalto es cada fallo del servidor
// Errores con nombre: aspecto-desconocido, sin-coronas, ya-lo-tienes, tienda-cerrada, sin-monedero, sin-cuenta, sin-red, servidor.
'use strict';
AS.monedero = (() => {
  const entero = v => (Number.isFinite(v) && v > 0 ? Math.floor(v) : 0);
  const articulo = id => 'aspecto:' + id;   // el id del artículo en AJUSTES.tiendaFija y en tablas_juego.datos.tienda
  const claves = l => Object.freeze([...new Set((Array.isArray(l) ? l : []).filter(c => typeof c === 'string' && c.length <= 80))]);
  const nueva = (usuario, abierto, coronas, reclamos) => Object.freeze({ usuario, abierto, coronas: entero(coronas), reclamos: claves(reclamos) });
  const vacia = (usuario = '') => nueva(usuario, false, 0, []);
  // lo guardado en este móvil, siempre válido
  const lee = j => (j && typeof j === 'object' ? nueva(typeof j.usuario === 'string' ? j.usuario : '', j.abierto === true, j.coronas, j.reclamos) : vacia());
  // lo que contesta `estado` del servidor; null = esa cuenta aún no tiene monedero (nunca ha comprado nada), y entonces no manda nada
  const deEstado = (usuario, estado) => (estado && typeof estado === 'object' ? nueva(usuario, true, estado.gemas, estado.reclamos) : vacia(usuario));
  // ¿tiene este aspecto? Lo compró (reclamo fijo) o es el de Gala y tiene el derecho del Pack de inicio
  const tiene = (datos, reclamos, id) => reclamos.includes(TIENDA_FIJA.reglas.clave(articulo(id), null))
    || (id === datos.compras.inicio.aspecto && reclamos.includes(datos.compras.inicio.derecho));
  const aspectosDe = (datos, reclamos) => Object.keys(datos.aspectos).filter(id => tiene(datos, reclamos, id));
  // lo que ve el jugador con el servidor al mando: su progreso, con lo de la copia en lugar de lo de este móvil (lo puesto se queda si lo tiene)
  function vista(datos, p, copia) {
    const inicio = copia.reclamos.includes(datos.compras.inicio.derecho);
    return { ...p, coronas: copia.coronas, inicio, ...AS.aspectosTienda.lee(datos, { aspectos: aspectosDe(datos, copia.reclamos), pieles: p.pieles }) };
  }
  // lo que se manda a comprar_fijo: artículo y clave (la misma al reintentar, así no se cobra dos veces), y el reclamo y el precio que dice la tienda
  function pedido(tienda, id) {
    const a = articulo(id), r = TIENDA_FIJA.reglas.busca(tienda, a, {});
    return r.ok ? AS.ok({ articulo: a, clave: ('c:' + a).slice(0, 80), reclamo: r.valor.clave, precio: r.valor.precio }) : AS.error('aspecto-desconocido');
  }
  // la copia tras comprar: el saldo que devuelve comprar_fijo y el reclamo nuevo
  const alComprar = (copia, respuesta, reclamo) => nueva(copia.usuario, true, Number.isFinite(respuesta && respuesta.gemas) ? respuesta.gemas : copia.coronas, [...copia.reclamos, reclamo]);
  // un fallo del servidor (CUENTA.rpc lanza con su mensaje y su estado HTTP): los que tienen nombre y, si no, si el servidor contestó o no hubo red
  const FALLOS = [['faltan_gemas', 'sin-coronas'], ['ya_lo_tienes', 'ya-lo-tienes'], ['tienda_cerrada', 'tienda-cerrada'], ['no_existe', 'aspecto-desconocido'], ['sin_monedero', 'sin-monedero'], ['sin_sesion', 'sin-cuenta']];
  function errorServidor(e) {
    const m = String((e && e.message) || e), f = FALLOS.find(([texto]) => m.includes(texto));
    if (f) return f[1];
    const n = e && e.estado;
    return n >= 400 && n < 500 && n !== 401 && n !== 408 && n !== 429 ? 'servidor' : 'sin-red';
  }
  return { articulo, lee, vacia, deEstado, tiene, aspectosDe, vista, pedido, alComprar, errorServidor };
})();
