// Fans Of Paperwork · adaptador · MEJORAS DE PAGO (ADR 125): de dónde salen las claves de las mejoras compradas y cómo se compran.
// La verdad está en la cuenta: el servidor apunta la compra en `reclamos` (servidor/90, entregar_compra) y aquí se leen con la función
// `estado` del juego. Se guarda una copia en este navegador, con su propia clave (<clave del juego>-mejoras), que NO se borra con cada
// versión como la partida: así se juega con ellas sin red y desde el primer fotograma. Las compras de prueba (solo en modo desarrollo)
// van aparte, en `prueba`, y fuera del modo desarrollo no cuentan. Cobra core: MONEDAS.compraReal (Google Play, Paddle o compra de prueba).
// Puertos: almacenamiento (como localStorage o null), cuenta (como CUENTA o null), juego (AJUSTES.id), desarrollo (bool),
// comprar(titulo, html, alComprar, producto), alCambiar(claves) y enLinea() (navigator.onLine).
'use strict';
PW.creaMejorasPago = ({ almacenamiento, clave, cuenta, juego, desarrollo, comprar, alCambiar = () => {}, enLinea = () => true }) => {
  const M = PW.AJ.mejoras, ES_MEJORA = /^mejora:/;
  const soloMejoras = l => (Array.isArray(l) ? l.filter(c => typeof c === 'string' && ES_MEJORA.test(c)) : []);
  function lee() {
    try { const j = almacenamiento && JSON.parse(almacenamiento.getItem(clave)); return { servidor: soloMejoras(j && j.servidor), prueba: soloMejoras(j && j.prueba) }; }
    catch (error) { console.warn('Paperwork: copia de las mejoras ilegible', error); return { servidor: [], prueba: [] }; }
  }
  const copia = lee();
  function escribe() {
    if (!almacenamiento) return;
    try { almacenamiento.setItem(clave, JSON.stringify(copia)); } catch (error) { console.warn('Paperwork: no se guardan las mejoras', error); }
  }
  const claves = () => [...new Set([...copia.servidor, ...(desarrollo ? copia.prueba : [])])];
  const cambia = () => { escribe(); alCambiar(claves()); };
  // pregunta a la cuenta lo que tiene comprado; sin cuenta o sin red se queda la copia. Devuelve una promesa con las claves
  // Si se piden varias a la vez (al arrancar y tras una compra), solo vale la última: una respuesta vieja no pisa una compra recién hecha.
  // Sin conexión ni se pregunta (no es un fallo del servidor que haya que apuntar)
  let pedida = 0;
  async function refresca() {
    if (!cuenta || !cuenta.activa || !juego || !enLinea()) return claves();
    const esta = ++pedida;
    let r;
    try { r = await cuenta.rpc('estado', { p_juego: juego }); } catch (error) { return claves(); }   // sin red: la copia vale hasta la próxima
    if (esta !== pedida) return claves();
    copia.servidor = soloMejoras(r && r.reclamos);   // sin monedero (nunca ha comprado nada) es null: ninguna
    cambia();
    return claves();
  }
  // lo que llega de una compra: la de prueba se apunta aquí; la de verdad ya la ha apuntado el servidor, que manda al refrescar
  function llega(r, c) {
    if (r && r.prueba) copia.prueba = [...new Set([...copia.prueba, c])];
    else if (r && r.real && ES_MEJORA.test(r.derecho || '')) copia.servidor = [...new Set([...copia.servidor, r.derecho])];
    else return;
    cambia();
    if (r.real) refresca();
  }
  // comprar una de las ofertas ('turno', 'taquilla' o 'pack'); titulo y html los pone la pantalla (ya traducidos)
  function compra(id, titulo, html, alComprar = () => {}) {
    const m = M[id];
    if (!m) return;
    comprar(titulo, html, r => { llega(r, m.clave); alComprar(r); }, m.producto);
  }
  // borra las compras de prueba (el panel DEV)
  function olvidaPruebas() { copia.prueba = []; cambia(); }
  return { claves, refresca, compra, olvidaPruebas };
};
