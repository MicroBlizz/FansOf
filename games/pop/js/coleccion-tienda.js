// Fans of Pop · COMPAÑEROS DE LA TIENDA (aplicación; tarea #142, ADR 157): comprar con perlas, a precio fijo, los compañeros que el
// álbum vende (los de `via.t === 'tienda'` en js/companeros-datos.js). Lo cobra el servidor con comprar_fijo ('companero:<id>', datos de
// Pop versión 5, servidor/168), igual que el perfil (js/perlas-servidor.js), y lo comprado vuelve a la colección aunque cambies de móvil.
// Sin cuenta solo valen las compras de prueba del panel DEV, como en el perfil.
'use strict';
const ppArticuloCompanero = id => 'companero:' + id;
// lo comprado en el servidor (o de prueba) que aún no está en la colección de este móvil, a la colección
function ppColeIgualaCompras() {
  if (!ppCompanerosActivo()) return;
  const faltan = PP_SRV.comprados().filter(c => c.startsWith('fijo:companero:')).map(c => c.slice('fijo:companero:'.length)).filter(id => PP_COLE.existe(id) && !ppCole().tiene[id]);
  for (const id of faltan) ppColeGana(id);
}
// comprar un compañero de la tienda; `alAcabar(resultado)` recibe { ok } o { ok: false, error } (no_se_vende, ya_lo_tienes, faltan_perlas, sin_cuenta, sin_red…)
async function ppCompraCompanero(id, alAcabar = () => {}) {
  const via = PP_COLE.existe(id) ? PP_COMP.INFO[id].via : null;
  if (!via || via.t !== 'tienda') { alAcabar({ ok: false, error: 'no_se_vende' }); return; }
  if (ppCole().tiene[id]) { alAcabar({ ok: false, error: 'ya_lo_tienes' }); return; }
  const r = await PP_SRV.compra(ppArticuloCompanero(id), via.perlas);
  if (r.ok) ppColeGana(id);
  alAcabar(r);
}
