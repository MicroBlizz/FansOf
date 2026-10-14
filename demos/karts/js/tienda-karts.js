// Fans of Karts · LA TIENDA, en grande (HTML encima del juego). Pestañas: Destacado (VIP, pase, gemas, ofertas y premios de CEO),
// Karts, Pilotos, Humo, Ruedas, Pintura, Títulos, Gemas y VIP. Cada cosa es una tarjeta con su foto y una etiqueta que dice para quién
// es («PARA TODOS TUS PILOTOS» o «SOLO CRAZYBUNNY»); al tocarla se abre su ficha: el kart girando con eso puesto, qué es, para quién,
// cómo se consigue y el botón de comprar o ponérselo. Las gemas y la VIP son de prueba: el prototipo no cobra nada.
'use strict';

const TABS_TIENDA = [['destacado', 'DESTACADO'], ['kart', 'KARTS'], ['skin', 'PILOTOS'], ['humo', 'HUMO'], ['ruedas', 'RUEDAS'], ['pintura', 'PINTURA'], ['titulo', 'TÍTULOS'], ['gemas', 'GEMAS'], ['vip', 'VIP']];
const INTRO_TIENDA = {
  kart: 'Cambia el kart entero por otro vehículo. <b>Vale para todos tus pilotos.</b> Solo se ve: corre igual.',
  skin: 'Ropa nueva para un piloto. <b>Cada aspecto es solo de su piloto.</b>',
  humo: 'El humo que sueltan las ruedas al derrapar. <b>Vale para todos tus pilotos.</b> Las chispas azules y naranjas del miniturbo no cambian.',
  ruedas: 'Ruedas y llantas de otro color. <b>Vale para todos tus pilotos.</b>',
  pintura: 'El color de la carrocería. <b>Vale para todos tus pilotos.</b>',
  titulo: 'Una frase de presentación que sale con tu piloto. <b>Es para tu perfil.</b>',
  gemas: 'Las gemas sirven para el pase premium y las cosas más vistosas. <b>Prototipo: no se cobra nada.</b>',
};
const QUE_ES = { kart: 'Otro vehículo en lugar del kart.', skin: 'Ropa nueva para el piloto.', humo: 'El humo de las ruedas al derrapar.', ruedas: 'El color de ruedas y llantas.', pintura: 'El color de la carrocería.', titulo: 'Una frase que sale con tu piloto.' };
const TK = { tab: 'destacado', ficha: null, pil: 0, aviso: '', caja: null, modal: null, lienzo: null, hecho: '' };

function abreTienda(tab) { if (tab) TK.tab = tab; TK.ficha = null; TK.hecho = ''; TK.pil = PANT.piloto; ve('tienda'); }
const paraQuien = c => c.solo ? trf('SOLO %1', tr(PILOTO[c.solo].nombre).toUpperCase()) : c.tipo === 'titulo' ? tr('PARA TU PERFIL') : tr('PARA TODOS TUS PILOTOS');
const origen = c => (c.de === 'ceo' ? 'ceo' : c.de === 'pase' ? 'pase' : c.de === 'vip' ? 'vip' : '');

// ---------- una tarjeta ----------
function tarjetaCos(c) {
  const tengo = tieneCos(c.id), puesto = tengo && SAVE.lleva[c.tipo] === c.id, o = origen(c);
  const cinta = puesto ? ['puesto', 'LO LLEVAS'] : tengo ? ['tuyo', 'ES TUYO'] : o === 'ceo' ? ['ceo', 'PREMIO CEO'] : o === 'pase' ? ['pase', 'PASE'] : o === 'vip' ? ['vip', 'VIP'] : null;
  const pie = tengo ? el('span.kt-btn' + (puesto ? '.hecho' : '.verde'), {}, tr(puesto ? 'PUESTO' : 'PONÉRMELO'))
    : c.de === 'tienda' ? el('span.kt-btn' + (c.gemas ? '.gema' : ''), {}, img(fotoIcono(c.gemas ? 'gema' : 'oro')), String(c.oro || c.gemas))
      : el('span.kt-btn.gris', {}, tr('CÓMO SE CONSIGUE'));
  return el('button.kt-card' + (o ? '.r-' + o : ''), { 'data-k': 1, on: () => abreFicha(c.id) },
    cinta ? el('span.kt-ribbon.' + cinta[0], {}, tr(cinta[1])) : null,
    el('div.kt-foto', {}, img(fotoCos(c, JUGABLES[TK.pil].id))),
    el('div.kt-info', {}, el('div.kt-name.ol', {}, tr(c.nombre)), el('span.kt-tag' + (c.solo ? '.solo' : ''), {}, paraQuien(c)), pie));
}
function banner(cl, foto, titulo, texto, boton, accion) {
  return el('button.kt-banner.' + cl, { 'data-k': 1, on: accion }, img(foto), el('div', {}, el('h3.ol', {}, tr(titulo)), el('p', {}, tr(texto)), el('span.kt-btn' + (cl === 'vip' ? '.oro' : cl === 'gema' ? '.gema' : cl === 'pase' ? '.verde' : '.oro'), {}, tr(boton))));
}

