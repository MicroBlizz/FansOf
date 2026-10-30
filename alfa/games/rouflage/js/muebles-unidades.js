// Fans of Rouflage · LAS UNIDADES DE LOS MUEBLES (decidido por Daniel el 25-10-2026). En MI ESCENARIO se ponen tantos muebles de cada tipo como
// unidades tengas: cada copia que sale en la máquina CASA del gachapón (o que compras otra vez en el armario) es uno más. Los de serie (de: base)
// no tienen límite, ni nada con DESBLOQUEAR TODO de las pruebas. Los escenarios y los colores no van por unidades (se tienen una vez).
// Se guarda en SAVE.armario.unidades = { 'muebles:sillon': 3 } (sin apuntar = 1); con cuenta lo pone el servidor (rf_coleccion.n, servidor/96).
// Quien ya tenía muebles colocados antes de esto conserva esas unidades, UNA vez (sin cuenta, aquí; con cuenta, rf_unidades_legado).
// Va después de escenario-datos.js.
'use strict';

const UNIDADES = { sinLimite: 9999, max: 999, pidiendo: false };
const muebleClave = id => 'muebles:' + id;
function arUnidades() { const a = armarioEstado(); if (!a.unidades || typeof a.unidades !== 'object') a.unidades = {}; return a.unidades; }
// ¿sin límite? Los de serie y todo en el modo de pruebas
const muebleSinLimite = it => !it || it.de === 'base' || !!(armarioEstado().todo && typeof arPruebasVisibles === 'function' && arPruebasVisibles());
// cuántos puedes poner de este mueble (0 si no es tuyo)
function muebleUnidades(id) {
  const it = arItem('muebles', id); if (!it || !arTiene('muebles', it)) return 0;
  if (muebleSinLimite(it)) return UNIDADES.sinLimite;
  return Math.max(1, arUnidades()[muebleClave(id)] | 0);
}
const mueblePuestos = (sala, id) => (sala && sala.muebles ? sala.muebles.filter(m => m.id === id).length : 0);
const muebleQuedan = (sala, id) => muebleUnidades(id) - mueblePuestos(sala, id);
// una unidad más (sin cuenta: lo que sale repetido en la CASA o se compra otra vez)
function muebleSumaUnidad(id) {
  const u = arUnidades(), k = muebleClave(id);
  u[k] = Math.min(UNIDADES.max, Math.max(1, u[k] | 0) + 1);
  return u[k];
}
// ¿se puede comprar otra? Un mueble que ya es tuyo, que se vende y que tiene límite
const muebleOtraMas = (cat, it) => !!(cat && cat.id === 'muebles' && it && arTiene('muebles', it) && !muebleSinLimite(it) && arUnidades()[muebleClave(it.id)] !== UNIDADES.max);

// lo que había colocado antes de las unidades: { 'muebles:sillon': 3 } (solo lo tuyo que tiene límite)
function unidadesColocadas() {
  const s = SAVE.escenario, cuenta = {};
  for (const m of (s && Array.isArray(s.m) ? s.m : [])) {
    const id = Array.isArray(m) ? m[0] : m && m.id, it = arItem('muebles', id);
    if (!it || !arTiene('muebles', it) || it.de === 'base') continue;
    cuenta[muebleClave(id)] = (cuenta[muebleClave(id)] || 0) + 1;
  }
  return cuenta;
}
// sin cuenta: una sola vez, las unidades = lo que tenías colocado
function unidadesLegadoLocal() {
  const a = armarioEstado(); if (a.unidadesLegado || (typeof RFS !== 'undefined' && RFS.activo())) return;
  const u = arUnidades(), c = unidadesColocadas();
  for (const k in c) u[k] = Math.max(u[k] | 0, Math.min(20, c[k]));
  a.unidadesLegado = true; guardaPartida();
}
// con cuenta: lo llama RFS.aplica (servidor.js) con cada estado. Si el servidor aún no apuntó lo que tenías colocado, se le manda una vez
function unidadesDelServidor(est) {
  if (!est || !est.estado || est.estado.unidadesLegado || UNIDADES.pidiendo || typeof CUENTA === 'undefined' || typeof CUENTA.rpc !== 'function') return;
  UNIDADES.pidiendo = true;
  CUENTA.rpc('rf_unidades_legado', { p_puestos: unidadesColocadas() })
    .then(r => { if (r) { RFS.aplica(r); guardaPartida(); } })
    .catch(() => { UNIDADES.pidiendo = false; });      // servidor sin el 96 todavía: se reintentará con el siguiente estado
}
// el texto de la tarjeta de la bandeja: «2/3» (puestos de los que tienes) o «×2» si no tiene límite
function muebleCuentaTexto(sala, id) {
  const n = muebleUnidades(id), p = mueblePuestos(sala, id);
  return n >= UNIDADES.sinLimite ? (p ? '×' + p : '') : p + '/' + n;
}
// te has quedado sin unidades de un mueble: a la máquina CASA o al armario a por más
function muebleSinUnidades(it) {
  play('deny');
  confirmBox(tr('NO TE QUEDAN MÁS'), esc(tr('Ya has puesto todas tus unidades de {n}. Consigue más en la máquina CASA del gachapón o cómpralas en el armario.', { n: tr(it.n) })),
    tr('IR A LA GARRA'), () => { if (typeof escGuarda === 'function') escGuarda(); if (typeof MIESC !== 'undefined') { MIESC.abierto = false; cancelAnimationFrame(MIESC.raf); } E('esc-burbuja').hidden = true; abreGacha('casa', 'escenario'); }, tr('AHORA NO'));
}
function preparaUnidades() { unidadesLegadoLocal(); }
