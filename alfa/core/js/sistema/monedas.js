// Fans Of · MONEDAS: las dos monedas de todo juego (PLAN-MONEDAS.md). La del JUEGO se gana jugando y paga todo, también lo que tiene azar;
// la PREMIUM se gana poco a poco, se compra con dinero, nunca entra en nada con azar y se cambia por moneda del juego a un ratio fijo.
// Nombres, iconos y ratio: valores de core ← AJUSTES.monedas del juego ← fila remota de `flags` (nombre 'monedas', dato = JSON), consultados cada vez.
// Un juego con partida propia (modo ligero) pone AJUSTES.monedas.leer(cual) y escribir(cual, n); con core se usan SAVE.gold y SAVE.gems.
// No pinta nada por sí solo: el juego llama a chip(), saldo(), ventanaCambio() desde su tienda o su cartera.
'use strict';
const MONEDAS = (() => {
  const tr = (t, d) => (typeof IDIOMA !== 'undefined' && IDIOMA.tr ? IDIOMA.tr(t, d) : t.replace(/\{(\w+)\}/g, (m, k) => (d && k in d ? d[k] : m)));
  const BASE = {
    juego: { id: 'oro', nombre: 'Oro', nombre_en: 'Gold', icono: () => (typeof COIN_SVG !== 'undefined' ? COIN_SVG : '') },
    premium: { id: 'gemas', nombre: 'Gemas', nombre_en: 'Gems', icono: () => (typeof GEM_SVG !== 'undefined' ? GEM_SVG : '') },
    ratio: 100,    // 1 premium = 100 del juego
    minimo: 1,     // lo mínimo que se cambia de golpe
  };
  const mezcla = (a, b) => { const o = Object.assign({}, a); for (const k in b || {}) o[k] = b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && typeof b[k] !== 'function' ? mezcla(a[k] || {}, b[k]) : b[k]; return o; };
  const remota = () => {   // la fila `monedas` de flags para este juego: dato es JSON (ratio, nombres…); si está mal escrito, se ignora
    const r = typeof NUCLEO !== 'undefined' && NUCLEO.flagRemoto && NUCLEO.flagRemoto('monedas');
    if (!r || !r.dato) return null;
    try { return JSON.parse(r.dato); } catch (e) { return null; }
  };
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
  // el único puente entre las dos: resta premium y suma premium × ratio de moneda del juego. Devuelve una promesa con { premium, juego } ganado/gastado
  async function cambiar(nPremium) {
    const c = conf(); nPremium = Math.floor(nPremium);
    if (!(nPremium >= c.minimo)) throw new Error('cantidad');
    if (saldo('premium') < nPremium) throw new Error('faltan_gemas');
    const gana = nPremium * c.ratio;
    if (typeof ECO !== 'undefined' && ECO.servidor && ECO.servidor('economia')) {   // con cuenta: lo hace el servidor con el ratio de la misma fila (servidor/46-monedas.sql)
      await ECO.pedir('cambiar_monedas', { p_premium: nPremium });
    } else if (propio()) {
      AJUSTES.monedas.escribir('premium', saldo('premium') - nPremium); AJUSTES.monedas.escribir('juego', saldo('juego') + gana);
    } else if (typeof ECO !== 'undefined') {
      ECO.gastar('cambio', { gems: nPremium }); ECO.ganar('cambio', { gold: gana });
    } else throw new Error('sin_cartera');
    if (typeof saveGame === 'function') saveGame(); else if (typeof CUENTA !== 'undefined' && CUENTA.cambio) CUENTA.cambio();
    return { premium: nPremium, juego: gana };
  }
  // la ventana común: elige cuántas premium cambias y confirma. alAcabar(resultado) opcional
  function ventanaCambio(alAcabar) {
    const c = conf(), tengo = saldo('premium'), pasos = [1, 5, 10, 50, 100].filter(n => n >= c.minimo && n <= tengo);
    if (!pasos.length) { if (typeof toast === 'function') toast(tr('Te faltan {m}: se consiguen jugando o en la tienda', { m: nombre('premium') })); return; }
    let n = pasos[0];
    const filas = pasos.map(p => `<button class="btn-ghost ol" data-cambio="${p}">${chip('premium', p)} → ${chip('juego', p * c.ratio)}</button>`).join('');
    confirmBox(tr('CAMBIAR MONEDAS'), `<div class="cambio-lista">${filas}</div><small>${tr('1 de {p} vale {r} de {j}. El cambio no se deshace.', { p: nombre('premium'), r: c.ratio, j: nombre('juego') })}</small>`, tr('CAMBIAR YA'), () => {
      cambiar(n).then(r => { if (typeof play === 'function') play('win'); if (typeof updateWallets === 'function') updateWallets(); if (typeof toast === 'function') toast('+' + r.juego + ' ' + nombre('juego')); if (alAcabar) alAcabar(r); })
        .catch(e => { if (typeof play === 'function') play('deny'); if (typeof toast === 'function') toast(typeof ECO !== 'undefined' && ECO.errorTexto ? ECO.errorTexto(e) : 'No se ha podido'); });
    });
    for (const b of document.querySelectorAll('[data-cambio]')) { b.setAttribute('aria-pressed', String(+b.dataset.cambio === n)); b.onclick = () => { n = +b.dataset.cambio; for (const x of document.querySelectorAll('[data-cambio]')) x.setAttribute('aria-pressed', String(x === b)); }; }
  }
  return { conf, nombre, icono, chip, saldo, azar, cambiar, ventanaCambio };
})();