// ---------- el cuerpo de cada pestaña ----------
function cuerpoTienda() {
  const t = TK.tab, w = el('div.kt-wrap');
  if (t === 'destacado') {
    w.append(el('div.kt-banners', {},
      banner('vip', fotoCos(COS['pintura-vip'], 'bunny'), 'LICENCIA VIP', '+50 % de oro en cada carrera, pintura dorada y título. Para siempre (o hasta que la canceles).', SAVE.vip ? 'YA ERES VIP' : 'VER LA LICENCIA', () => { TK.tab = 'vip'; pintaTiendaHtml(); }),
      banner('pase', fotoCos(COS['kart-carrito'], 'bunny'), 'PASE DE TEMPORADA', trf('Nivel %1 de %2. Sube corriendo y cobra premios en cada nivel.', nivelPase(), KPASE.length), 'IR AL PASE', () => ve('pase')),
      banner('gema', fotoMonton('gema', 6), 'GEMAS', 'Para el pase premium y lo más vistoso. En el prototipo, gratis.', 'VER PACKS', () => { TK.tab = 'gemas'; pintaTiendaHtml(); }),
      banner('ceo', fotoCos(COS['kart-silla'], 'bunny'), 'PREMIOS DE CEO', 'Gana en nivel CEO: título, modo espejo, silla dorada y CrazyBunny con traje.', 'VER PREMIOS', () => { TK.tab = 'kart'; pintaTiendaHtml(); })));
    w.append(el('div.kt-h3.ol', {}, tr('OFERTAS DE HOY')), el('div.kt-grid', {}, ['humo-arcoiris', 'pintura-cromo', 'ruedas-neon', 'humo-rosa', 'pintura-negra', 'titulo-derrape'].map(id => tarjetaCos(COS[id]))));
    w.append(el('div.kt-h3.ol', {}, tr('PREMIOS DE CEO')), el('div.kt-grid', {}, KCOS.filter(c => c.de === 'ceo').map(tarjetaCos)));
  } else if (t === 'gemas') {
    w.append(el('div.kt-intro', { html: tr(INTRO_TIENDA.gemas) }));
    w.append(el('div.kt-grid', {}, PACKS_GEMAS.map((p, i) => el('button.kt-card.r-gema', { 'data-k': 1, on: () => { compraGemas(i); pintaTiendaHtml(); } },
      el('div.kt-foto', {}, img(fotoMonton('gema', [2, 4, 6][i]))),
      el('div.kt-info', {}, el('div.kt-name.ol', {}, tr(p.nombre)), el('span.kt-tag', {}, p.n + ' ' + tr('GEMAS')), el('span.kt-btn.gema', {}, p.precio + ' · ' + tr('GRATIS EN EL PROTOTIPO')))))));
  } else if (t === 'vip') {
    const ventajas = [['oro', '+50 % de oro en cada carrera'], ['kart', 'Pintura Licencia dorada para todos tus karts'], ['titulo', 'Título Piloto con licencia'], ['marco', 'Tu nombre con marco dorado en los resultados'], ['gema', 'En la versión de tienda: PvP sin límite y sin anuncios']];
    w.append(el('div.kt-banners', {}, el('div.kt-banner.vip', {}, img(fotoCos(COS['pintura-vip'], JUGABLES[TK.pil].id)), el('div', {}, el('h3.ol', {}, tr('LICENCIA DE PILOTO VIP')), el('p', {}, tr('4,99 € al mes en la versión de tienda. Aquí, de prueba y gratis.'))))));
    w.append(el('div.kt-datos', {}, ventajas.map(([ic, t2]) => el('div.kt-dato', { style: 'grid-template-columns:44px 1fr;align-items:center' }, img(ic === 'kart' ? fotoCos(COS['pintura-vip'], JUGABLES[TK.pil].id) : ic === 'titulo' ? fotoTitulo(COS['titulo-vip']) : ic === 'marco' ? fotoMonton('oro', 1) : fotoIcono(ic)), tr(t2)))));
    w.append(el('p.kt-intro', {}, tr(SAVE.vip ? 'Tienes la licencia. Cancelar es gratis; encontrar el botón, en la versión de verdad, ya no tanto.' : 'Solo es estética y oro extra: online nadie corre más por pagar.')));
    w.append(el('button.kt-btn.ancho' + (SAVE.vip ? '.rojo' : '.oro'), { 'data-k': 1, on: () => { cambiaVip(); pintaTiendaHtml(); } }, tr(SAVE.vip ? 'CANCELAR LICENCIA' : 'PROBAR GRATIS')));
  } else {
    w.append(el('div.kt-intro', { html: tr(INTRO_TIENDA[t]) }));
    w.append(el('div.kt-grid', {}, KCOS.filter(c => c.tipo === t).map(tarjetaCos)));
  }
  return w;
}

