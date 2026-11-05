// Fans of Rouflage · LA TIENDA (pestañas y escaparate, ADR 052): las tres pestañas (DESTACADO, OBJETOS y ACCIONES), el conjunto del Rumble
// destacado de la semana y la pestaña OBJETOS, con todo lo de pago del armario por categorías. Tocar una pieza abre su compra
// (armario-compra.js), que la enseña puesta en la galleta: es el PROBAR. Qué se vende, en qué orden y el destacado lo dicen las reglas
// puras de RF.Escaparate (dominio/escaparate.js); aquí solo se pinta. El resto de la tienda (paquetes, ofertas, cambio) está en tienda.js.
'use strict';

const TN_PESTANAS = [['dest', 'b-tn-dest', 'tn-dest'], ['obj', 'b-tn-obj', 'tn-obj'], ['acc', 'b-tn-acc', 'tn-acc']];

// lo que ya tienes no se vuelve a comprar (salvo otra unidad de un mueble)
const tnTuyo = (catId, it) => arTiene(catId, it) && !muebleOtraMas(arCat(catId), it);

function tiendaPintaPestanas() {
  for (const [id, boton, hoja] of TN_PESTANAS) {
    const on = TIENDA.pestana === id;
    E(boton).classList.toggle('on', on); E(boton).setAttribute('aria-selected', String(on)); E(hoja).hidden = !on;
  }
  tiendaPintaDestacado();
  tiendaPintaPendiente();
  E('tienda-cats').hidden = TIENDA.pestana !== 'obj';      // las categorías van fuera de la lista: no se van al bajar
  if (TIENDA.pestana === 'obj') tiendaPintaObjetos();      // muchas piezas: solo se dibujan cuando se ven
}
function tiendaPestana(id) { if (TIENDA.pestana === id) return; play('tick'); TIENDA.pestana = id; tiendaPintaPestanas(); E('tienda-lista').scrollTop = 0; }

// el conjunto del Rumble de la semana, en grande, arriba de DESTACADO (cambia cada jueves, igual para todos)
function tiendaPintaDestacado() {
  const caja = E('tienda-destacado'), cat = arCat('conjuntos');
  const lista = cat ? cat.items.filter(it => arPrecio(it)) : [];
  const it = RF.Escaparate.destacado(lista, RF.Escaparate.semanaDe(diaHoy()));
  caja.hidden = !it; caja.innerHTML = ''; if (!it) return;
  const k = arLienzo(110, 110); arPinta(k, (c, w) => it.x(c, w)); caja.appendChild(k);
  const t = document.createElement('div'); t.className = 'tn-dest-texto';
  t.innerHTML = '<b class="ol"></b><small></small>';
  t.querySelector('b').textContent = tr(it.n); t.querySelector('small').textContent = tr('Conjunto del Rumble: cabeza, espalda, cara y papel');
  t.appendChild(tnBotonPrecio(cat, it, 22)); caja.appendChild(t);
  const c = document.createElement('i'); c.className = 'tn-cinta'; c.textContent = tr('DESTACADO DE LA SEMANA'); caja.appendChild(c);
  caja.onclick = e => { if (!e.target.closest('button')) arPideCompra(cat, it); };
}

// con una compra a medias, arriba de ACCIONES: lo que falta y para qué
function tiendaPintaPendiente() {
  const p = TIENDA.pendiente, pr = p && arPrecio(p.it), caja = E('tienda-pendiente');
  caja.hidden = !pr || SAVE.acciones >= pr.acciones;
  if (!caja.hidden) caja.textContent = tr('Te faltan {n} Acciones para «{c}». Cámbialas por Gotas o consíguelas aquí, y volverás a la compra.', { n: pr.acciones - SAVE.acciones, c: tr(p.it.n) });
}

// la pestaña OBJETOS: las categorías arriba (como en el armario) y sus piezas en una rejilla
function tiendaPintaObjetos() {
  const cats = RF.Escaparate.enVenta(CATALOGO_AR, arPrecio, tnTuyo);
  if (!cats.some(c => c.id === TIENDA.cat)) TIENDA.cat = cats.length ? cats[0].id : null;
  const fila = E('tienda-cats'); fila.innerHTML = '';
  for (const c of cats) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'tn-cat' + (c.id === TIENDA.cat ? ' on' : ''); b.textContent = tr(c.corto);
    b.onclick = () => { if (TIENDA.cat === c.id) return; play('tick'); TIENDA.cat = c.id; tiendaPintaObjetos(); };
    fila.appendChild(b);
  }
  const rej = E('tienda-rejilla'); rej.innerHTML = '';
  const cat = cats.find(c => c.id === TIENDA.cat); if (!cat) return;
  for (const x of cat.items) rej.appendChild(tnTarjetaPieza(arCat(cat.id), x));
}
function tnTarjetaPieza(cat, { it, tuyo }) {
  const d = document.createElement('div'); d.className = 'tn-pieza r-' + it.r + (tuyo ? ' tuya' : '');
  const k = arLienzo(58, 58); arPinta(k, (c, w) => it.x(c, w)); d.appendChild(k);
  if (!tuyo) { const p = document.createElement('i'); p.className = 'tn-probar'; p.textContent = tr('PROBAR'); d.appendChild(p); }
  const n = document.createElement('span'); n.textContent = tr(it.n); d.appendChild(n);
  d.appendChild(tnBotonPrecio(cat, it, 16));
  if (!tuyo) d.onclick = e => { if (!e.target.closest('button')) arPideCompra(cat, it); };
  return d;
}
// el botón con el precio (en Acciones; lo de Gotas, en Gotas): rojizo si no te llega; lo tuyo, en verde y apagado
function tnBotonPrecio(cat, it, icono) {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'boton peq tn-precio';
  if (tnTuyo(cat.id, it)) { b.textContent = tr('ES TUYO'); b.disabled = true; return b; }
  const pr = arPrecio(it), mon = RF.Escaparate.monedas(it)[0], n = pr[mon];
  b.appendChild(iconoPeq(ICONO_MONEDA[mon], icono)); const s = document.createElement('span'); s.textContent = String(n); b.appendChild(s);
  b.classList.toggle('falta', (SAVE[mon] || 0) < n);
  b.onclick = () => arPideCompra(cat, it);
  return b;
}

function preparaTiendaPestanas() {
  for (const [id, boton] of TN_PESTANAS) E(boton).onclick = () => tiendaPestana(id);
  tnDeslizaLado(E('tienda-cats'));
}
// la fila de categorías se desliza de lado: con el dedo (touch-action pan-x, estilo-tienda.css), con la rueda del ratón y arrastrando con el ratón
function tnDeslizaLado(fila) {
  fila.addEventListener('wheel', e => { if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; e.preventDefault(); fila.scrollLeft += e.deltaY; }, { passive: false });
  const arr = { x: 0, izq: 0, movido: false, id: null };
  fila.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; Object.assign(arr, { x: e.clientX, izq: fila.scrollLeft, movido: false, id: e.pointerId }); });
  fila.addEventListener('pointermove', e => {
    if (arr.id !== e.pointerId) return;
    const dx = e.clientX - arr.x; if (Math.abs(dx) > 5) arr.movido = true;
    if (arr.movido) fila.scrollLeft = arr.izq - dx;
  });
  const suelta = () => { arr.id = null; };
  fila.addEventListener('pointerup', suelta); fila.addEventListener('pointerleave', suelta);
  fila.addEventListener('click', e => { if (arr.movido) { e.stopPropagation(); e.preventDefault(); arr.movido = false; } }, true);      // arrastrar no elige categoría
}
