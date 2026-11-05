// Fans of Rouflage · ARMARIO (confirmar la compra): la ventana que sale al pulsar COMPRAR. Enseña la pieza en grande sobre su peana, con su
// rareza (lo que se lleva en el cuerpo, puesto en tu galleta: es el PROBAR de la tienda), y cómo pagar: lo de la TIENDA solo con Acciones y
// lo de Gotas (escenarios y muebles) con Gotas o con Acciones, a elegir (RF.Escaparate.monedas, ADR 052). Debajo de las Acciones, en
// pequeño, lo que son en euros (lo piden las autoridades europeas de consumo: el dinero real, antes de pagar). Nada se cobra hasta
// CONFIRMAR; CANCELAR, tocar fuera o Escape la cierran. Si no te llega, CAMBIAR GOTAS y COMPRAR ACCIONES llevan a la pestaña ACCIONES de la
// tienda, y al tenerlas se vuelve a abrir esta ventana (tiendaSigueCompra, tienda.js).
// La compra la hace arCompra(cat, it, moneda) (economia.js, o el servidor: servidor-economia.js). Los precios, arPrecio. Estilo: estilo-compra.css.
'use strict';

const AR_COMPRA = { cat: null, it: null, moneda: null, raf: 0, ocupado: false };

// la ventana: se crea la primera vez que hace falta, colgando del body (por encima de todo, como el premio del gachapón)
function arCompraCaja() {
  let v = E('ar-compra'); if (v) return v;
  v = document.createElement('div'); v.id = 'ar-compra'; v.className = 'ar-compra'; v.hidden = true;
  v.setAttribute('role', 'dialog'); v.setAttribute('aria-modal', 'true'); v.setAttribute('aria-labelledby', 'ac-nombre');
  v.innerHTML = `<div class="ac-caja">
    <div class="ac-carta"><span class="ac-cinta" id="ac-rareza"></span><div class="ac-peana" id="ac-peana"></div><b class="ac-nombre" id="ac-nombre"></b><span class="ac-cat" id="ac-cat"></span></div>
    <div class="ac-lado">
      <p class="ac-pregunta ol" id="ac-pregunta"></p>
      <div class="ac-pagos" role="radiogroup" id="ac-pagos"></div>
      <p class="ac-nota" id="ac-nota"></p>
      <div class="ac-falta" id="ac-falta" hidden><button type="button" class="boton" id="b-ac-cambiar"></button><button type="button" class="boton" id="b-ac-acciones"></button></div>
      <div class="ac-botones"><button type="button" class="boton gris" id="b-ac-cancelar"></button><button type="button" class="boton verde" id="b-ac-confirmar"></button></div>
    </div>
  </div>`;
  document.body.appendChild(v);
  const pg = arLienzo(150, 150, 'ac-pieza'); pg.id = 'ac-pieza'; v.querySelector('#ac-peana').appendChild(pg);
  v.addEventListener('pointerdown', e => { if (e.target === v) arCompraCierra(); });      // tocar fuera = cancelar
  E('b-ac-cancelar').onclick = () => arCompraCierra();
  return v;
}
// abre la ventana para comprar esta pieza (la llama el botón COMPRAR del armario: arPintaCompra)
function arPideCompra(cat, it) {
  const pr = arPrecio(it); if (!pr || (arTiene(cat.id, it) && !muebleOtraMas(cat, it))) return;
  ecoEstado();
  REPORTE.suceso('compra', { donde: 'armario', cat: cat.id, item: it.id });
  const v = arCompraCaja();
  Object.assign(AR_COMPRA, { cat, it, ocupado: false, moneda: RF.Escaparate.monedas(it).find(m => SAVE[m] >= pr[m]) || null });      // de entrada, lo ganado jugando
  v.dataset.rar = it.r;
  E('ac-rareza').textContent = tr(RAREZA_AR[it.r]).toUpperCase();
  E('ac-nombre').textContent = tr(it.n);
  E('ac-cat').textContent = tr(cat.corto);
  E('ac-pregunta').textContent = RF.Escaparate.monedas(it).length > 1 ? tr('¿Cómo quieres pagar?') : tr('Se paga con Acciones');
  E('ac-nota').textContent = pr.gacha ? tr('También sale en el gachapón. Elegirla tú, sin azar, cuesta un poco más.') : '';
  E('ac-nota').hidden = !pr.gacha;
  E('b-ac-cancelar').textContent = tr('CANCELAR');
  arCompraPinta();
  v.hidden = false; v.classList.remove('entra'); void v.offsetWidth; v.classList.add('entra');
  arCompraAnima();
  document.addEventListener('keydown', arCompraTecla, true);
  play('select');
  const foco = v.querySelector('.ac-pago.elegido') || E('b-ac-cancelar'); try { foco.focus({ preventScroll: true }); } catch (_) { /* nada */ }
}
// los dos botones de pago y el de confirmar, según lo que tienes y lo que has elegido
function arCompraPinta() {
  const { it } = AR_COMPRA, pr = arPrecio(it), caja = E('ac-pagos'); caja.innerHTML = '';
  const pago = (moneda, dibuja, titulo, precio, tengo, letra) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'ac-pago ' + moneda; b.setAttribute('role', 'radio');
    const llega = tengo >= precio, elegido = AR_COMPRA.moneda === moneda;
    b.disabled = !llega || AR_COMPRA.ocupado; b.classList.toggle('elegido', elegido); b.setAttribute('aria-checked', String(elegido));
    b.innerHTML = '<span class="ac-pago-tit"></span><span class="ac-precio"><b></b><i></i></span><small class="ac-tengo"></small>';
    b.querySelector('.ac-pago-tit').textContent = titulo;
    b.querySelector('.ac-precio').prepend(iconoPeq(dibuja, 28));
    b.querySelector('.ac-precio b').textContent = precio;
    b.querySelector('.ac-precio i').textContent = tr(moneda === 'gotas' ? 'Gotas' : 'Acciones');
    const t = b.querySelector('.ac-tengo'); t.textContent = llega ? tr('Tienes {n}', { n: tengo }) : tr('Te faltan {n} {m}', { n: precio - tengo, m: tr(moneda === 'gotas' ? 'Gotas' : 'Acciones') });
    t.classList.toggle('falta', !llega);
    if (letra) { const s = document.createElement('small'); s.className = 'ac-euros'; s.textContent = letra; b.appendChild(s); }
    b.onclick = () => { if (b.disabled) return; play('tick'); AR_COMPRA.moneda = moneda; arCompraPinta(); };
    caja.appendChild(b);
  };
  const monedas = RF.Escaparate.monedas(it);
  caja.classList.toggle('una', monedas.length === 1);
  if (monedas.includes('gotas')) pago('gotas', pintaGotas, tr('PAGAR CON GOTAS'), pr.gotas, SAVE.gotas, '');
  pago('acciones', pintaAcciones, tr('PAGAR CON ACCIONES'), pr.acciones, SAVE.acciones, tr('≈ {e} € en dinero real', { e: arEuros(pr.acciones) }));
  const ok = E('b-ac-confirmar'), ninguna = !monedas.some(m => SAVE[m] >= pr[m]);
  ok.textContent = AR_COMPRA.ocupado ? tr('COMPRANDO…') : tr('CONFIRMAR');
  ok.disabled = AR_COMPRA.ocupado || !AR_COMPRA.moneda;
  ok.hidden = ninguna; ok.onclick = arCompraConfirma;
  arCompraPintaFalta(ninguna);
}
// si no te llega: dos botones que llevan a la pestaña ACCIONES de la tienda (al cambio de Gotas o a los paquetes con euros)
function arCompraPintaFalta(ninguna) {
  const fila = E('ac-falta'); fila.hidden = !ninguna; if (!ninguna) return;
  E('b-ac-cambiar').textContent = tr('CAMBIAR GOTAS'); E('b-ac-cambiar').onclick = () => arCompraAlaTienda('tienda-gotas');
  E('b-ac-acciones').textContent = tr('COMPRAR ACCIONES'); E('b-ac-acciones').onclick = () => arCompraAlaTienda('tienda-acciones');
}
function arCompraAlaTienda(seccion) {
  const pendiente = { cat: AR_COMPRA.cat, it: AR_COMPRA.it };
  arCompraCierra(true);
  if (!E('p-tienda').hidden) { play('select'); TIENDA.pendiente = pendiente; TIENDA.pestana = 'acc'; tiendaPinta(); }
  else { const desde = typeof MIESC !== 'undefined' && MIESC.abierto ? 'escenario' : 'titulo'; if (desde === 'escenario') escDeja(); abreTienda(desde, { pestana: 'acc', pendiente }); }
  const s = E(seccion); if (seccion === 'tienda-gotas') E('tienda-lista').scrollTop = 0; else if (s && s.previousElementSibling) s.previousElementSibling.scrollIntoView({ block: 'start' });      // el cambio va arriba, con el aviso de lo que falta
}
async function arCompraConfirma() {
  const { cat, it, moneda } = AR_COMPRA; if (!moneda || AR_COMPRA.ocupado) return;
  AR_COMPRA.ocupado = true; arCompraPinta();
  let hecho = false;
  try { hecho = await arCompra(cat, it, moneda); } finally { AR_COMPRA.ocupado = false; }
  if (hecho) arCompraCierra(true);
  else if (!E('ar-compra').hidden) { if (!arPrecio(it) || (arTiene(cat.id, it) && !muebleOtraMas(cat, it))) arCompraCierra(true); else { if (SAVE[moneda] < arPrecio(it)[moneda]) AR_COMPRA.moneda = null; arCompraPinta(); } }
}
function arCompraCierra(callado) {
  const v = E('ar-compra'); if (!v || v.hidden || AR_COMPRA.ocupado) return;
  v.hidden = true; cancelAnimationFrame(AR_COMPRA.raf); AR_COMPRA.raf = 0;
  document.removeEventListener('keydown', arCompraTecla, true);
  if (!callado) play('select');
  const b = E('b-ar-comprar'); if (b && !b.hidden) try { b.focus({ preventScroll: true }); } catch (_) { /* nada */ }
}
function arCompraTecla(e) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); arCompraCierra(); } }
// la pieza en grande: los fantasmas y las mascotas se mueven (como en el armario); lo demás se pinta una vez
function arCompraAnima() {
  cancelAnimationFrame(AR_COMPRA.raf); AR_COMPRA.raf = 0;
  const { cat, it } = AR_COMPRA, k = E('ac-pieza');
  if (cat.cuerpo || cat.conjuntos) { arPinta(k, (c, w, h) => ARD.vestida(c, w, h * .93, Object.assign({ esc: h / 92 }, ropaDe({ cat: cat.id, it })))); return; }      // puesta en tu galleta
  arPinta(k, (c, w) => it.x(c, w));
  if (!['fantasma', 'mascotas'].includes(cat.id)) return;
  const paso = ahora => { if (E('ar-compra').hidden) { AR_COMPRA.raf = 0; return; } arPinta(k, (c, w) => it.x(c, w, ahora / 1000)); AR_COMPRA.raf = requestAnimationFrame(paso); };
  AR_COMPRA.raf = requestAnimationFrame(paso);
}
