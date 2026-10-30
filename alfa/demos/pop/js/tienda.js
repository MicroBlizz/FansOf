// Fans of Pop · TIENDA (fase 3, 30-10-2026: «la monetización de Candy Crush»): las PERLAS, la moneda de pago (como sus lingotes
// de oro), y los ANUNCIOS con premio. Todo voluntario y a precio fijo; nada con azar se paga (ADR 004).
// · Sin toques: ver un anuncio (+3 toques, una vez por intento), +5 toques con perlas (cada vez más caro) o rendirse (−1 corazón).
// · Sin corazones: el reloj, llenarlos con monedas o con perlas, o ver un anuncio (+1 corazón, 3 al día).
// · La tienda de perlas: los paquetes con euros pasan por la ventana de compra de core (MONEDAS.compraReal: Google Play en la app,
//   Paddle en la web cuando se abra; hasta que existan los productos, avisa de que llegarán con la app). Los anuncios los pone la
//   capa común (ANUNCIOS.ver: AdMob, H5 o el nuestro de reserva); como en Swipe, de momento solo en la alfa y en desarrollo.
'use strict';
const ppHayAnuncios = () => !!(typeof NUCLEO !== 'undefined' && (NUCLEO.alfa || NUCLEO.desarrollo)) && typeof ANUNCIOS !== 'undefined';
const ppHoy = () => new Date().toISOString().slice(0, 10);
function ppAnunciosHoy() { if (SAVE.anuncioDia !== ppHoy()) { SAVE.anuncioDia = ppHoy(); SAVE.anunciosHoy = 0; } return SAVE.anunciosHoy; }
// ver un anuncio y, si se ha visto entero, dar el premio
function ppVerAnuncio(sitio, premio, siNo) {
  ANUNCIOS.ver(sitio).then(r => { if (r && r.visto) premio(); else if (siNo) siNo(); }).catch(() => { if (siNo) siNo(); });
}
const ppPerlasHtml = (n, px = 30) => `<span class="pp-precio">${ppIcono('i-perla', px, '#ffd1ec')}${n}</span>`;
// un botón que se paga con perlas (si no llegan, abre la tienda en vez de pagar). `vuelta`: la ventana de la que vienes, que la
// tienda vuelve a abrir al pulsar VOLVER (con las perlas ya compradas). Sin ella, un nivel parado sin toques se quedaba bloqueado.
function ppBotonPerlas(texto, precio, clase, f, vuelta = null) {
  const b = ppBoton('', clase, () => { if ((SAVE.perlas || 0) >= precio) { SAVE.perlas -= precio; ppGuarda(); f(); } else ppTienda(vuelta); });
  b.innerHTML = `${texto} · ${ppPerlasHtml(precio, 28)}`;
  return b;
}
/* ---------- sin toques: seguir ---------- */
// T.parado ya está puesto (partida.js); el corazón aún no se ha perdido. `T.seguido`: cuántas veces se ha pagado en este intento.
function ppOfreceSeguir(T) {
  const quedan = T.up.reduce((a, v, i) => a + (T.mask[i] && v > 0 ? 1 : 0), 0);
  const precio = PP_CFG.perlas.seguir[Math.min(T.seguido || 0, PP_CFG.perlas.seguir.length - 1)];
  const t = ppAbre(`<h2>${tr('¡Sin toques!')}</h2><p class="pp-sub">${tr('¡Te quedan {n} burbujas! ¿Sigues?', { n: quedan })}</p><p class="pp-sub">${tr('Tienes:')} ${ppPerlasHtml(SAVE.perlas || 0, 26)}</p>`);
  const sigue = n => { ppCierra(); T.limite += n; T.parado = false; T.seguido = (T.seguido || 0) + 1; ppFlota(tr('+{n} toques', { n }), 270, 240, '#3a8ee6'); play('ppPremio'); };
  t.appendChild(ppBotonPerlas(tr('+{n} TOQUES', { n: PP_CFG.perlas.toquesSeguir }), precio, 'pp-btn', () => sigue(PP_CFG.perlas.toquesSeguir), () => ppOfreceSeguir(T)));
  if (ppHayAnuncios() && !T.anuncio) t.appendChild(ppBoton(tr('VER ANUNCIO: +{n} TOQUES', { n: PP_CFG.anuncio.toques }), 'pp-btn2 pp-verde', () => { T.anuncio = true; ppVerAnuncio('pop-toques', () => sigue(PP_CFG.anuncio.toques), () => ppOfreceSeguir(T)); }));
  t.appendChild(ppBoton(tr('Rendirse'), 'pp-btn2 pp-azul', () => { ppCierra(); T.hecho = true; ppSinToques(); }));
}
/* ---------- sin corazones ---------- */
function ppBotonesSinCorazones(t, alLlenar, vuelta = null) {
  t.appendChild(ppBotonPrecio(tr('LLENAR'), PP_CFG.precioVidas, 'pp-btn', () => { if (ppLlenaVidas()) alLlenar(); }));
  t.appendChild(ppBotonPerlas(tr('LLENAR'), PP_CFG.perlas.vidas, 'pp-btn2 pp-rosa', () => { SAVE.vidas = PP_CFG.vida; SAVE.vidaT = Date.now(); ppGuarda(); alLlenar(); }, vuelta));
  if (ppHayAnuncios() && ppAnunciosHoy() < PP_CFG.anuncio.vidasDia)
    t.appendChild(ppBoton(tr('VER ANUNCIO: +1 CORAZÓN ({n} hoy)', { n: PP_CFG.anuncio.vidasDia - ppAnunciosHoy() }), 'pp-btn2 pp-verde', () => ppVerAnuncio('pop-vida', () => { SAVE.anunciosHoy++; ppSumaVida(1); alLlenar(); })));
}
/* ---------- la tienda (con pestañas, como Candy Crush) ---------- */
// OFERTAS (pack de bienvenida, la de atasco, la hucha y el pase) · PERLAS (los paquetes con euros) · AYUDAS (con perlas, sueltas o
// de 3 en 3 más baratas) · BANDEJAS (las bonitas, con monedas). `vuelta`: la ventana a la que vuelve VOLVER (null: solo se cierra).
let PP_TIENDA_VUELTA = null, PP_TIENDA_PESTANA = 'ofertas';
function ppTienda(vuelta, pestana) {
  if (vuelta !== undefined) PP_TIENDA_VUELTA = vuelta;   // sin decir nada (al cambiar de pestaña) se mantiene
  if (pestana) PP_TIENDA_PESTANA = pestana;
  const t = ppAbre(`<h2>${tr('Tienda')}</h2><p class="pp-sub">${tr('Tienes:')} ${ppPerlasHtml(SAVE.perlas || 0, 28)} · ${ppMonedasHtml(SAVE.monedas, 28)}</p>`, true);
  const tabs = document.createElement('div'); tabs.className = 'pp-tabs';
  for (const [k, txt] of [['ofertas', tr('Ofertas')], ['perlas', tr('Perlas')], ['ayudas', tr('Ayudas')], ['bandejas', tr('Bandejas')]]) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'pp-tab' + (PP_TIENDA_PESTANA === k ? ' pp-on' : ''); b.textContent = txt;
    b.onclick = () => { play('select'); ppTienda(undefined, k); }; tabs.appendChild(b);
  }
  t.appendChild(tabs);
  const caja = document.createElement('div'); caja.className = 'pp-packs'; t.appendChild(caja);
  const tarjeta = (html, f, clase = '') => { const b = document.createElement('button'); b.type = 'button'; b.className = 'pp-pack ' + clase; b.innerHTML = html; b.onclick = () => { play('select'); f(); }; caja.appendChild(b); return b; };
  const P = PP_TIENDA_PESTANA;
  if (P === 'ofertas') {
    if (ppBienvenidaVisible()) tarjeta(`<i>-80 %</i>${ppIcono('i-perlas', 60, '#ffd1ec')}<span>${tr('Pack de bienvenida')}</span><b>${PP_CFG.ofertas.bienvenida.precio}</b>`, ppVentanaBienvenidaPack, 'pp-ancho');
    if (ppAtascoActivo()) tarjeta(`<i>${ppReloj(SAVE.atasco - Date.now())}</i>${ppIcono('i-martillo', 60, '#ffd1ec')}<span>${tr('Oferta para desatascarte')}</span><b>${PP_CFG.ofertas.atasco.precio}</b>`, ppVentanaAtasco, 'pp-ancho');
    tarjeta(`${ppIcono('i-pase', 56, '#ffd64a')}<span>${tr('Pase de Pop')}</span><b>${ppPaseAlDia().premium ? tr('¡Tuyo!') : PP_CFG.pase.precio}</b>`, ppVentanaPase);
    tarjeta(`${ppIcono('i-hucha', 56, '#ffd1ec')}<span>${tr('Hucha')}: ${SAVE.hucha || 0}</span><b>${PP_CFG.hucha.precio}</b>`, ppVentanaHucha);
    for (const o of PP_CFG.infinitas) tarjeta(`${ppIcono('i-infinito', 50, '#ff4a6a')}<span>${o.min >= 60 ? tr('{n} h', { n: o.min / 60 }) : tr('{n} min', { n: o.min })}</span>${ppPerlasHtml(o.perlas, 26)}`, () => {
      if ((SAVE.perlas || 0) < o.perlas) { ppTienda(undefined, 'perlas'); return; }
      SAVE.perlas -= o.perlas; ppDaInfinitas(o.min); play('ppPremio'); ppTienda(); ppPintaLateral();
    });
  } else if (P === 'perlas') {
    for (const p of PP_CFG.packs) tarjeta(`${p.extra ? `<i>${p.extra}</i>` : ''}${ppPerlasHtml(p.perlas, 34)}<b>${p.precio}</b>`, () => ppCompraPack(p));
  } else if (P === 'ayudas') {
    for (const k in PP_CFG.ayudas) {
      const A = PP_CFG.ayudas[k], tres = Math.round(A.perlas * 3 * PP_CFG.ayudasTres);
      const compra = (n, precio) => { if ((SAVE.perlas || 0) < precio) { ppTienda(undefined, 'perlas'); return; } SAVE.perlas -= precio; ppDaAyuda(k, n); play('ppPremio'); ppTienda(); ppBarraAyudas(); };
      tarjeta(`${ppIcono('i-' + k, 50, '#ffd1ec')}<span>${tr(A.nombre)} · ${tr('tienes {n}', { n: ppTengo(k) })}</span><small>${tr(A.texto)}</small>${ppPerlasHtml(A.perlas, 24)}`, () => compra(1, A.perlas));
      tarjeta(`<i>-20 %</i>${ppIcono('i-' + k, 50, '#ffd1ec')}<span>${tr(A.nombre)} x3</span>${ppPerlasHtml(tres, 24)}`, () => compra(3, tres));
    }
  } else {
    for (const B of PP_BANDEJAS) {
      const tiene = ppTieneBandeja(B.id), puesta = ppBandejaActual().id === B.id;
      if (B.precio === null && !tiene) { tarjeta(`${ppBandejaMuestra(B.id, 56)}<span>${tr(B.nombre)}</span><small>${tr('Solo con el pase')}</small>`, ppVentanaPase); continue; }
      tarjeta(`${ppBandejaMuestra(B.id, 56)}<span>${tr(B.nombre)}</span><b>${puesta ? tr('Puesta') : tiene ? tr('Ponerla') : ''}</b>${!tiene ? ppMonedasHtml(B.precio, 24) : ''}`, () => {
        if (!tiene) { if (!ppCobra(B.precio)) { ppFlota(tr('Te faltan monedas'), 270, 300, '#ff6ec7'); return; } SAVE.bandejas = Object.assign(SAVE.bandejas || {}, { [B.id]: true }); play('ppPremio'); }
        SAVE.bandeja = B.id; ppGuarda(); ppTienda();
      }, puesta ? 'pp-puesta' : '');
    }
  }
  t.appendChild(ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul', () => { const v = PP_TIENDA_VUELTA; PP_TIENDA_VUELTA = null; ppCierra(); if (v) v(); }));
}
function ppCompraPack(p) {
  if (typeof MONEDAS === 'undefined') return;
  MONEDAS.compraReal(tr('{n} perlas', { n: p.perlas }), `<p>${tr('{n} perlas por {p}.', { n: p.perlas, p: p.precio })}</p>`, r => {
    if (r && r.real) { ppTienda(); return; }   // la de verdad la entrega el servidor (el saldo ya llega con la partida)
    SAVE.perlas = (SAVE.perlas || 0) + p.perlas; ppGuarda(); play('ppPremio'); ppTienda();   // compra de prueba (desarrollo)
  }, p.id);
}