// ---------- la pantalla entera ----------
function pintaTiendaHtml() {
  if (!TK.caja) { TK.caja = el('section.kt-scr', { id: 'kt-tienda' }); document.body.appendChild(TK.caja); }
  const scroll = TK.caja.querySelector('.kt-body'), arriba = scroll && TK.hecho === TK.tab ? scroll.scrollTop : 0;
  TK.caja.replaceChildren(
    cabecera('TIENDA', () => ve('titulo')),
    el('nav.kt-tabs', {}, TABS_TIENDA.map(([id, n]) => el('button.kt-tab' + (id === 'gemas' ? '.gema' : id === 'vip' ? '.vip' : ''), { 'data-k': 1, 'aria-pressed': String(TK.tab === id), on: () => { TK.tab = id; pintaTiendaHtml(); } }, tr(n)))),
    el('main.kt-body', {}, cuerpoTienda()));
  TK.caja.hidden = false; TK.caja.querySelector('.kt-body').scrollTop = arriba; TK.hecho = TK.tab;
  const sel = TK.caja.querySelector('.kt-tab[aria-pressed="true"]'); if (sel) sel.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  NAV.raiz = null;
}

// ---------- la ficha de un cosmético ----------
function abreFicha(id) { TK.ficha = id; TK.aviso = ''; const c = COS[id]; if (c.solo) TK.pil = JUGABLES.findIndex(p => p.id === c.solo); pintaFicha(); }
function cierraFicha() { TK.ficha = null; if (TK.modal) { TK.modal.remove(); TK.modal = null; } if (PANT.id === 'tienda') pintaTiendaHtml(); else if (PANT.id === 'pase') pintaPaseHtml(); }
function pintaFicha() {
  const c = COS[TK.ficha]; if (!c) return;
  const tengo = tieneCos(c.id), puesto = tengo && SAVE.lleva[c.tipo] === c.id, pil = JUGABLES[TK.pil];
  if (TK.modal) TK.modal.remove();
  TK.lienzo = lienzo(160, 110);
  const vale = sirveA(c, pil.id);
  let accion;
  if (tengo) accion = el('button.kt-btn' + (puesto ? '.rojo' : '.verde'), { 'data-k': 1, on: () => { ponCos(c.id); if (PANT.id === 'tienda') pintaTiendaHtml(); pintaFicha(); } }, tr(puesto ? 'QUITÁRMELO' : 'PONÉRMELO'));
  else if (c.de === 'tienda') accion = el('button.kt-btn' + (c.gemas ? '.gema' : ''), { 'data-k': 1, on: () => { const r = compraCos(c.id); TK.aviso = r === true ? '' : tr(r || ''); if (r !== true) play('deny'); else if (PANT.id === 'tienda') pintaTiendaHtml(); pintaFicha(); } }, tr('COMPRAR'), img(fotoIcono(c.gemas ? 'gema' : 'oro')), String(c.oro || c.gemas));
  else accion = el('button.kt-btn.gris', { 'data-k': 1, on: cierraFicha }, tr('ENTENDIDO'));
  const datos = [['QUÉ ES', tr(QUE_ES[c.tipo])], ['PARA QUIÉN', paraQuien(c)], [tengo ? 'ES TUYO' : c.de === 'tienda' ? 'PRECIO' : 'CÓMO SE CONSIGUE', tengo ? tr(puesto ? 'Lo llevas puesto.' : 'Póntelo cuando quieras.') : c.de === 'tienda' ? (c.oro ? c.oro + ' ' + tr('ORO') : c.gemas + ' ' + tr('GEMAS')) : comoCos(c)], ['¿CORRE MÁS?', tr('No. Solo se ve: online, todos iguales.')]];
  TK.modal = el('section.kt-modal', { role: 'dialog', on: e => { if (e.target === TK.modal) cierraFicha(); } }, el('div.kt-ficha', {},
    el('h3.kt-d.ol', {}, tr(c.nombre)),
    el('div.kt-lado', {},      // con el móvil tumbado, la vista a la izquierda y los datos a la derecha
      el('div.kt-col', {}, el('div.kt-vista', {}, TK.lienzo[0]),
        c.tipo !== 'titulo' && !c.solo ? el('div.kt-pilotos', {}, JUGABLES.map((p, i) => el('button.kt-pil', { 'data-k': 1, 'aria-pressed': String(i === TK.pil), 'aria-label': tr(p.nombre), on: () => { TK.pil = i; PANT.piloto = i; pintaFicha(); } }, img(fotoPiloto(p.id))))) : null,
        !vale ? el('div.kt-aviso', {}, trf('Solo lo puede llevar %1.', tr(PILOTO[c.solo].nombre))) : null),
      el('div.kt-col', {}, el('div.kt-datos', {}, datos.map(([k, v]) => el('div.kt-dato', {}, el('b', {}, tr(k)), el('span', {}, v)))),
        TK.aviso ? el('div.kt-aviso', {}, TK.aviso) : null,
        el('div.kt-acciones', {}, el('button.kt-btn.gris', { 'data-k': 1, on: cierraFicha }, tr('VOLVER')), accion)))));
  TK.lienzo[0].classList.add('kt-px');
  document.body.appendChild(TK.modal); NAV.raiz = null;
}
// el kart de la ficha, girando (cada fotograma)
function animaFicha() {
  if (!TK.modal || !TK.lienzo) return;
  const c = COS[TK.ficha], [cv2, x] = TK.lienzo; x.clearRect(0, 0, cv2.width, cv2.height);
  if (c.tipo === 'titulo') { const f = figuraJugador(JUGABLES[TK.pil].id); pintaKartCon(x, f, 80, 74, BASE_KART * 1.2, RELOJ * 1.2); escribe(x, tr(JUGABLES[TK.pil].nombre), 80, 82, '#ffffff', '#1c1028', 'centro'); escribe(x, tr(c.nombre), 80, 94, '#ffcb3d', '#1c1028', 'centro'); return; }
  const pil = c.solo || JUGABLES[TK.pil].id;
  pintaKartCon(x, figuraPrueba(pil, c), 80, 100, BASE_KART * 1.6, c.tipo === 'humo' ? Math.PI * 0.08 + Math.sin(RELOJ) * 0.4 : RELOJ * 1.1, c.tipo === 'humo' ? c : null, RELOJ * 0.8);
}

// cada fotograma, mientras se está en la tienda
function pantallaTienda() {
  paseo(14, 34); velo(0.4); calmaLienzo();
  if (!TK.caja || TK.caja.hidden || !TK.caja.isConnected) pintaTiendaHtml();
  if (KPREMIOS.length) return;
  animaFicha();
  if (TK.modal) navega(TK.modal, cierraFicha); else navega(TK.caja, () => ve('titulo'));
}
// al salir de la tienda o del pase, sus pantallas se quitan
function htmlKartsVista() {
  if (PANT.id !== 'tienda' && TK.caja && !TK.caja.hidden) TK.caja.hidden = true;
  if (PANT.id !== 'tienda' && PANT.id !== 'pase' && TK.modal) { TK.modal.remove(); TK.modal = null; TK.ficha = null; }
  if (PANT.id !== 'pase' && PK.caja && !PK.caja.hidden) PK.caja.hidden = true;
  monederoVista();
}
// lo que cambie el saldo (comprar, premios) vuelve a pintar la tienda o el pase
hook('cuenta', () => { if (PANT.id === 'tienda') pintaTiendaHtml(); });
