// Fans of Pop · LO QUE COMPRAS VUELA Y LA HUCHA SE ROMPE (tarea #270, Pepins 21-11-2026; boceto B «estallido y vuelo» y hucha 2
// «martillazo»): al pulsar una tarjeta de la tienda se hace una foto de lo que tienes (PP_VUELO_R, js/tienda-vuelo-reglas.js); cuando
// la tienda se vuelve a pintar con la compra hecha (también la de euros, que entrega el servidor), lo ganado sale en abanico de la
// tarjeta, flota un momento y vuela al «Tienes:» de arriba, que cuenta hacia arriba al llegar cada icono. El vuelo es el de las
// monedas de la victoria (ppVicVuelaNodo, js/victoria-panel.js). Solo transform y opacity: va a 60 fps en el móvil. Con «reducir
// movimiento» en el móvil no vuela nada: la cifra ya sale bien.
'use strict';
const PP_VUELO = Object.freeze({ abre: 300, flota: 650, entre: 40, tipos: 140, golpe: 650, caida: 900 });   // ms
let PP_VUELO_ANTES = null;   // { foto, x, y, lado }: lo que tenías y dónde pulsaste
const ppVueloFoto = () => PP_VUELO_R.foto(SAVE, Date.now(), Object.keys(PP_CFG.ayudas));
const ppVueloQuieto = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const ppVueloIco = g => (g.tipo === 'perlas' ? 'i-perla' : g.tipo === 'monedas' ? 'i-moneda' : g.tipo === 'infinitas' ? 'i-infinito' : 'i-' + g.k);
const ppVueloColor = g => (g.tipo === 'infinitas' ? '#ff4a6a' : g.tipo === 'monedas' ? '#ffd64a' : '#ffd1ec');
const ppVueloTexto = (g, n) => (g.tipo === 'infinitas' ? ppReloj(Math.max(0, SAVE.infinitas - Date.now())) : String(n));
// el centro y el lado de un elemento en pantalla
function ppVueloPunto(el) { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, lado: Math.max(24, Math.min(r.width, r.height)) }; }
/* ---------- la tienda ---------- */
// la tarjeta pulsada (la pone ppTienda en cada tarjeta): de su dibujo salen luego los iconos
function ppTiendaToque(tarjeta) { PP_VUELO_ANTES = Object.assign({ foto: ppVueloFoto() }, ppVueloPunto(tarjeta.querySelector('.pp-ico') || tarjeta)); }
// al cerrar la tienda o abrirla de nuevo desde fuera, la foto deja de valer
function ppTiendaOlvida() { PP_VUELO_ANTES = null; }
// una cosa de «Tienes:», con su sitio para que le lleguen los iconos
const ppTienesHtml = (k, ico, col, n) => `<span class="pp-precio pp-tienes" data-k="${k}">${ppIcono(ico, 28, col)}<span class="pp-tienes-n">${n}</span></span>`;
// el «Tienes:» de arriba de la tienda
const ppTiendaTienesHtml = () => `${tr('Tienes:')} ${ppTienesHtml('perlas', 'i-perla', '#ffd1ec', SAVE.perlas || 0)} · ${ppTienesHtml('monedas', 'i-moneda', '#ffd64a', SAVE.monedas)}`;
// la tienda ya está pintada con la compra hecha: si hay algo ganado desde la foto, vuela
function ppTiendaVuela(t) {
  const antes = PP_VUELO_ANTES, fila = t.querySelector('.pp-tienda-tienes');
  const lista = antes && fila ? PP_VUELO_R.ganado(antes.foto, ppVueloFoto()) : [];
  if (!lista.length) return;
  PP_VUELO_ANTES = null;
  if (ppVueloQuieto()) return;
  lista.forEach((g, i) => setTimeout(() => { if (fila.isConnected) ppVueloHacia(ppVueloSitio(fila, g), g, antes); }, i * PP_VUELO.tipos));
}
// el sitio de una cosa en «Tienes:» (perlas y monedas ya están; una ayuda o los corazones entran con un saltito)
function ppVueloSitio(fila, g) {
  const ya = fila.querySelector(`.pp-tienes[data-k="${g.k}"]`);
  if (ya) return ya;
  const h = document.createElement('span'); h.innerHTML = ppTienesHtml(g.k, ppVueloIco(g), ppVueloColor(g), '');
  const s = h.firstElementChild; s.classList.add('pp-tienes-entra');
  fila.append(' · ', s);
  return s;
}
// los iconos de `g` salen de `o` y vuelan a `sitio`, que marca la cifra de antes y cuenta al llegar cada uno; al llegar el último, `fin`
function ppVueloHacia(sitio, g, o, fin = () => {}) {
  const num = sitio.querySelector('.pp-tienes-n'), n = PP_VUELO_R.iconos(g);
  let llegados = 0;
  num.textContent = ppVueloTexto(g, g.antes);
  const llega = () => {
    llegados++; num.textContent = ppVueloTexto(g, PP_VUELO_R.cuenta(g, llegados, n));
    sitio.classList.remove('pp-tienes-brilla'); void sitio.offsetWidth; sitio.classList.add('pp-tienes-brilla');
    play('ppPop', llegados);
    if (llegados === n) fin();
  };
  ppVueloAbanico(ppVueloIco(g), ppVueloColor(g), o, n, sitio.querySelector('.pp-ico'), llega);
}
// `n` iconos saltan en abanico hacia arriba desde `o` y flotan; al rato, cada uno vuela a `meta` con el vuelo de la victoria. Si la
// ventana se ha cerrado antes de despegar, se quitan sin volar (y `llega` se llama igual, para no dejar nada esperando)
function ppVueloAbanico(ico, col, o, n, meta, llega) {
  const ics = [];
  for (let j = 0; j < n; j++) {
    const i = ppVueloNodo(ico, col, o), ang = -Math.PI / 2 + (j - (n - 1) / 2) * 0.55, d = o.lado * (1.3 + (j % 2) * 0.4);
    i.animate([{ transform: 'translate(0, 0) scale(0.3)' }, { transform: `translate(${Math.cos(ang) * d}px, ${Math.sin(ang) * d}px) scale(1.1)` }],
      { duration: PP_VUELO.abre, easing: 'cubic-bezier(.2, 1.6, .4, 1)', fill: 'forwards' });
    ics.push(i);
  }
  setTimeout(() => ics.forEach((i, j) => {
    const r = i.getBoundingClientRect();
    i.getAnimations().forEach(a => a.cancel()); i.remove();
    if (meta && meta.isConnected) ppVicVuelaNodo(i, r, meta.getBoundingClientRect(), j * PP_VUELO.entre, llega); else llega();
  }), PP_VUELO.flota);
}
// un icono suelto, del tamaño `o.lado` y centrado en (o.x, o.y), por encima de todo
function ppVueloNodo(ico, col, o) {
  const h = document.createElement('div'); h.innerHTML = ppIcono(ico, Math.round(o.lado), col);
  const i = h.firstElementChild; i.classList.add('pp-vic-vuela');
  Object.assign(i.style, { left: (o.x - o.lado / 2) + 'px', top: (o.y - o.lado / 2) + 'px', margin: '0' });
  document.body.appendChild(i);
  return i;
}
/* ---------- la hucha: el martillazo ---------- */
// en la ventana de la hucha (`t`): baja un martillo, le da un golpe, la hucha se parte en dos mitades que caen y sus `n` perlas
// saltan y vuelan al «Tienes:» de la ventana. `antes`: las perlas que tenías. Al acabar, `fin` (cerrar la ventana)
function ppHuchaRompe(t, n, antes, fin) {
  const hucha = t.querySelector('.pp-cofre .pp-ico'), sitio = t.querySelector('.pp-tienes[data-k="perlas"]');
  if (!hucha || !sitio || ppVueloQuieto()) { fin(); return; }
  t.querySelectorAll('button').forEach(b => { b.disabled = true; });
  const o = ppVueloPunto(hucha), m = ppVueloNodo('i-martillo', '#ffd1ec', { x: o.x + o.lado * 0.35, y: o.y - o.lado * 0.9, lado: o.lado * 0.75 });
  m.style.transformOrigin = '80% 80%';
  const golpe = m.animate([{ transform: 'rotate(0) translateY(-40px)', opacity: 0 }, { transform: 'rotate(40deg) translateY(0)', opacity: 1, offset: 0.4 },
    { transform: 'rotate(-35deg) translate(-25px, 45px)', opacity: 1 }], { duration: PP_VUELO.golpe, easing: 'cubic-bezier(.6, 0, .9, .5)', fill: 'forwards' });
  golpe.onfinish = () => {
    m.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).onfinish = () => m.remove();
    t.animate([{ transform: 'translate(0, 0)' }, { transform: 'translate(-6px, 4px)' }, { transform: 'translate(6px, -3px)' }, { transform: 'translate(0, 0)' }], { duration: 200 });
    ppVibra(40); play('ppPop', 1);
    ppHuchaMitades(hucha);
    const premio = t.querySelector('.pp-hucha-dentro');
    if (premio) premio.textContent = '0';
    ppVueloHacia(sitio, { k: 'perlas', tipo: 'perlas', antes, despues: antes + n }, o, () => setTimeout(fin, 350));
  };
}
// la hucha se esconde y en su sitio caen sus dos mitades (la misma imagen recortada), una a cada lado
function ppHuchaMitades(hucha) {
  const o = hucha.getBoundingClientRect(), cortes = [['polygon(0 0, 52% 0, 44% 35%, 56% 60%, 46% 100%, 0 100%)', -1], ['polygon(52% 0, 100% 0, 100% 100%, 46% 100%, 56% 60%, 44% 35%)', 1]];
  hucha.style.visibility = 'hidden';
  for (const [corte, lado] of cortes) {
    const h = hucha.cloneNode(true); h.classList.add('pp-vic-vuela');
    Object.assign(h.style, { visibility: 'visible', left: o.left + 'px', top: o.top + 'px', width: o.width + 'px', height: o.height + 'px', margin: '0', clipPath: corte });
    document.body.appendChild(h);
    h.animate([{ transform: 'translate(0, 0) rotate(0)', opacity: 1 }, { transform: `translate(${lado * o.width * 0.45}px, ${o.height * 1.1}px) rotate(${lado * 50}deg)`, opacity: 0 }],
      { duration: PP_VUELO.caida, easing: 'cubic-bezier(.3, 0, .8, .6)', fill: 'forwards' }).onfinish = () => h.remove();
  }
}
