// Fans of Pop · OFERTAS («copiarnos de Candy Crush», Daniel, 30-10-2026). Todo a precio fijo, nada de azar (ADR 004):
// · PACK DE BIENVENIDA: una sola vez, muy rebajado (perlas, ayudas y una hora de corazones infinitos). Sale solo una vez al
//   llegar al nivel PP_CFG.ofertas.bienvenida.desdeNivel y siempre arriba en la tienda hasta que se compra.
// · OFERTA DE ATASCO: al fallar el mismo nivel varias veces se abre durante media hora un pack de ayudas rebajado (con reloj).
// · CORAZONES INFINITOS por tiempo, con perlas (PP_CFG.infinitas).
// · HUCHA: cada nivel nuevo mete perlas; desde un mínimo se rompe pagando y te las quedas todas.
// Lo que se paga con euros pasa por MONEDAS.compraReal de core (Play en la app; en desarrollo, compra de prueba; en la web aún no).
// Aquí también el reparto de premios común (ppDaPremio) que usan el regalo diario y el pase.
'use strict';
/* ---------- premios ---------- */
// un premio es { monedas, perlas, ayudas: { martillo: 2 }, infinitas: minutos, bandeja: id }
function ppDaPremio(p) {
  if (p.monedas) SAVE.monedas += p.monedas;
  if (p.perlas) SAVE.perlas = (SAVE.perlas || 0) + p.perlas;
  for (const k in p.ayudas || {}) ppDaAyuda(k, p.ayudas[k]);
  if (p.infinitas) ppDaInfinitas(p.infinitas);
  if (p.bandeja) { SAVE.bandejas = SAVE.bandejas || {}; SAVE.bandejas[p.bandeja] = true; }
  ppGuarda();
}
// el premio en HTML (iconos de Yoshi y cantidades)
function ppPremioCandyHtml(p, px = 30) {
  const h = [];
  if (p.perlas) h.push(ppPerlasHtml(p.perlas, px));
  if (p.monedas) h.push(ppMonedasHtml(p.monedas, px));
  for (const k in p.ayudas || {}) h.push(`<span class="pp-precio">${ppIcono('i-' + k, px, '#ffd1ec')}x${p.ayudas[k]}</span>`);
  if (p.infinitas) h.push(`<span class="pp-precio">${ppIcono('i-infinito', px, '#ff4a6a')}${p.infinitas >= 60 ? tr('{n} h', { n: p.infinitas / 60 }) : tr('{n} min', { n: p.infinitas })}</span>`);
  if (p.bandeja) h.push(`<span class="pp-precio">${ppBandejaMuestra(p.bandeja, px)}${tr(ppBandejaDe(p.bandeja).nombre)}</span>`);
  return `<span class="pp-premios">${h.join(' ')}</span>`;
}
/* ---------- compras con euros ---------- */
function ppCompraEuros(titulo, html, producto, alComprar) {
  if (ppCompraDePrueba()) { alComprar(); play('ppPremio'); ppFlota(tr('Compra de prueba'), 270, 300, '#4fc964'); return; }   // panel DEV (js/dev.js): sin cobrar
  if (typeof MONEDAS === 'undefined') return;
  MONEDAS.compraReal(titulo, html, r => { if (r && r.real) { ppGuarda(); return; } alComprar(); play('ppPremio'); }, producto);   // la de verdad la entrega el servidor
}
/* ---------- pack de bienvenida ---------- */
const ppBienvenidaVisible = () => !SAVE.compras || !SAVE.compras.bienvenida;
function ppVentanaBienvenidaPack() {
  const o = PP_CFG.ofertas.bienvenida, premio = { perlas: o.perlas, ayudas: o.ayudas, infinitas: o.infinitas };
  const t = ppAbre(`<h2>${tr('¡Pack de bienvenida!')}</h2><p class="pp-sub">${tr('Solo una vez, para empezar a lo grande:')}</p>${ppPremioCandyHtml(premio, 40)}
    <p class="pp-sub"><s>${o.antes}</s> <b class="pp-oferta">${o.precio}</b></p>`, true);
  t.appendChild(ppBoton(tr('¡LO QUIERO!'), 'pp-btn', () => ppCompraEuros(tr('Pack de bienvenida'), ppPremioCandyHtml(premio, 30), o.id, () => {
    ppDaPremio(premio); SAVE.compras = Object.assign(SAVE.compras || {}, { bienvenida: true }); ppGuarda(); ppCierra(); ppPintaLateral();
  })));
  t.appendChild(ppBoton(tr('Ahora no'), 'pp-btn2 pp-azul', ppCierra));
}
// sale sola una vez, al volver al camino desde el nivel en que toca
function ppMiraBienvenida() {
  if (!PP_P || !ppBienvenidaVisible() || SAVE.vistoBienvenida || PP_P.nivel < PP_CFG.ofertas.bienvenida.desdeNivel) return false;
  SAVE.vistoBienvenida = true; ppGuarda(); ppVentanaBienvenidaPack(); return true;
}
/* ---------- oferta de atasco ---------- */
const ppAtascoActivo = () => (SAVE.atasco || 0) > Date.now();
function ppMiraAtasco(fallos) {
  if (fallos < PP_CFG.ofertas.atasco.fallos || ppAtascoActivo() || SAVE.atascoDia === ppHoy()) return;
  SAVE.atasco = Date.now() + PP_CFG.ofertas.atasco.dura * 60000; SAVE.atascoDia = ppHoy(); ppGuarda();   // una vez al día como mucho
}
function ppVentanaAtasco() {
  const o = PP_CFG.ofertas.atasco, premio = { perlas: o.perlas, ayudas: o.ayudas };
  const t = ppAbre(`<h2>${tr('¡Oferta para desatascarte!')}</h2><p class="pp-sub" id="pp-reloj-oferta"></p>${ppPremioCandyHtml(premio, 40)}
    <p class="pp-sub"><s>${o.antes}</s> <b class="pp-oferta">${o.precio}</b></p>`, true);
  const reloj = () => { const el = $pp('#pp-reloj-oferta'); if (!el) { clearInterval(tic); return; } el.textContent = tr('Se acaba en {t}', { t: ppReloj(Math.max(0, SAVE.atasco - Date.now())) }); };
  const tic = setInterval(reloj, 1000); reloj();
  t.appendChild(ppBoton(tr('¡LO QUIERO!'), 'pp-btn', () => ppCompraEuros(tr('Oferta para desatascarte'), ppPremioCandyHtml(premio, 30), o.id, () => {
    ppDaPremio(premio); SAVE.atasco = 0; ppGuarda(); ppCierra(); ppBarraAyudas(); ppPintaLateral();
  })));
  t.appendChild(ppBoton(tr('Ahora no'), 'pp-btn2 pp-azul', () => { clearInterval(tic); ppCierra(); }));
}
// el botón de la oferta en las ventanas de fallar (si está activa)
function ppBotonOferta(t) {
  if (!ppAtascoActivo()) return;
  const b = ppBoton('', 'pp-btn2 pp-oferta-btn', ppVentanaAtasco);
  b.innerHTML = `${tr('¡OFERTA!')} ${ppIcono('i-martillo', 26, '#ffd1ec')}${ppIcono('i-bomba', 26, '#bfe9ff')} · ${ppReloj(SAVE.atasco - Date.now())}`;
  t.appendChild(b);
}
/* ---------- corazones infinitos ---------- */
function ppBotonInfinitas(t, alComprar) {
  const fila = document.createElement('div'); fila.className = 'pp-fila';
  for (const o of PP_CFG.infinitas) {
    const b = ppBoton('', 'pp-btn2 pp-rosa', () => { if ((SAVE.perlas || 0) < o.perlas) { ppTienda(() => ppVentanaSinCorazones(), 'perlas'); return; } SAVE.perlas -= o.perlas; ppDaInfinitas(o.min); play('ppPremio'); alComprar(); });
    b.innerHTML = `${ppIcono('i-infinito', 26, '#ff4a6a')}${o.min >= 60 ? tr('{n} h', { n: o.min / 60 }) : tr('{n} min', { n: o.min })} · ${ppPerlasHtml(o.perlas, 22)}`;
    fila.appendChild(b);
  }
  t.insertAdjacentHTML('beforeend', `<p class="pp-sub">${tr('Corazones infinitos:')}</p>`);
  t.appendChild(fila);
}
/* ---------- la hucha ---------- */
function ppMeteHucha(jefe) { const H = PP_CFG.hucha; SAVE.hucha = Math.min(H.max, (SAVE.hucha || 0) + (jefe ? H.porJefe : H.porNivel)); ppGuarda(); }
function ppVentanaHucha() {
  ppTutorial('hucha');
  const H = PP_CFG.hucha, n = SAVE.hucha || 0, puede = n >= H.minimo;
  const t = ppAbre(`<h2>${tr('Hucha de perlas')}</h2><div class="pp-cofre">${ppIcono('i-hucha', 110, '#ffd1ec')}</div>
    <p class="pp-premio">${ppPerlasHtml(n, 36)} <small>/ ${H.max}</small></p>
    <p class="pp-sub">${tr('Cada nivel nuevo que pasas mete perlas en la hucha. Rómpela y quédatelas todas.')}</p>
    ${puede ? '' : `<p class="pp-sub">${tr('Se puede romper desde {n} perlas.', { n: H.minimo })}</p>`}`);
  if (puede) t.appendChild(ppBoton(tr('ROMPER LA HUCHA · {p}', { p: H.precio }), 'pp-btn', () => ppCompraEuros(tr('Hucha de perlas'), `<p>${tr('{n} perlas por {p}.', { n, p: H.precio })}</p>`, H.id, () => {
    SAVE.perlas = (SAVE.perlas || 0) + (SAVE.hucha || 0); SAVE.hucha = 0; ppGuarda(); ppCierra(); ppPintaLateral(); ppFlota(tr('+{n} perlas', { n }), 270, 300, '#ff6ec7');
  })));
  t.appendChild(ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul', ppCierra));
}
/* ---------- los botones del lado del camino ---------- */
// HTML (#pp-lateral), a la derecha del camino: regalo diario, pase, hucha y las ofertas que estén abiertas
function ppPintaLateral() {
  const L = $pp('#pp-lateral'); if (!L) return;
  L.hidden = PP_PANT.actual !== 'mapa'; if (L.hidden) return;
  L.innerHTML = '';
  const boton = (ico, col, texto, f, aviso) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'pp-lado' + (aviso ? ' pp-aviso' : '');
    b.innerHTML = `${ppIcono(ico, 58, col)}<b>${texto}</b>`; b.onclick = () => { play('select'); f(); }; L.appendChild(b);
  };
  boton('i-regalo', '#9cf0a0', tr('Regalo'), ppVentanaRegalo, SAVE.regaloDia !== ppHoy());
  boton('i-pase', '#ffd64a', tr('Pase'), ppVentanaPase, ppPaseHayPremio());
  boton('i-hucha', '#ffd1ec', String(SAVE.hucha || 0), ppVentanaHucha, (SAVE.hucha || 0) >= PP_CFG.hucha.minimo);
  if (ppBienvenidaVisible()) boton('i-perlas', '#ffd1ec', tr('Oferta'), ppVentanaBienvenidaPack, true);
  if (ppAtascoActivo()) boton('i-martillo', '#ffd1ec', ppReloj(SAVE.atasco - Date.now()), ppVentanaAtasco, true);
  if (ppInfinitas()) boton('i-infinito', '#ff4a6a', ppReloj(SAVE.infinitas - Date.now()), () => {}, false);
}
