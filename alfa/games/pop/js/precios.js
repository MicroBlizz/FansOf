// Fans of Pop · PRECIOS HONESTOS (dominio puro; tarea #177, Pepins 19-11-2026). Sin SAVE, reloj, DOM ni textos: entran los packs,
// las ayudas y las ofertas de PP_CFG (js/ajustes.js) y salen cifras en euros. Dos reglas para no exagerar nunca:
// · «≈ X €» junto a un precio en perlas: la perla al precio del pack MÁS CARO por perla (el de 10), así nunca parece más barato.
// · «Lo que trae vale X €» de una oferta: la perla al precio del pack MÁS BARATO por perla, los corazones infinitos al minuto más
//   barato y el total redondeado hacia abajo a 10 céntimos, así el valor nunca es más alto que lo que costaría por separado.
// Sustituye al precio tachado inventado y al «-80 %» (informe de los probadores, docs/pop/probadores-2026-11-19/5-cobrar.md).
'use strict';
const PP_PRECIOS = (() => {
  // '4,49 €' → 4.49 (null si no se entiende)
  function euros(texto) {
    const n = parseFloat(String(texto).replace(/[^\d,.]/g, '').replace(',', '.'));
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  // lo que cuesta una perla en cada pack de euros, solo los que se entienden
  const porPerla = packs => (packs || []).map(p => euros(p.precio) / p.perlas).filter(x => Number.isFinite(x) && x > 0);
  const perlaCara = packs => { const l = porPerla(packs); return l.length ? Math.max(...l) : null; };
  const perlaBarata = packs => { const l = porPerla(packs); return l.length ? Math.min(...l) : null; };
  // n perlas en euros, a lo más caro (para «≈ X €» junto a un precio); null sin packs
  function enEuros(perlas, packs) {
    const p = perlaCara(packs);
    return p === null ? null : Math.round(perlas * p * 100) / 100;
  }
  // los minutos de corazones infinitos en perlas, al minuto más barato de la tienda
  function infinitasEnPerlas(min, infinitas) {
    const l = (infinitas || []).map(o => o.perlas / o.min).filter(x => Number.isFinite(x) && x > 0);
    return min && l.length ? min * Math.min(...l) : 0;
  }
  // lo que vale en perlas el contenido de una oferta { perlas, ayudas: { k: n }, infinitas: min }
  function ofertaEnPerlas(oferta, cfg) {
    let n = oferta.perlas || 0;
    for (const k in oferta.ayudas || {}) n += oferta.ayudas[k] * ((cfg.ayudas[k] || {}).perlas || 0);
    return n + infinitasEnPerlas(oferta.infinitas, cfg.infinitas);
  }
  // el valor de una oferta en euros, a la baja (múltiplo de 0,10); null si no hay packs o si no vale más que su precio
  function valorOferta(oferta, cfg) {
    const p = perlaBarata(cfg.packs), precio = euros(oferta.precio);
    if (p === null || precio === null) return null;
    const v = Math.floor(ofertaEnPerlas(oferta, cfg) * p * 10 + 1e-9) / 10;
    return v > precio ? v : null;
  }
  // 0.9 → '0,90 €'
  const formato = n => n.toFixed(2).replace('.', ',') + ' €';
  return Object.freeze({ euros, perlaCara, perlaBarata, enEuros, ofertaEnPerlas, valorOferta, formato });
})();
