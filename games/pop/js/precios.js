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
  // tarea #187 · el pack de MEJOR VALOR es un dato, no una opinión: el más barato por perla (su id; null sin packs válidos)
  function mejorValor(packs) {
    const b = perlaBarata(packs);
    const p = b === null ? null : (packs || []).find(x => euros(x.precio) / x.perlas === b);
    return p ? p.id : null;
  }
  // un lote de n de la misma cosa al `factor` del precio: lo que cuesta y las perlas que ahorras frente a n sueltas
  function lote(precio, n, factor) {
    const total = Math.round(precio * n * factor);
    return { precio: total, ahorro: precio * n - total };
  }
  // «comprar solo lo que falta»: el pack más pequeño que cubre las perlas que faltan (null si ninguno llega)
  function packQueLlega(faltan, packs) {
    const l = (packs || []).filter(p => p.perlas >= faltan).sort((a, b) => a.perlas - b.perlas);
    return l.length ? l[0] : null;
  }
  // n perlas en euros al pack MÁS BARATO por perla y a la baja (múltiplo de 0,10): lo que valen, nunca más; null sin packs
  function valorPerlas(perlas, packs) {
    const p = perlaBarata(packs);
    return p === null ? null : Math.floor(perlas * p * 10 + 1e-9) / 10;
  }
  // tarea #266 · el «+N %» de un pack: cuántas perlas de más trae por el mismo dinero frente al pack más caro por perla (el de 10),
  // redondeado hacia abajo para no exagerar nunca; 0 si no trae más o no se puede calcular
  function extra(p, packs) {
    const cara = perlaCara(packs), precio = euros(p && p.precio);
    if (cara === null || precio === null) return 0;
    return Math.max(0, Math.floor((p.perlas * cara / precio - 1) * 100 + 1e-9));
  }
  return Object.freeze({ extra, valorPerlas, euros, perlaCara, perlaBarata, enEuros, ofertaEnPerlas, valorOferta, formato, mejorValor, lote, packQueLlega });
})();
