// Fans Of · TIENDA DE GEMAS: las pestañas Cosméticos, Ventajas y Escaparate de la tienda, a precio fijo en gemas y sin azar (ADR 050, docs/core/TIENDA-GEMAS.md).
// Las reglas están en tienda-fija-reglas.js. Cobra el servidor (comprar_fijo, servidor/112-tienda-gemas.sql); aquí se pinta y se entrega lo comprado.
// Un juego la usa poniendo AJUSTES.tiendaFija y cargando los dos archivos después de armario.js y frases.js. Tras el flag 'tienda-gemas'.
// Lo comprado queda en SAVE.fijos (las claves de reclamos del servidor). Lo que da cada tipo de artículo está en TIENDA_FIJA.entregas[tipo]:
// marco, titulo y frases vienen de serie; un juego añade los suyos (un aspecto, una ventaja) con TIENDA_FIJA.entregas.mio = articulo => {…}.
'use strict';
Object.assign(TIENDA_FIJA, (() => {
  const tr = (t, d) => (typeof IDIOMA !== 'undefined' && IDIOMA.tr ? IDIOMA.tr(t, d) : t.replace(/\{(\w+)\}/g, (m, k) => (d && k in d ? d[k] : m)));
  const T = () => (typeof AJUSTES !== 'undefined' && AJUSTES.tiendaFija) || null;
  const activa = () => !!T() && NUCLEO.flag('tienda-gemas', 'Tienda de gemas: cosméticos, ventajas y escaparate de objetos fijos (ADR 050)', false);
  const claves = () => (Array.isArray(SAVE.fijos) ? SAVE.fijos : (SAVE.fijos = []));
  const tiene = c => claves().includes(c);
  const hoy = () => new Date(typeof HORA !== 'undefined' ? HORA.ahora() : Date.now()).toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });   // 'AAAA-MM-DD' en Madrid
  const rareza = (k, id) => ((typeof CATALOGO !== 'undefined' && CATALOGO[k] && CATALOGO[k][id]) || {}).rar;
  const ctx = () => ({ gemas: SAVE.gems || 0, tiene, hoy: hoy(), rareza });
  const GEMA = () => (typeof GEM_SVG !== 'undefined' ? GEM_SVG : '');
  const ERRORES = { ya_lo_tienes: 'Ya es tuyo', agotado: 'Agotado esta semana: vuelve el lunes', no_esta: 'Eso ya no está en el escaparate', no_existe: 'Eso no está a la venta' };
  const errorTexto = e => { const m = String((e && e.message) || e); const k = Object.keys(ERRORES).find(x => m.includes(x)); return k ? tr(ERRORES[k]) : tr(ECO.errorTexto(e)); };

  // lo que da cada tipo; la clave ya está apuntada cuando se llama
  const entregas = {
    marco: a => { if (typeof darLook === 'function') darLook('marco', a.id); },
    titulo: a => { if (typeof darLook === 'function') darLook('titulo', a.id); },
    frases: a => { if (typeof darLook !== 'function') return; for (const f of a.frases || []) darLook('frase', f); for (const e of a.emotes || []) darLook('emote', e); },
  };
  function apunta(clave, a) {
    if (!tiene(clave)) claves().push(clave);
    const f = a && a.tipo && entregas[a.tipo]; if (f) f(a);
  }
  // la copia del escaparate: la crea el servidor (objeto) o, sin cuenta, aquí con la calidad fija de AJUSTES.tiendaFija.escaparate.q
  function meteCopia(a, objeto) {
    if (objeto && objeto.u) { if (!SAVE.inv.some(x => x.u === objeto.u)) SAVE.inv.push({ u: objeto.u, k: objeto.k, id: objeto.id, q: objeto.q }); return; }
    const D = (a.k === 'ab' ? ABILITIES : ITEMS)[a.id], n = Math.max(1, ((D && D.st) || []).length);
    addCopy(a.k, a.id, Array.from({ length: n }, () => T().escaparate.q));
  }
  async function cobra(id, v) {
    let r = null;
    if (ECO.servidor('tienda')) r = await ECO.pedir('comprar_fijo', { p_articulo: id });
    else ECO.gastar('tienda-gemas', { gems: v.precio }, { tipo: 'tienda-gemas', articulo: id });
    if (v.semana != null) meteCopia(v.articulo, r && r.objeto);
    apunta(v.clave, v.articulo);
  }
  function compra(id) {
    const r = TIENDA_FIJA.reglas.comprar(T(), id, ctx());
    if (!r.ok) { play('deny'); toast(r.error === 'faltan_gemas' ? tr('Te faltan gemas') : tr(ERRORES[r.error] || 'Eso no está a la venta')); return; }
    const v = r.valor;
    confirmBox(tr('¿COMPRAR?'), `${esc(nombre(v.articulo))}<span class="big">${GEMA()} ${fmt(v.precio)}</span><small>${tr('Precio fijo y sin azar: te llevas justo esto.')}</small>`, tr('COMPRAR'), async () => {
      try { await cobra(id, v); } catch (e) { play('deny'); toast(errorTexto(e)); return; }
      saveGame(); play('win'); updateWallets(); buildShop(); toast(tr('{n}: ¡ya es tuyo!', { n: nombre(v.articulo) }), true);
    });
  }

  // ---- pintar ----
  function nombre(a) {
    if (a.k) return tr(((CATALOGO[a.k] || {})[a.id] || {}).name || a.id);
    if (a.tipo === 'marco') return tr((marcoDef(a.id) || {}).name || a.id);
    return tr(a.name || a.id);
  }
  const boton = (id, precio, mio, ya = 'TUYO') => (mio ? `<button class="btn-price" disabled>${tr(ya)}</button>`
    : `<button class="btn-price" data-fijo="${esc(id)}">${GEMA()} ${fmt(precio)}</button>`);
  function muestra(a) {
    if (a.tipo === 'marco') return lookCanvas({ marco: a.id }, 64);
    if (a.tipo === 'frases') return `<span class="fija-frases">${(a.frases || []).map(f => `<b>«${esc(tr(((ARM().frases || {})[f] || {}).t || f))}»</b>`).join('')}</span>`;
    return `<span class="fija-ic ol">${esc(a.ic || '?')}</span>`;
  }
  function tarjeta(id, a) {
    const R = RARITY[a.rar] || RARITY.basic;
    return `<div class="fija-card${a.tipo === 'frases' ? ' ancha' : ''}" style="--rc:${R[2]}"><div class="fija-ver">${muestra(a)}</div>`
      + `<span class="fija-rar" style="background:${R[1]}">${tr(R[0])}</span><b class="fija-nm ol">${esc(nombre(a))}</b>`
      + (a.nota ? `<span class="fija-nota">${esc(tr(a.nota))}</span>` : '') + boton(id, a.precio, tiene(TIENDA_FIJA.reglas.clave(id))) + '</div>';
  }
  function seccion(sec) {
    const A = T().articulos || {}, grupos = {};
    for (const id in A) if (A[id].sec === sec && (!A[id].flag || NUCLEO.flag(A[id].flag))) (grupos[A[id].grupo] = grupos[A[id].grupo] || []).push(id);
    return Object.keys(grupos).map(g => `<h3 class="fija-sec ol">${esc(tr(g))}</h3><div class="fija-grid">${grupos[g].map(id => tarjeta(id, A[id])).join('')}</div>`).join('');
  }
  function escaparateHtml() {
    const E = T().escaparate, d = hoy(), k = TIENDA_FIJA.reglas.semana(E.inicio, d), L = TIENDA_FIJA.reglas.escaparate(E, k);
    const fila = x => { const id = TIENDA_FIJA.reglas.idEsc(x), rar = rareza(x.k, x.id), R = RARITY[rar] || RARITY.basic, Q = (typeof QTIERS !== 'undefined' && QTIERS.find(q => E.q >= q.lo && E.q <= q.hi)) || null;
      return `<div class="fija-fila" style="--rc:${R[2]}"><span class="bib-ic"${miniFondo(rar)}>${miniIcono(x.k, x.id)}</span><div><b class="fija-nm ol">${esc(nombre(x))}</b>`
        + `<span class="fija-rar" style="background:${R[1]}">${tr(R[0])}</span>${Q ? ` <span class="fija-q">${esc(tr(Q.name))} · ${'★'.repeat(Q.st)}${'☆'.repeat(5 - Q.st)}</span>` : ''}<span class="fija-nota">${tr('1 por semana')}</span></div>`
        + boton(id, E.precios[rar], tiene(TIENDA_FIJA.reglas.clave(x.k + ':' + x.id, k)), 'AGOTADO') + '</div>'; };
    return `<div class="fija-banner"><div><b class="ol">${tr('EXCEDENTES DEL ALMACÉN')}</b><span>${tr('Lo que sobró de la última reestructuración. Cambia cada lunes.')}</span></div></div>`
      + (L.length ? L.map(fila).join('') : `<p class="small-print">${tr('El escaparate abre pronto.')}</p>`)
      + `<p class="small-print">${tr('La calidad ya viene fijada: te llevas justo la copia que ves, sin tirar dados. Nunca hay legendarias ni copias CEO: esas solo salen jugando.')}</p>`;
  }
  const NOTAS = {
    cosmeticos: 'Precio fijo y sin sorpresas: ves exactamente lo que compras. Solo cambia cómo te ven, no lo fuerte que eres.',
    ventajas: 'Comodidades para tu oficina, no poder: nada de esto te hace ganar más en la Arena. Se compran una vez y son para siempre.',
  };
  function pinta(caja, sec) {
    caja.innerHTML = (NOTAS[sec] ? `<p class="shop-note fija-intro">${tr(NOTAS[sec])}</p>` : '') + (sec === 'escaparate' ? escaparateHtml() : seccion(sec));
    if (typeof pintaLooks === 'function') pintaLooks(caja);
    caja.querySelectorAll('[data-fijo]').forEach(b => { b.onclick = () => { play('select'); compra(b.dataset.fijo); }; });
  }
  for (const [sec, n] of [['cosmeticos', 'Cosméticos'], ['ventajas', 'Ventajas'], ['escaparate', 'Escaparate']])
    TIENDA_SECCIONES.registra(sec, { nombre: n, activa: () => activa() && (sec === 'escaparate' ? !!T().escaparate : Object.values(T().articulos || {}).some(a => a.sec === sec)), pinta: c => pinta(c, sec) });
  // al restaurar desde el servidor (core/js/sistema/pagos.js): lo comprado con gemas que falte en este aparato
  hook('derechos', lista => { const A = (T() && T().articulos) || {}; for (const c of lista) if (/^fijo:/.test(c) && !tiene(c)) apunta(c, A[c.slice(5)]); });
  return { activa, tiene, compra, entregas };
})());
