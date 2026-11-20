// Fans of Pop · LA PESTAÑA PERLAS DE LA TIENDA (tarea #266, Pepins 20-11-2026, boceto C «Todo junto, por secciones»): «Para ti»
// (el pack de bienvenida o el del mundo 2 mientras duren de verdad; si no, el lote de hoy), los 6 packs de perlas, los lotes
// (perlas + ayudas + corazones infinitos) y «Lo que llevas a medias» (la hucha y el pase con su progreso).
// Todo honesto (tarea #177): nada tachado; el «+N %» y el «Vale X €» se calculan (js/precios.js). Un menor no llega a esta pestaña
// (ppTienda la quita, tarea #254) y cada compra pasa por la pregunta para adultos de core (MONEDAS.compraReal).
// Se carga antes de js/tienda-venta.js, que la pone en PP_TIENDA_PESTANAS.
'use strict';
const PP_DIA_MS = 86400000;
const ppDiaDeHoy = () => Math.floor(Date.parse(ppHoy()) / PP_DIA_MS);
// lo que trae una oferta o un lote, para ppPremioCandyHtml y ppDaPremio
const ppLoTrae = o => ({ perlas: o.perlas, ayudas: o.ayudas, infinitas: o.infinitas });
// el título de una sección, a lo ancho de la rejilla
function ppTiendaSeccion(caja, titulo, sub = '') {
  const h = document.createElement('div'); h.className = 'pp-tienda-sec';
  h.innerHTML = `${titulo}${sub ? ` <small>${sub}</small>` : ''}`;
  caja.appendChild(h);
}
// la cinta de un pack: MEJOR VALOR (un dato) gana a RECOMENDADO (una opinión)
function ppCintaPack(p, mejor) {
  if (p.id === mejor) return `<em class="pp-cinta pp-cinta-oro">${tr('MEJOR VALOR')}</em>`;
  return p.recomendado ? `<em class="pp-cinta">${tr('RECOMENDADO')}</em>` : '';
}
/* ---------- Para ti ---------- */
// el pack con reloj que esté abierto (bienvenida antes que el del mundo 2) o null. La bienvenida, solo tras su estreno en una partida
// nueva (como en el lado del camino): si no, su reloj empezaría a contar antes de presentarla
function ppParaTiPack() {
  if (ppBienvenidaVisible() && ppPrimerosVe('oferta')) return { k: 'bienvenida', nombre: tr('Pack de bienvenida'), abre: ppVentanaBienvenidaPack };
  if (ppPackMundo2Visible()) return { k: 'mundo2', nombre: tr('Pack del mundo 2'), abre: ppVentanaPackMundo2 };
  return null;
}
// la tarjeta ancha de arriba: su cinta, el nombre, lo que trae, lo que vale y su precio
function ppTarjetaParaTi(tarjeta, cinta, nombre, o, alPulsar, nota = '') {
  const v = PP_PRECIOS.valorOferta(o, PP_CFG), vale = v === null ? '' : tr('Lo que trae vale {e}', { e: PP_PRECIOS.formato(v) });
  const pie = [vale, nota].filter(Boolean).join(' · ');
  return tarjeta(`<em class="pp-cinta pp-cinta-oro">${cinta}</em><span>${nombre}</span>${ppPremioCandyHtml(ppLoTrae(o), 30)}${pie ? `<small>${pie}</small>` : ''}<b>${o.precio}</b>`, alPulsar, 'pp-ancho pp-para-ti');
}
// la cinta cuenta hacia atrás mientras se ve: al repintar la tienda o cerrarla, la tarjeta vieja deja de verse y su reloj se para
function ppParaTiReloj(t, k) {
  const em = t && t.querySelector ? t.querySelector('.pp-cinta') : null;
  if (!em) return;
  const tic = setInterval(() => {
    if (!em.isConnected || !em.offsetParent) { clearInterval(tic); return; }
    if (ppOfertaQueda(k) <= 0) { clearInterval(tic); ppTienda(); return; }   // se acabó: la tienda se repinta sin ella
    em.textContent = tr('QUEDAN {t}', { t: ppOfertaReloj(k) });
  }, 1000);
}
// devuelve el id del lote que ya sale arriba (para no repetirlo en «Lotes») o null
function ppTiendaParaTi(tarjeta, caja) {
  const p = ppParaTiPack(), hoy = p ? null : PP_OFERTAS_R.loteDeHoy(PP_CFG.lotes, ppDiaDeHoy());
  if (!p && !hoy) return null;
  ppTiendaSeccion(caja, tr('Para ti'));
  if (p) {
    ppOfertaArranca(p.k);   // salir aquí ya es salir: empieza a contar, como en el lado del camino
    const reloj = ppOfertaReloj(p.k);
    const t = ppTarjetaParaTi(tarjeta, reloj ? tr('QUEDAN {t}', { t: reloj }) : tr('SOLO UNA VEZ'), p.nombre, PP_CFG.ofertas[p.k], p.abre, tr('Cuando se acaba, no vuelve'));
    if (reloj) ppParaTiReloj(t, p.k);
    return null;
  }
  ppTarjetaParaTi(tarjeta, tr('LOTE DE HOY'), tr(hoy.nombre), hoy, () => ppCompraLote(hoy), tr('Mañana sale otro lote'));
  return hoy.id;
}
/* ---------- packs y lotes ---------- */
function ppTiendaPacks(tarjeta, caja) {
  ppTiendaSeccion(caja, tr('Perlas'));
  const mejor = PP_PRECIOS.mejorValor(PP_CFG.packs);
  for (const p of PP_CFG.packs) {
    const destaca = p.id === mejor || p.recomendado, mas = PP_PRECIOS.extra(p, PP_CFG.packs);
    tarjeta(`${ppCintaPack(p, mejor)}${ppPerlasHtml(p.perlas, 30)}${mas > 0 ? `<small>${tr('+{n} % de perlas', { n: mas })}</small>` : ''}<b>${p.precio}</b>`, () => ppCompraPack(p), destaca ? 'pp-pack-destaca' : '');
  }
}
// un lote con euros: lo da al momento en la compra de prueba; la de verdad la entrega el servidor (tareas #242 y #244)
function ppCompraLote(L) {
  const trae = ppLoTrae(L);
  ppCompraEuros(tr(L.nombre), ppPremioCandyHtml(trae, 30), L.id, () => { ppDaPremio(trae); ppGuarda(); ppTienda(); ppPintaLateral(); }, () => ppTienda());
}
function ppTiendaLotes(tarjeta, caja, arriba) {
  const lotes = PP_CFG.lotes.filter(L => L.id !== arriba);
  if (!lotes.length) return;
  ppTiendaSeccion(caja, tr('Lotes'), tr('perlas + ayudas + corazones'));
  for (const L of lotes) {
    const v = PP_PRECIOS.valorOferta(L, PP_CFG);
    tarjeta(`<span>${tr(L.corto)}</span>${ppPremioCandyHtml(ppLoTrae(L), 22)}${v === null ? '' : `<small>${tr('Vale {e}', { e: PP_PRECIOS.formato(v) })}</small>`}<b>${L.precio}</b>`, () => ppCompraLote(L), 'pp-lote' + (lotes.length === 2 ? ' pp-medio' : ''));
  }
}
/* ---------- lo que llevas a medias ---------- */
const ppBarraHtml = (n, max) => `<span class="pp-tienda-barra"><span style="width:${Math.round(100 * Math.min(1, n / Math.max(1, max)))}%"></span></span>`;
function ppTiendaAMedias(tarjeta, caja) {
  ppTiendaSeccion(caja, tr('Lo que llevas a medias'));
  const H = PP_CFG.hucha, n = SAVE.hucha || 0;
  tarjeta(`${ppIcono('i-hucha', 50, '#ffd1ec')}<span>${tr('Hucha')}: ${n}</span>${ppBarraHtml(n, H.max)}<b>${H.precio}</b>`, ppVentanaHucha, 'pp-medio');
  const P = ppPaseAlDia(), e = ppEscalon(), total = ppPaseNuevo() ? PP_PASE_R.CFG.escalones : PP_CFG.pase.escalones;
  tarjeta(`${ppIcono('i-pase', 50, '#ffd64a')}<span>${tr('Pase · escalón {e}', { e })}</span>${ppBarraHtml(e, total)}<b>${P.premium ? tr('¡Tuyo!') : PP_CFG.pase.precio}</b>`, ppVentanaPase, 'pp-medio');
}
// la pestaña entera (`tarjeta` y `caja` los pone ppTienda, js/tienda.js)
function ppTiendaPerlas(tarjeta, caja) {
  caja.classList.add('pp-packs-perlas');
  const arriba = ppTiendaParaTi(tarjeta, caja);
  ppTiendaPacks(tarjeta, caja);
  ppTiendaLotes(tarjeta, caja, arriba);
  ppTiendaAMedias(tarjeta, caja);
}
