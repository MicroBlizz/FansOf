// Fans of Pop · OFERTAS («copiarnos de Candy Crush», Daniel, 30-10-2026). Todo a precio fijo, nada de azar (ADR 004):
// · PACK DE BIENVENIDA: una sola vez (perlas, ayudas y una hora de corazones infinitos). Sale solo una vez al llegar al nivel
//   PP_CFG.ofertas.bienvenida.desdeNivel y dura sus `horas` desde que sale (con reloj); luego desaparece (tarea #187).
// · PACK DEL MUNDO 2: igual, al llegar el camino al mundo 2 (PP_CFG.ofertas.mundo2). Las reglas, en js/ofertas-reglas.js.
// · OFERTA DE ATASCO: al fallar el mismo nivel varias veces se abre durante media hora un pack de ayudas rebajado (con reloj).
// · CORAZONES INFINITOS por tiempo, con perlas (PP_CFG.infinitas).
// · HUCHA: cada nivel nuevo mete perlas; desde un mínimo se rompe pagando y te las quedas todas.
// Lo que se paga con euros pasa por MONEDAS.compraReal de core (Play en la app; en desarrollo, compra de prueba; en la web aún no).
// Aquí también el reparto de premios común (ppDaPremio) que usan el regalo diario y el pase.
'use strict';
/* ---------- premios ---------- */
// un premio es { monedas, perlas, ayudas: { martillo: 2 }, infinitas: minutos, bandeja: id }. `origen` = { motivo, clave } dice al servidor de dónde
// salen sus perlas (el regalo diario y el pase; js/perlas-libro.js); sin él son de una compra de prueba y no van al servidor
function ppDaPremio(p, origen = null) {
  if (p.monedas) SAVE.monedas += p.monedas;
  if (p.perlas) ppPerlas(p.perlas, origen && origen.motivo, origen && origen.clave);
  for (const k in p.ayudas || {}) ppDaAyuda(k, p.ayudas[k]);
  if (p.infinitas) ppDaInfinitas(p.infinitas);
  if (p.bandeja) { SAVE.bandejas = SAVE.bandejas || {}; SAVE.bandejas[p.bandeja] = true; }
  if (p.companero) ppViaGana(p.companero);   // solo llega con el flag `companeros` (pase y Feria: js/companeros-vias.js)
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
  if (p.companero) h.push(ppViaPremioHtml(p.companero, px));
  return `<span class="pp-premios">${h.join(' ')}</span>`;
}
/* ---------- compras con euros ---------- */
// `alVolver` (opcional): lo que se abre cuando acaba la compra de verdad, que entrega el servidor (p. ej. la ventana de perder)
function ppCompraEuros(titulo, html, producto, alComprar, alVolver) {
  if (ppEdadDecide() !== 'vende') { ppAntesDeVender(() => ppCompraEuros(titulo, html, producto, alComprar, alVolver)); return; }   // tarea #254: menores, no
  if (ppCompraDePrueba()) { alComprar(); play('ppPremio'); ppFlota(tr('Compra de prueba'), 270, 300, '#4fc964'); return; }   // panel DEV (js/dev.js): sin cobrar
  if (typeof MONEDAS === 'undefined') return;
  MONEDAS.compraReal(titulo, html, r => { if (r && r.real) { ppGuarda(); if (alVolver) alVolver(); return; } alComprar(); play('ppPremio'); }, producto);   // la de verdad la entrega el servidor
}
/* ---------- lo que vale una oferta (tarea #177) ---------- */
// en vez de un precio tachado que nunca se cobró: lo que vale lo que trae (js/precios.js, siempre a la baja) y su precio
function ppValorHtml(o) {
  const v = PP_PRECIOS.valorOferta(o, PP_CFG);
  return (v === null ? '' : `<p class="pp-sub pp-valor">${tr('Lo que trae vale {e}', { e: PP_PRECIOS.formato(v) })}</p>`) + `<p class="pp-sub"><b class="pp-oferta">${o.precio}</b></p>`;
}
// la etiqueta de la tarjeta de la tienda («Vale 6,50 €»); nada si no se puede calcular
function ppValorEtiqueta(o) {
  const v = PP_PRECIOS.valorOferta(o, PP_CFG);
  return v === null ? '' : `<i>${tr('Vale {e}', { e: PP_PRECIOS.formato(v) })}</i>`;
}
/* ---------- packs con reloj: el de bienvenida y el del mundo 2 (tarea #187, reglas en js/ofertas-reglas.js) ---------- */
// SAVE.ofertasDesde[k] = la hora (ms) de la primera vez que salió la oferta k; SAVE.compras[k] = ya comprada
const ppOfertaMarca = k => (SAVE.ofertasDesde || {})[k];
const ppOfertaComprada = k => Boolean(SAVE.compras && SAVE.compras[k]);
const ppOfertaQueda = k => PP_OFERTAS_R.queda(PP_CFG.ofertas[k], ppOfertaMarca(k), Date.now());
const ppOfertaEstado = k => ({ oferta: PP_CFG.ofertas[k], marca: ppOfertaMarca(k), comprada: ppOfertaComprada(k), ahora: Date.now() });
// la primera vez que sale se apunta la hora (las partidas viejas que ya la habían visto empiezan a contar ahora)
function ppOfertaArranca(k) {
  SAVE.ofertasDesde = SAVE.ofertasDesde || {};
  if (Number.isFinite(SAVE.ofertasDesde[k])) return;
  SAVE.ofertasDesde[k] = PP_OFERTAS_R.desde(SAVE.ofertasDesde[k], Date.now()); ppGuarda();
}
// el texto del reloj (sin horas no caduca y no lleva reloj)
const ppOfertaReloj = k => { const q = ppOfertaQueda(k); return q === Infinity ? '' : ppReloj(q); };
const ppBienvenidaVisible = () => PP_OFERTAS_R.visible(ppOfertaEstado('bienvenida'));
// el segundo pack: cuando el camino llega al mundo 2 (la tienda pone su tarjeta si esto dice que sí)
const ppPackMundo2Visible = () => Boolean(PP_P) && PP_OFERTAS_R.visibleMundo(Object.assign(ppOfertaEstado('mundo2'), { mundo: ppMundoActual() }));
// «Se acaba en …» en la ventana abierta; al caducar se cierra y el botón del lado desaparece
function ppOfertaTic(k) {
  // atado a SU texto: si la ventana se cierra (ppCierra solo la esconde) o la sustituye otra, el reloj se para y no toca la nueva
  const el = $pp('#pp-reloj-pack'), modal = $pp('#pp-modal');
  const pinta = () => {
    if (!el || !el.isConnected || (modal && modal.hidden)) { clearInterval(tic); return; }
    const q = ppOfertaQueda(k);
    if (q <= 0) { clearInterval(tic); ppCierra(); ppPintaLateral(); return; }
    el.textContent = q === Infinity ? '' : tr('Se acaba en {t}', { t: ppReloj(q) });
  };
  const tic = setInterval(pinta, 1000); pinta();
  return tic;
}
// la ventana de un pack con reloj: `k` en PP_CFG.ofertas, su título, la frase de debajo y el nombre de la compra
function ppVentanaPackReloj(k, titulo, sub, nombre) {
  ppOfertaArranca(k);
  const o = PP_CFG.ofertas[k], premio = { perlas: o.perlas, ayudas: o.ayudas, infinitas: o.infinitas };
  const t = ppAbre(`<h2>${titulo}</h2><p class="pp-sub">${sub}</p><p class="pp-sub" id="pp-reloj-pack"></p>${ppPremioCandyHtml(premio, 40)}
    ${ppValorHtml(o)}`, true);
  const tic = ppOfertaTic(k);
  t.appendChild(ppBoton(tr('¡LO QUIERO!'), 'pp-btn', () => ppCompraEuros(nombre, ppPremioCandyHtml(premio, 30), o.id, () => {
    clearInterval(tic); ppDaPremio(premio); SAVE.compras = Object.assign(SAVE.compras || {}, { [k]: true }); ppGuarda(); ppCierra(); ppPintaLateral();
  })));
  t.appendChild(ppBoton(tr('Ahora no'), 'pp-btn2 pp-azul', () => { clearInterval(tic); ppCierra(); }));
}
/* ---------- pack de bienvenida ---------- */
const ppVentanaBienvenidaPack = () => ppVentanaPackReloj('bienvenida', tr('¡Pack de bienvenida!'), tr('Solo una vez, para empezar a lo grande:'), tr('Pack de bienvenida'));
// sale sola una vez, al volver al camino desde el nivel en que toca
function ppMiraBienvenida() {
  if (!PP_P || !ppBienvenidaVisible() || !ppPrimerosVe('oferta') || SAVE.vistoBienvenida || PP_P.nivel < PP_CFG.ofertas.bienvenida.desdeNivel) return false;
  if (ppVentaCerrada()) return false;
  SAVE.vistoBienvenida = true; ppGuarda(); ppAntesDeVender(ppVentanaBienvenidaPack, ppPintaLateral); return true;
}
/* ---------- segundo pack, al llegar al mundo 2 ---------- */
const ppVentanaPackMundo2 = () => ppVentanaPackReloj('mundo2', tr('¡Pack del mundo 2!'), tr('Oferta para el nuevo mundo, solo una vez:'), tr('Pack del mundo 2'));
// sale sola una vez, al volver al camino cuando ya se ha llegado al mundo 2
function ppMiraPackMundo2() {
  if (!ppPackMundo2Visible() || SAVE.vistoMundo2) return false;
  if (ppVentaCerrada()) return false;
  SAVE.vistoMundo2 = true; ppGuarda(); ppAntesDeVender(ppVentanaPackMundo2, ppPintaLateral); return true;
}
/* ---------- oferta de atasco ---------- */
// tarea #186: la oferta ya no salta sola ni lleva reloj. Tras varios fallos seguidos en un nivel, Lola REGALA una ayuda (una vez al día);
// el pack de euros se queda siempre en Tienda > Ofertas, sin presión.
function ppMiraAtasco(fallos) {
  const o = PP_CFG.ofertas.atasco;
  if (!PP_PRESION.regalaAtasco(fallos, o.fallos, SAVE.atascoDia, ppHoy())) return;
  SAVE.atascoDia = ppHoy();
  ppDaPremio({ ayudas: o.regalo.ayudas });   // se da ya (ppDaPremio guarda), para que no se pierda si cierras el juego
  // Lola dice qué es y para qué sirve; al pulsar ¡VALE!, el «+1» con su dibujo sube en medio de la pantalla (js/primeros-pasos-juego.js)
  const dice = ppLolaDice(tr(o.regalo.texto)), ayuda = Object.keys(o.regalo.ayudas)[0];
  ppPrimerosTrasVale(dice, () => { play('ppPremio'); ppPrimerosMasUno(ppPrimerosRect(270, PP_V.H / 2, 80), ayuda); });
}
// `vuelta`: la ventana de la que se viene (la tienda). Al comprar o decir «Ahora no» se vuelve a ella. Sin vuelta, se cierra.
function ppVentanaAtasco(vuelta) {
  const sigue = typeof vuelta === 'function' ? vuelta : ppCierra;
  const o = PP_CFG.ofertas.atasco, premio = { perlas: o.perlas, ayudas: o.ayudas };
  const t = ppAbre(`<h2>${tr('Pack para desatascarte')}</h2>${ppPremioCandyHtml(premio, 40)}
    ${ppValorHtml(o)}`, true);
  t.appendChild(ppBoton(tr('¡LO QUIERO!'), 'pp-btn', () => ppCompraEuros(tr('Pack para desatascarte'), ppPremioCandyHtml(premio, 30), o.id, () => {
    ppDaPremio(premio); ppGuarda(); ppCierra(); ppBarraAyudas(); ppPintaLateral(); sigue();
  }), sigue));
  t.appendChild(ppBoton(tr('Ahora no'), 'pp-btn2 pp-azul', () => { ppCierra(); sigue(); }));
}
/* ---------- corazones infinitos ---------- */
function ppBotonInfinitas(t, alComprar) {
  const fila = document.createElement('div'); fila.className = 'pp-fila';
  for (const o of PP_CFG.infinitas) {
    const compra = () => { if (!ppPerlas(-o.perlas, 'infinitas')) { ppFaltanPerlas(o.perlas, compra, () => ppVentanaSinCorazones()); return; } ppDaInfinitas(o.min); play('ppPremio'); alComprar(); };   // sin perlas: el pack que llega (tarea #185)
    const b = ppBoton('', 'pp-btn2 pp-pago', compra);   // dorado: se paga con perlas (tarea #246)
    b.innerHTML = `${ppIcono('i-infinito', 26, '#ff4a6a')}${o.min >= 60 ? tr('{n} h', { n: o.min / 60 }) : tr('{n} min', { n: o.min })} · ${ppPerlasPrecioHtml(o.perlas, 22)}`;
    fila.appendChild(b);
  }
  t.insertAdjacentHTML('beforeend', `<p class="pp-sub">${tr('Corazones infinitos:')}</p>`);
  t.appendChild(fila);
}
/* ---------- la hucha ---------- */
function ppMeteHucha(jefe) { const H = PP_CFG.hucha; SAVE.hucha = Math.min(H.max, (SAVE.hucha || 0) + (jefe ? H.porJefe : H.porNivel)); ppGuarda(); }
// «las perlas que hay dentro valen X €» (a la baja, js/precios.js); nada si no se puede calcular
function ppHuchaValor(n) {
  const v = PP_PRECIOS.valorPerlas(n, PP_CFG.packs);
  return v === null || v <= 0 ? '' : ` ${tr('Las {n} perlas de dentro valen {e} en la tienda.', { n, e: PP_PRECIOS.formato(v) })}`;
}
function ppVentanaHucha() {
  ppTutorial('hucha');
  const H = PP_CFG.hucha, n = SAVE.hucha || 0, puede = n >= H.minimo;
  const t = ppAbre(`<h2>${tr('Hucha de perlas')}</h2><p class="pp-sub">${tr('Tienes:')} ${ppTienesHtml('perlas', 'i-perla', '#ffd1ec', SAVE.perlas || 0)}</p>
    <div class="pp-cofre">${ppIcono('i-hucha', 110, '#ffd1ec')}</div>
    <p class="pp-premio"><span class="pp-precio">${ppIcono('i-perla', 36, '#ffd1ec')}<span class="pp-hucha-dentro">${n}</span></span> <small>/ ${H.max}</small></p>
    <p class="pp-sub">${tr('Cada nivel nuevo que pasas mete perlas en la hucha. Rómpela y quédatelas todas.')}</p>
    <p class="pp-sub"><b>${tr('Se abre pagando {p}.', { p: H.precio })}</b>${ppHuchaValor(n)}</p>
    ${puede ? '' : `<p class="pp-sub">${tr('Se puede romper desde {n} perlas.', { n: H.minimo })}</p>`}`);
  if (puede) t.appendChild(ppBoton(tr('ROMPER LA HUCHA · {p}', { p: H.precio }), 'pp-btn', () => ppCompraEuros(tr('Hucha de perlas'), `<p>${tr('{n} perlas por {p}.', { n, p: H.precio })}</p>`, H.id, () => {
    const dentro = SAVE.hucha || 0, antes = SAVE.perlas || 0;
    ppPerlas(dentro); SAVE.hucha = 0; ppGuarda();
    ppHuchaRompe(t, dentro, antes, () => { ppCierra(); ppPintaLateral(); });   // el martillazo y las perlas volando (js/tienda-vuelo.js, tarea #270)
  })));
  ppBotonVolver(t, ppCierra, { tema: 'ofertas' });
}
/* ---------- los botones del lado del camino ---------- */
// el botón de un pack con reloj: salir en el lado ya es salir, así que aquí empieza a contar
function ppBotonPackReloj(boton, k, ico, abre) {
  ppOfertaArranca(k);
  boton(ico, '#ffd1ec', ppOfertaReloj(k) || tr('Oferta'), () => ppAntesDeVender(abre, ppPintaLateral), true);   // sin saber la edad, primero se pregunta (tarea #254)
}
// HTML (#pp-lateral), a la derecha del camino: regalo diario, pase, hucha y las ofertas que estén abiertas
function ppPintaLateral() {
  const L = $pp('#pp-lateral'); if (!L) return;
  L.hidden = PP_PANT.actual !== 'mapa'; if (L.hidden) return;
  L.innerHTML = '';
  const boton = (ico, col, texto, f, aviso) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'pp-lado' + (aviso ? ' pp-aviso' : '');
    b.innerHTML = `${ppIcono(ico, 58, col)}<b>${texto}</b>`; b.onclick = () => { play('select'); f(); }; L.appendChild(b);
    return b;
  };
  // partida nueva (tarea #140): lo que aún no toca sale apagado, con candado y su nivel (js/primeros-pasos-juego.js)
  ppPrimerosLado(boton('i-regalo', '#9cf0a0', tr('Regalo'), ppVentanaRegalo, !ppRegaloCogido() && ppPrimerosVe('regalo')), 'regalo');
  ppPrimerosLado(ppPaseLado(boton('i-pase', '#ffd64a', tr('Pase'), ppVentanaPase, ppPaseHayPremio() && ppPrimerosVe('pase'))), 'pase');   // con el flag 'pase-nuevo', anillo y escalón (js/pase-pantalla.js)
  ppFeriaBotonLateral(L);   // la Feria del finde, con su reloj (js/feria-pantalla.js)
  ppPrimerosLado(L.lastChild, 'feria');
  if (ppVentaCerrada()) { if (ppInfinitas()) boton('i-infinito', '#ff4a6a', ppReloj(SAVE.infinitas - Date.now()), () => {}, false); return; }   // menor: ni hucha ni ofertas con euros (tarea #254)
  ppPrimerosLado(boton('i-hucha', '#ffd1ec', String(SAVE.hucha || 0), ppVentanaHucha, (SAVE.hucha || 0) >= PP_CFG.hucha.minimo && ppPrimerosVe('hucha')), 'hucha');
  if (ppBienvenidaVisible() && ppPrimerosVe('oferta')) ppBotonPackReloj(boton, 'bienvenida', 'i-perlas', ppVentanaBienvenidaPack);
  if (ppPackMundo2Visible()) ppBotonPackReloj(boton, 'mundo2', 'i-regalo', ppVentanaPackMundo2);
  if (ppInfinitas()) boton('i-infinito', '#ff4a6a', ppReloj(SAVE.infinitas - Date.now()), () => {}, false);
}
