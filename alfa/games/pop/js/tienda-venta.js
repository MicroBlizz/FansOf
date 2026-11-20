// Fans of Pop · TIENDA QUE VENDE (tarea #187, Pepins 20-11-2026, de las mejoras de la probadora experta en cobrar): lo que hay
// dentro de cada pestaña de la tienda (ppTienda, js/tienda.js), el pack de «Sin toques» y «comprar solo lo que falta».
// Todo honesto (tarea #177): nada tachado ni «-80 %»; MEJOR VALOR es el pack más barato por perla (js/precios.js) y RECOMENDADO,
// nuestra opinión (PP_CFG.packs[].recomendado); el «Vale X €» de cada pack sale de PP_PRECIOS.valorOferta, siempre a la baja.
'use strict';
/* ---------- las pestañas ---------- */
// `tarjeta(html, alPulsar, clase)` la pone ppTienda
function ppTiendaOfertas(tarjeta) {
  if (!ppVentaCerrada()) ppTiendaOfertasEuros(tarjeta);   // un menor no ve nada con euros (tarea #254)
  ppTiendaInfinitas(tarjeta);
}
function ppTiendaOfertasEuros(tarjeta) {
  if (ppBienvenidaVisible()) tarjeta(`${ppValorEtiqueta(PP_CFG.ofertas.bienvenida)}${ppIcono('i-perlas', 60, '#ffd1ec')}<span>${tr('Pack de bienvenida')}</span><b>${PP_CFG.ofertas.bienvenida.precio}</b>`, ppVentanaBienvenidaPack, 'pp-ancho');
  if (ppPackMundo2Visible()) tarjeta(`${ppValorEtiqueta(PP_CFG.ofertas.mundo2)}${ppIcono('i-regalo', 60, '#ffd1ec')}<span>${tr('Pack del mundo 2')}</span><b>${PP_CFG.ofertas.mundo2.precio}</b>`, ppVentanaPackMundo2, 'pp-ancho');
  tarjeta(`${ppIcono('i-martillo', 60, '#ffd1ec')}<span>${tr('Pack para desatascarte')}</span><b>${PP_CFG.ofertas.atasco.precio}</b>`, ppVentanaAtasco, 'pp-ancho');   // siempre, sin reloj (tarea #186)
  tarjeta(`${ppIcono('i-pase', 56, '#ffd64a')}<span>${tr('Pase de Pop')}</span><b>${ppPaseAlDia().premium ? tr('¡Tuyo!') : PP_CFG.pase.precio}</b>`, ppVentanaPase);
  tarjeta(`${ppIcono('i-hucha', 56, '#ffd1ec')}<span>${tr('Hucha')}: ${SAVE.hucha || 0}</span><b>${PP_CFG.hucha.precio}</b>`, ppVentanaHucha);
}
function ppTiendaInfinitas(tarjeta) {
  for (const o of PP_CFG.infinitas) {
    const compra = () => {   // si faltan perlas, al comprar el pack se vuelve aquí y se compra (comprar solo lo que falta)
      if (!ppPerlas(-o.perlas, 'infinitas')) { ppFaltanPerlas(o.perlas, compra, () => ppTienda()); return; }
      ppDaInfinitas(o.min); play('ppPremio'); ppTienda(); ppPintaLateral();
    };
    tarjeta(`${ppIcono('i-infinito', 50, '#ff4a6a')}<span>${o.min >= 60 ? tr('{n} h', { n: o.min / 60 }) : tr('{n} min', { n: o.min })}</span>${ppPerlasPrecioHtml(o.perlas, 26)}`, compra);
  }
}
// la cinta de un pack: MEJOR VALOR (un dato) gana a RECOMENDADO (una opinión)
function ppCintaPack(p, mejor) {
  if (p.id === mejor) return `<em class="pp-cinta pp-cinta-oro">${tr('MEJOR VALOR')}</em>`;
  return p.recomendado ? `<em class="pp-cinta">${tr('RECOMENDADO')}</em>` : '';
}
function ppTiendaPerlas(tarjeta) {
  const mejor = PP_PRECIOS.mejorValor(PP_CFG.packs);
  for (const p of PP_CFG.packs) {
    const destaca = p.id === mejor || p.recomendado;
    tarjeta(`${ppCintaPack(p, mejor)}${p.extra ? `<i>${p.extra}</i>` : ''}${ppPerlasHtml(p.perlas, 34)}<b>${p.precio}</b>`, () => ppCompraPack(p), destaca ? 'pp-pack-destaca' : '');
  }
}
function ppTiendaAyudas(tarjeta) {
  for (const k in PP_CFG.ayudas) {
    const A = PP_CFG.ayudas[k], tres = PP_PRECIOS.lote(A.perlas, 3, PP_CFG.ayudasTres);
    const compra = (n, precio) => {
      if (!ppPerlas(-precio, 'ayuda')) { ppFaltanPerlas(precio, () => compra(n, precio), () => ppTienda()); return; }
      ppDaAyuda(k, n); play('ppPremio'); ppTienda(); ppBarraAyudas();
    };
    tarjeta(`${ppIcono('i-' + k, 50, '#ffd1ec')}<span>${tr(A.nombre)} · ${tr('tienes {n}', { n: ppTengo(k) })}</span><small>${tr(A.texto)}</small>${ppPerlasPrecioHtml(A.perlas, 24)}`, () => compra(1, A.perlas));
    tarjeta(`<i>-20 %</i>${ppIcono('i-' + k, 50, '#ffd1ec')}<span>${tr(A.nombre)} x3</span><small>${tr('Ahorras {n} perlas', { n: tres.ahorro })}</small>${ppPerlasPrecioHtml(tres.precio, 24)}`, () => compra(3, tres.precio));
  }
}
function ppTarjetaBandeja(tarjeta, B) {
  const tiene = ppTieneBandeja(B.id), puesta = ppBandejaActual().id === B.id;
  if (B.temporada && !tiene) return;   // las de temporada del pase solo salen si ya la tienes (tarea #165)
  if (ppEsBandejaLujo(B) && !tiene && ppVentaCerrada()) return;   // se paga con euros (tarea #254)
  if (ppEsBandejaLujo(B) && !tiene) { tarjeta(ppTarjetaBandejaLujoHtml(B), () => ppCompraBandejaLujo(B, () => ppTienda()), 'pp-pack-destaca'); return; }
  if (B.precio === null && !tiene) { tarjeta(`${ppBandejaMuestra(B.id, 56)}<span>${tr(B.nombre)}</span><small>${tr('Solo con el pase')}</small>`, ppVentanaPase); return; }
  tarjeta(`${ppBandejaMuestra(B.id, 56)}<span>${tr(B.nombre)}</span><b>${puesta ? tr('Puesta') : tiene ? tr('Ponerla') : ''}</b>${!tiene ? ppMonedasHtml(B.precio, 24) : ''}`, () => {
    if (!tiene) { if (!ppCobra(B.precio)) { ppFlota(tr('Te faltan monedas'), 270, 300, '#ff6ec7'); return; } SAVE.bandejas = Object.assign(SAVE.bandejas || {}, { [B.id]: true }); play('ppPremio'); }
    SAVE.bandeja = B.id; ppGuarda(); ppTienda();
  }, puesta ? 'pp-puesta' : '');
}
function ppTiendaBandejas(tarjeta) { for (const B of PP_BANDEJAS) ppTarjetaBandeja(tarjeta, B); }
const PP_TIENDA_PESTANAS = { ofertas: ppTiendaOfertas, perlas: ppTiendaPerlas, ayudas: ppTiendaAyudas, bandejas: ppTiendaBandejas };
/* ---------- comprar solo lo que falta ---------- */
// no llegan las perlas para algo concreto: el pack más pequeño que llega y, al comprarlo, se hace lo que pediste (`reintenta`).
// `vuelta`: lo que se abre al decir «Ahora no» (null: solo se cierra). Sin pack que llegue, a la pestaña Perlas.
function ppFaltanPerlas(precio, reintenta, vuelta = null) {
  const faltan = precio - (SAVE.perlas || 0), p = PP_PRECIOS.packQueLlega(faltan, PP_CFG.packs);
  if (ppVentaCerrada()) { ppFaltanPerlasSinPack(faltan, vuelta); return; }   // menor: sin packs (tarea #254)
  if (!p) { ppTienda(vuelta, 'perlas'); return; }
  const t = ppAbre(`<h2>${tr('Te faltan {n} perlas', { n: faltan })}</h2><p class="pp-sub">${tr('Tienes:')} ${ppPerlasHtml(SAVE.perlas || 0, 26)}</p><p class="pp-sub">${tr('Con este pack te llega y se hace al momento:')}</p>`);
  const b = ppBoton('', 'pp-btn pp-pago', () => ppCompraPack(p, () => { if ((SAVE.perlas || 0) >= precio) reintenta(); else ppFaltanPerlas(precio, reintenta, vuelta); }));
  b.innerHTML = `${ppPerlasHtml(p.perlas, 28)} · ${p.precio}`;
  t.appendChild(b);
  t.appendChild(ppBoton(tr('VER TODOS LOS PACKS'), 'pp-btn2 pp-sec', () => ppTienda(vuelta, 'perlas')));
  t.appendChild(ppBoton(tr('Ahora no'), 'pp-btn2 pp-volver', () => { ppCierra(); if (vuelta) vuelta(); }));
}
/* ---------- el pack de «Sin toques» ---------- */
// una vez por intento, debajo de +5 toques: el Martillo y la Bomba van a la barra y los 3 toques se suman ya (`sigue`)
function ppBotonPackSinToques(t, T, sigue) {
  const o = PP_CFG.ofertas.sinToques;
  if (!o || T.packSinToques || ppVentaCerrada()) return;
  const v = PP_PRECIOS.valorOferta(o, PP_CFG), resto = Object.assign({}, o.ayudas); delete resto.toques3;
  const b = ppBoton('', 'pp-btn2 pp-pago pp-pack-sin', () => ppCompraEuros(tr('Pack sin atascos'), ppPremioCandyHtml({ ayudas: o.ayudas }, 30), o.id, () => {
    T.packSinToques = true; ppDaPremio({ ayudas: resto }); ppBarraAyudas(); sigue(3);   // la ayuda «+3 toques», gastada ya
  }, () => { T.packSinToques = true; ppBarraAyudas(); ppOfreceSeguir(T); }));
  b.innerHTML = `${tr('PACK SIN ATASCOS')} · ${o.precio}<span class="pp-pack-sin-trae">${ppIcono('i-martillo', 24, '#ffd1ec')}${ppIcono('i-bomba', 24, '#bfe9ff')}${ppIcono('i-toques3', 24, '#ffd1ec')}${v === null ? '' : `<small>${tr('Vale {e}', { e: PP_PRECIOS.formato(v) })}</small>`}</span>`;
  t.appendChild(b);
}
// un menor no puede comprar perlas: se le dice cuántas le faltan y cómo ganarlas jugando
function ppFaltanPerlasSinPack(faltan, vuelta) {
  const t = ppAbre(`<h2>${tr('Te faltan {n} perlas', { n: faltan })}</h2><p class="pp-sub">${tr('Tienes:')} ${ppPerlasHtml(SAVE.perlas || 0, 26)}</p><p class="pp-sub">${tr('Las perlas también se ganan jugando: con el regalo diario y los premios del pase.')}</p>`);
  t.appendChild(ppBoton(tr('Ahora no'), 'pp-btn2 pp-volver', () => { ppCierra(); if (vuelta) vuelta(); }));
}
