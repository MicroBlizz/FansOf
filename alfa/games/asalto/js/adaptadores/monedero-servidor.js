// Fans of Asalto · ADAPTADORES · El monedero de Asalto en el servidor (ADR 200, tarea #317). Habla con el servidor y guarda en este navegador la copia de lo que
// dice (saldo de Coronas y lo comprado, de dominio/monedero.js) para pintar sin red y desde el primer fotograma; quien manda es el servidor.
// · refresca(): pide `estado` y adopta lo que diga (al arrancar, al volver la cuenta y tras una compra con euros, que entrega el servidor).
// · compra(pedido): un aspecto por comprar_fijo(juego, artículo, clave); el servidor cobra y apunta; aquí solo se adopta el saldo y el reclamo que contesta.
// · listo(): ¿manda el servidor? Con cuenta activa y su monedero abierto (se abre en la primera compra con euros: sin él no hay nada comprado).
// Sin globales ni DOM: todo entra por puertos. cuenta (como CUENTA, o null), almacenamiento (como localStorage, o null), clave (la de la copia), juego,
// activo() (¿está abierto lo nuevo?, preguntado cada vez), flag() (¿abierta la tienda de aspectos? 'tienda-gemas'), enLinea().
// Los errores son resultados con nombre (AS.error): sin-cuenta, sin-red, otra-cuenta, tienda-cerrada, sin-coronas, ya-lo-tienes, aspecto-desconocido, servidor.
'use strict';
AS.creaMonederoServidor = ({ cuenta, almacenamiento, clave, juego, activo, flag = () => true, enLinea = () => true }) => {
  const M = AS.monedero, oyentes = [];
  const lee = () => {
    try { return M.lee(almacenamiento && JSON.parse(almacenamiento.getItem(clave))); } catch (error) { console.warn('Asalto: copia del monedero ilegible', error); return M.vacia(); }
  };
  let copia = lee(), pedida = 0;
  const conectado = () => !!(activo() && cuenta && cuenta.activa && cuenta.usuario);
  const listo = () => conectado() && copia.abierto && copia.usuario === cuenta.usuario;
  // la copia nueva, guardada en este navegador; avisa solo si ha cambiado algo
  function pon(nueva) {
    const cambia = JSON.stringify(nueva) !== JSON.stringify(copia);
    copia = nueva;
    try { if (almacenamiento) almacenamiento.setItem(clave, JSON.stringify(copia)); } catch (error) { console.warn('Asalto: no se guarda la copia del monedero', error); }
    if (cambia) for (const f of oyentes) f();
  }
  // lo último que se preguntó o compró es lo que vale: una respuesta de antes no pisa una compra recién hecha (como DERECHOS.refresca)
  async function refresca() {
    if (!conectado()) return AS.error('sin-cuenta');
    if (!enLinea()) return AS.error('sin-red');
    const u = cuenta.usuario, esta = ++pedida;
    let estado;
    try { estado = await cuenta.rpc('estado', { p_juego: juego }); } catch (error) { return AS.error(M.errorServidor(error)); }
    if (cuenta.usuario !== u) return AS.error('otra-cuenta');
    if (esta === pedida) pon(M.deEstado(u, estado));
    return AS.ok(copia);
  }
  const falla = (nombre, p) => AS.error(nombre, { coste: p.precio });
  // un aspecto: el servidor cobra con la misma clave al reintentar. Si dice que no cuadra (te faltan Coronas, ya era tuyo), se pide el estado para pintar lo cierto
  async function compra(p) {
    if (!listo()) return AS.error('sin-cuenta');
    if (!flag()) return falla('tienda-cerrada', p);
    if (!enLinea()) return falla('sin-red', p);
    const u = cuenta.usuario;
    pedida++;   // lo que viniera de camino ya es viejo
    try {
      const r = await cuenta.rpc('comprar_fijo', { p_juego: juego, p_articulo: p.articulo, p_clave: p.clave });
      if (cuenta.usuario === u) pon(M.alComprar(copia, r, p.reclamo));
      return AS.ok(copia);
    } catch (error) {
      const nombre = M.errorServidor(error);
      if (nombre === 'sin-coronas' || nombre === 'ya-lo-tienes') await refresca();
      return falla(nombre, p);
    }
  }
  // borra la copia (el reseteo de una cuenta de probador: gancho 'probador-reseteo')
  const olvida = () => pon(M.vacia());
  return { listo, conectado, refresca, compra, olvida, get copia() { return copia; }, alCambiar: f => { oyentes.push(f); } };
};
