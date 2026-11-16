// Fans Of · DERECHOS: lo que la cuenta tiene comprado para siempre en un juego («sin anuncios», una mejora…), para los juegos ligeros,
// que no llevan la economía de los grandes (ADR 123 y 125; los grandes los reciben por PAGOS y el gancho 'derechos').
// La verdad está en la cuenta: el servidor apunta cada compra en `reclamos` (servidor/90, entregar_compra) y aquí se lee con la función
// `estado` del juego. Se guarda una copia en este navegador para jugar sin red y desde el primer fotograma. Las compras de prueba
// (solo en modo desarrollo) van aparte, en `prueba`, y fuera del modo desarrollo no cuentan.
// Sin globales ni DOM: todo entra por puertos. almacenamiento (como localStorage, o null), clave (la de la copia), cuenta (como CUENTA,
// o null), juego (AJUSTES.id), desarrollo (bool), vale(clave) (qué derechos son de este juego), alCambiar(claves) y enLinea().
'use strict';
const DERECHOS = {};
DERECHOS.crea = ({ almacenamiento, clave, cuenta, juego, desarrollo, vale, alCambiar = () => {}, enLinea = () => true }) => {
  const mios = l => (Array.isArray(l) ? l.filter(c => typeof c === 'string' && vale(c)) : []);
  const junta = (...listas) => [...new Set(listas.flat())];
  function lee() {
    try { const j = almacenamiento && JSON.parse(almacenamiento.getItem(clave)); return { servidor: mios(j && j.servidor), prueba: mios(j && j.prueba) }; }
    catch (error) { console.warn('Derechos: copia ilegible', error); return { servidor: [], prueba: [] }; }
  }
  const copia = lee();
  function escribe() {
    if (!almacenamiento) return;
    try { almacenamiento.setItem(clave, JSON.stringify(copia)); } catch (error) { console.warn('Derechos: no se guarda la copia', error); }
  }
  const claves = () => junta(copia.servidor, desarrollo ? copia.prueba : []);
  const tiene = c => claves().includes(c);
  const cambia = () => { escribe(); alCambiar(claves()); };
  // pregunta a la cuenta lo que tiene comprado; sin cuenta o sin red se queda la copia. Devuelve una promesa con las claves.
  // Si se piden varias a la vez (al arrancar y tras una compra), solo vale la última: una respuesta vieja no pisa una compra recién hecha.
  // Sin conexión ni se pregunta (no es un fallo del servidor que haya que apuntar)
  let pedida = 0;
  async function refresca() {
    if (!cuenta || !cuenta.activa || !juego || !enLinea()) return claves();
    const esta = ++pedida;
    let r;
    try { r = await cuenta.rpc('estado', { p_juego: juego }); } catch (error) { return claves(); }   // sin red: la copia vale hasta la próxima
    if (esta !== pedida) return claves();
    copia.servidor = mios(r && r.reclamos);   // sin monedero (nunca ha comprado nada) es null: ninguno
    cambia();
    return claves();
  }
  // lo que llega de una compra (el resultado de MONEDAS.compraReal): la de prueba apunta `c`, la clave que se quería comprar;
  // la de verdad apunta el derecho que dice el servidor y vuelve a preguntarle, porque es él quien manda
  function llega(r, c) {
    if (r && r.prueba && vale(c)) copia.prueba = junta(copia.prueba, [c]);
    else if (r && r.real && typeof r.derecho === 'string' && vale(r.derecho)) copia.servidor = junta(copia.servidor, [r.derecho]);
    else return;
    cambia();
    if (r.real) refresca();
  }
  // borra las compras de prueba (el panel DEV)
  function olvidaPruebas() { copia.prueba = []; cambia(); }
  return { claves, tiene, refresca, llega, olvidaPruebas };
};
if (typeof module !== 'undefined') module.exports = DERECHOS;
