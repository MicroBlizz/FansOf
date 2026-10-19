// Fans Of · MONEDAS: las dos monedas de todo juego (PLAN-MONEDAS.md). La del JUEGO se gana jugando y paga todo, también lo que tiene azar;
// la PREMIUM se gana poco a poco, se compra con dinero y nunca entra en nada con azar: compra cosas a precio fijo (pase, cosméticos, ventajas).
// El único puente va de la del JUEGO a la PREMIUM (oro → gemas, caro: `cambio` de oro por cada premium), nunca al revés (decisión de Arkioner, 19-10-2026):
// así el dinero no llega al gashapón ni en dos pasos, y jugando mucho se abaratan el pase y los cosméticos. El ratio solo pasa precios de una a otra.
// Nombres, iconos y ratio: valores de core ← AJUSTES.monedas del juego ← fila remota de `flags` (nombre 'monedas', dato = JSON), consultados cada vez.
// Un juego con partida propia (modo ligero) pone AJUSTES.monedas.leer(cual) y escribir(cual, n); con core se usan SAVE.gold y SAVE.gems.
// No pinta nada por sí solo: el juego llama a chip(), saldo(), ventanaCambio(), compraReal() desde su tienda o su cartera.
'use strict';
const MONEDAS = (() => {
  const tr = (t, d) => (typeof IDIOMA !== 'undefined' && IDIOMA.tr ? IDIOMA.tr(t, d) : t.replace(/\{(\w+)\}/g, (m, k) => (d && k in d ? d[k] : m)));
  const BASE = {
    juego: { id: 'oro', nombre: 'Oro', nombre_en: 'Gold', icono: () => (typeof COIN_SVG !== 'undefined' ? COIN_SVG : '') },
    premium: { id: 'gemas', nombre: 'Gemas', nombre_en: 'Gems', icono: () => (typeof GEM_SVG !== 'undefined' ? GEM_SVG : '') },
    ratio: 100,    // 1 premium «vale» 100 del juego: solo para pasar precios de una a otra (p. ej. la tirada: ECON.pull × ratio en oro)
    cambio: 200,   // lo que cuesta 1 premium en moneda del juego al cambiar (el doble de lo que vale: cambiar sale caro a propósito). 0 = sin puente
  };
  const mezcla = (a, b) => { const o = Object.assign({}, a); for (const k in b || {}) o[k] = b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && typeof b[k] !== 'function' ? mezcla(a[k] || {}, b[k]) : b[k]; return o; };
  const remota = () => {   // la fila `monedas` de flags para este juego: dato es JSON (ratio, nombres…); si está mal escrito, se ignora
    const r = typeof NUCLEO !== 'undefined' && NUCLEO.flagRemoto && NUCLEO.flagRemoto('monedas');
    if (!r || !r.dato) return null;
    try { return JSON.parse(r.dato); } catch (e) { return null; }
  };
  // ¿este juego ya va con las dos monedas? Lo declara en AJUSTES.monedas y lo abre el flag 'monedas': la misma fila de `flags` que trae el ratio
  // (valor = abierto, dato = ajustes). El servidor mira esa fila para cobrar el gashapón en oro y el pase en gemas (servidor/47-monedas-rumble.sql).
  const activo = () => typeof AJUSTES !== 'undefined' && !!AJUSTES.monedas && typeof NUCLEO !== 'undefined' && !!NUCLEO.flag
    && NUCLEO.flag('monedas', 'Dos monedas: gashapón en la del juego, pase en premium, packs solo con dinero', false);
  const conf = () => mezcla(mezcla(BASE, typeof AJUSTES !== 'undefined' && AJUSTES.monedas), remota());
  const mon = cual => { const c = conf(); return cual === 'premium' ? c.premium : c.juego; };
  const nombre = cual => { const m = mon(cual); return typeof NUCLEO !== 'undefined' && NUCLEO.idioma === 'en' && m.nombre_en ? m.nombre_en : m.nombre; };
  const icono = cual => { const i = mon(cual).icono; return typeof i === 'function' ? i() : i || ''; };
  const chip = (cual, n) => `<span class="moneda-chip moneda-${cual}">${icono(cual)}${typeof n === 'number' ? (typeof fmt === 'function' ? fmt(n) : n) : ''}</span>`;
  const propio = () => typeof AJUSTES !== 'undefined' && AJUSTES.monedas && typeof AJUSTES.monedas.leer === 'function';
  const saldo = cual => (propio() ? AJUSTES.monedas.leer(cual) : typeof SAVE !== 'undefined' ? (cual === 'premium' ? SAVE.gems : SAVE.gold) || 0 : 0);
  // la guardia: nada con azar cobra en premium. motivo: el gasto que se va a hacer; v: { gold, gems, … } o { premium: n }
  const azar = (motivo, v) => {
    if (!v || !(v.gems || v.premium)) return true;
    const t = `Monedas: «${motivo}» tiene azar y quiere cobrar en premium. Eso no se hace (PLAN-MONEDAS.md).`;
    if (typeof NUCLEO !== 'undefined' && NUCLEO.desarrollo) throw new Error(t);
    console.error(t); if (typeof toast === 'function') toast(tr('Eso no se puede pagar con {m}', { m: nombre('premium') }));
    return false;
  };
  // el puente: resta `n × cambio` de moneda del juego y suma n premium. Devuelve una promesa con { juego, premium }
  async function cambiar(nPremium) {
    const c = conf(); nPremium = Math.floor(nPremium);
    if (!(c.cambio > 0) || !(nPremium >= 1)) throw new Error('cantidad');
    const cuesta = nPremium * c.cambio;
    if (saldo('juego') < cuesta) throw new Error('falta_oro');
    if (typeof ECO !== 'undefined' && ECO.servidor && ECO.servidor('economia')) {   // con cuenta: lo hace el servidor con el `cambio` de la misma fila (servidor/48-cambio-oro-gemas.sql)
      await ECO.pedir('cambiar_oro_gemas', { p_gemas: nPremium });
    } else if (propio()) {
      AJUSTES.monedas.escribir('juego', saldo('juego') - cuesta); AJUSTES.monedas.escribir('premium', saldo('premium') + nPremium);
    } else if (typeof ECO !== 'undefined') {
      ECO.gastar('cambio', { gold: cuesta }); ECO.ganar('cambio', { gems: nPremium });
    } else throw new Error('sin_cartera');
    if (typeof saveGame === 'function') saveGame(); else if (typeof CUENTA !== 'undefined' && CUENTA.cambio) CUENTA.cambio();
    return { juego: cuesta, premium: nPremium };
  }
  // la ventana común: cuántas premium quieres y cuánto oro cuestan. alAcabar(resultado) opcional
  function ventanaCambio(alAcabar) {
    if (typeof confirmBox !== 'function') return;
    const c = conf(), tengo = saldo('juego'), pasos = [1, 5, 10, 50, 100].filter(n => n * c.cambio <= tengo);
    if (!pasos.length) { if (typeof toast === 'function') toast(tr('Te falta {m}: se consigue jugando', { m: nombre('juego') })); return; }
    let n = pasos[0];
    const filas = pasos.map(p => `<button class="btn-ghost ol" data-cambio="${p}">${chip('juego', p * c.cambio)} → ${chip('premium', p)}</button>`).join('');
    confirmBox(tr('CAMBIAR {j} POR {p}', { j: nombre('juego').toUpperCase(), p: nombre('premium').toUpperCase() }), `<div class="cambio-lista">${filas}</div><small>${tr('1 de {p} cuesta {r} de {j}. El cambio no se deshace.', { p: nombre('premium'), r: c.cambio, j: nombre('juego') })}</small>`, tr('CAMBIAR YA'), () => {
      cambiar(n).then(r => { if (typeof play === 'function') play('win'); if (typeof updateWallets === 'function') updateWallets(); if (typeof toast === 'function') toast('+' + r.premium + ' ' + nombre('premium')); if (alAcabar) alAcabar(r); })
        .catch(e => { if (typeof play === 'function') play('deny'); if (typeof toast === 'function') toast(typeof ECO !== 'undefined' && ECO.errorTexto ? ECO.errorTexto(e) : 'No se ha podido'); });
    });
    for (const b of document.querySelectorAll('[data-cambio]')) { b.setAttribute('aria-pressed', String(+b.dataset.cambio === n)); b.onclick = () => { n = +b.dataset.cambio; for (const x of document.querySelectorAll('[data-cambio]')) x.setAttribute('aria-pressed', String(x === b)); }; }
  }
  // lo que solo se compra con dinero real (gemas, pase, sin anuncios…): en desarrollo es una compra de prueba; en la web aún no está a la venta
  function compraReal(titulo, html, alComprar) {
    if (typeof confirmBox !== 'function') return;
    if (typeof NUCLEO !== 'undefined' && NUCLEO.desarrollo) confirmBox(titulo, `${html}<small>${tr('Compra de prueba (solo en desarrollo): no se cobra nada.')}</small>`, tr('COMPRAR'), alComprar);
    else confirmBox(tr('SOLO CON DINERO REAL'), `${html}<small>${tr('Esto se paga con dinero de verdad y todavía no está a la venta: llegará con la app de Android.')}</small>`, null);
  }
  return { conf, activo, nombre, icono, chip, saldo, azar, cambiar, ventanaCambio, compraReal };
})();
