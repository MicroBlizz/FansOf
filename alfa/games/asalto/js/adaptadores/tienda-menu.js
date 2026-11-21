// Fans of Asalto · ADAPTADORES · La tienda del menú: el cofre de equipo y las plumas de regalo (con un anuncio) de siempre y, detrás del modo
// desarrollo (ADR 200, tarea #317), las ofertas con euros (Sin anuncios, el Pack de inicio) en su propio panel destacado, el escaparate de
// aspectos de héroe (con Coronas) y las bolsas de Coronas. Todo lo de pago pasa por MONEDAS.compraReal (puerta de adultos, compra de prueba,
// cuenta de probador, Google Play o Paddle); aquí no se decide ninguna regla: las llevan los casos de uso. Una compra real la entrega el
// servidor y aquí se adopta lo que diga; solo la compra de prueba del modo desarrollo se entrega en local.
// Puertos: casos, ventana(html) (la ventana del menú), pluma(n), sinPlumas(resultado).
'use strict';
AS.creaTiendaMenu = ({ casos, ventana, pluma, sinPlumas }) => {
  const V = AS.ventanas, E = ASALTO.equipo, A = ASALTO.anuncios.plumas, C = ASALTO.compras, DERECHO = MEDIDOR_ANUNCIOS.DERECHO;
  const nuevo = () => casos.comprasActivas();
  const sePuede = () => MEDIDOR_ANUNCIOS.sePuedeComprar();
  const enTienda = () => !!document.getElementById('as-t-cofre');   // ¿está abierta la ventana de la tienda (y no otra)?
  const euros = v => (NUCLEO.idioma === 'en' ? '€' + v.toFixed(2) : v.toFixed(2).replace('.', ',') + ' €');
  const miles = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NUCLEO.idioma === 'en' ? ',' : '.');
  const corona = n => `${MONEDAS.icono('comprada')}${miles(n)}`;
  const em = txt => `<em>${tr(txt)}</em>`;
  // una oferta con euros: lo que trae, su marca (PARA SIEMPRE, UNA SOLA VEZ) y el botón con su precio real; ya comprada, lo dice
  function oferta({ titulo, marca, texto, id, precio, tuya }) {
    const der = tuya ? em('Ya lo tienes') : `<button type="button" class="med-an-compra" id="${id}">${euros(precio)}</button>`;
    return `<div class="med-an-oferta${tuya ? ' tuya' : ''}"><div><b>${tr(titulo)}</b> <span class="med-an-siempre">${tr(marca)}</span><p>${texto}</p></div>${der}</div>`;
  }
  function htmlSinAnuncios() {
    const tuya = AS.derechos.tiene(DERECHO);
    if (!tuya && !sePuede()) return '';
    return oferta({ titulo: 'Sin anuncios', marca: 'PARA SIEMPRE', id: 'as-t-sin', precio: C.sinAnuncios.precio, tuya,
      texto: tr('Los premios de los anuncios te llegan al tocar su botón, sin ver el anuncio. El tope de cada día sigue igual.') });
  }
  function htmlInicio() {
    const tuya = casos.inicioComprado(), I = C.inicio;
    if (!tuya && !sePuede()) return '';
    return oferta({ titulo: 'Pack de inicio', marca: 'UNA SOLA VEZ', id: 'as-t-inicio', precio: I.precio, tuya,
      texto: tr('{n} Coronas y el aspecto CrazyBunny de Gala, que no se vende de otra forma.', { n: I.coronas }) });
  }
  // las ofertas con euros, en su propio panel y lejos de los botones de plumas
  function htmlEuros() {
    const bloques = htmlSinAnuncios() + htmlInicio();
    return bloques ? `<div class="as-euros"><h3>${tr('CON DINERO REAL')}</h3>${bloques}</div>` : '';
  }
  // las Coronas: dos botones de ir a otra ventana (los aspectos y las bolsas), que no cobran nada
  function htmlCoronas() {
    const bolsas = sePuede() ? V.btn('as-t-bolsas', tr('MÁS CORONAS'), 'as-azul') : '';
    return `<h3 class="as-sep">${tr('CON CORONAS')}</h3><div class="as-nav">${V.btn('as-t-aspectos', tr('ASPECTOS'), 'as-azul')}${bolsas}</div><h3 class="as-sep">${tr('CON PLUMAS')}</h3>`;
  }
  function html() {
    const g = casos.progreso, quedan = casos.regalosQuedan();
    const saldo = nuevo() ? ` ${MONEDAS.icono('comprada')}${miles(g.coronas)}` : '';
    return `<h2>${tr('TIENDA')}</h2><p class="as-plumas">${pluma(g.plumas)}${saldo}</p>${nuevo() ? htmlEuros() + htmlCoronas() : ''}
      <div class="as-oferta"><i class="as-cofre as-pix" style="${AS.dibujos.cssRetrato('cofre', 1)}"></i><div><b>${tr('COFRE DE EQUIPO')}</b><span>${tr('Un objeto al azar: normal, raro o épico.')}</span></div>${V.btn('as-t-cofre', pluma(E.cofreTienda), 'as-oro')}</div>
      <div class="as-oferta">${V.ico('pluma', 'as-ico2')}<div><b>${tr('PLUMAS DE REGALO')}</b><span>${tr('Mira un anuncio y llévate {n} plumas.', { n: A.cantidad })} ${quedan ? tr('Hoy te quedan {n} de {de}.', { n: quedan, de: A.diarias }) : tr('Hoy ya no quedan: vuelve mañana.')}</span></div>${V.btn('as-t-anuncio', tr('ANUNCIO'), 'as-verde')}</div>`;
  }
  function abre() {
    ventana(html());
    V.alPulsar('as-t-cofre', () => {
      const r = casos.compraCofre();
      if (!sinPlumas(r)) return;
      const o = r.valor.objeto;
      AS.suena('cofre'); toast(tr(E.rarezas[o.rareza].nombre) + ': ' + tr(E.nombres[o.hueco]) + ' +' + o.valor + ' % ' + tr(E.stats[o.stat]), true); abre();
    });
    V.alPulsar('as-t-anuncio', () => {
      if (!casos.regalosQuedan()) { AS.suena('noVale'); toast(tr('Hoy ya no quedan plumas de regalo. Vuelve mañana.')); return; }
      V.anuncio('plumas', () => {
        const r = casos.plumasDeRegalo();
        if (r.ok) V.premio(tr('+{n} plumas', { n: r.valor.plumas }));
        else toast(r.error === 'sin-dia' ? tr('No sabemos qué día es: inténtalo en un momento.') : tr('Hoy ya no quedan plumas de regalo. Vuelve mañana.'));
        abre();
      });
    });
    if (nuevo()) enlazaNuevo();
  }
  function enlazaNuevo() {
    V.alPulsar('as-t-sin', compraSinAnuncios); V.alPulsar('as-t-inicio', compraInicio);
    V.alPulsar('as-t-aspectos', aspectos); V.alPulsar('as-t-bolsas', bolsas);
  }
  // una ventana dentro de la tienda: su VOLVER lleva a la tienda y deja sitio entre el botón y lo que se paga
  function subventana(cuerpo) {
    const el = V.abre(cuerpo + V.btn('as-volver', tr('VOLVER'), 'as-azul as-aparte'), 'as-alta');
    V.alPulsar('as-volver', abre);
    return el;
  }

  /* ---------- lo que se paga con euros ---------- */
  // abre la compra de core con lo que trae y su precio, sin descuentos ni letra pequeña escondida
  function pagar(producto, nombre, cuerpo, llega) {
    MONEDAS.compraReal(tr('¿COMPRAR?'), `<b>${nombre}</b><br>${cuerpo}`, r => llega(r), producto);
  }
  function compraSinAnuncios() {
    if (AS.derechos.tiene(DERECHO) || !sePuede()) return;
    pagar(C.sinAnuncios.producto, tr('Sin anuncios'), `${tr('PARA SIEMPRE')} · <b>${euros(C.sinAnuncios.precio)}</b><br><small>${tr('Los premios de los anuncios te llegan al tocar su botón, sin ver el anuncio. El tope de cada día sigue igual.')}</small>`, r => {
      AS.derechos.llega(r, DERECHO);
      V.premio(tr('¡Sin anuncios! Los premios te llegan al tocar'));
      if (r.real) AS.derechos.refresca().then(() => { if (enTienda()) abre(); });
      abre();
    });
  }
  // lo que llega de un producto con Coronas: la prueba (solo en desarrollo) se entrega aquí; una compra real la dio el servidor y se adopta lo que dice
  function llega(r, producto, nombre, vuelve) {
    if (r.prueba) {
      if (!casos.entregaDeProducto(producto).ok) { AS.suena('noVale'); toast(tr('Ya lo tienes')); return; }
    } else casos.adoptaDelServidor(r);
    V.premio(tr('¡Comprado! {c}', { c: nombre })); vuelve();
  }
  function compraInicio() {
    const I = C.inicio;
    if (casos.inicioComprado() || !sePuede()) return;
    pagar(I.producto, tr('Pack de inicio'), `${tr('UNA SOLA VEZ')} · <b>${euros(I.precio)}</b><br><small>${tr('{n} Coronas y el aspecto CrazyBunny de Gala, que no se vende de otra forma.', { n: I.coronas })}</small>`,
      r => llega(r, I.producto, tr('Pack de inicio'), abre));
  }
  function bolsas() {
    const filas = C.bolsas.map(b => `<li class="as-item"><div><b>${corona(b.coronas)}</b><span>${tr('{n} Coronas', { n: miles(b.coronas) })}</span></div><button class="as-btn as-euro as-chico" data-bolsa="${b.producto}" type="button">${euros(b.precio)}</button></li>`).join('');
    const el = subventana(`<h2>${tr('CORONAS')}</h2><p class="as-plumas">${corona(casos.coronas())}</p><p class="as-nota">${tr('Las Coronas solo compran aspectos de héroe: no dan fuerza ni se usan en nada con azar. Las plumas no se venden.')}</p><ul class="as-lista">${filas}</ul>`);
    for (const b of el.querySelectorAll('[data-bolsa]')) b.onclick = () => { AS.suena('clic'); compraBolsa(C.bolsas.find(x => x.producto === b.dataset.bolsa)); };
  }
  function compraBolsa(b) {
    pagar(b.producto, tr('{n} Coronas', { n: miles(b.coronas) }), `<b>${euros(b.precio)}</b><br><small>${tr('Las Coronas solo compran aspectos de héroe: no dan fuerza ni se usan en nada con azar. Las plumas no se venden.')}</small>`,
      r => llega(r, b.producto, tr('{n} Coronas', { n: miles(b.coronas) }), bolsas));
  }

  /* ---------- el escaparate de aspectos (con Coronas) ---------- */
  function botonAspecto(a) {
    if (a.puesto) return `<button class="as-btn as-azul as-chico" data-quita="${a.heroe}" type="button">${tr('QUITAR')}</button>`;
    if (a.tienes) return `<button class="as-btn as-verde as-chico" data-pon="${a.id}" type="button">${tr('PONER')}</button>`;
    if (a.vende) return `<button class="as-btn as-oro as-chico" data-compra="${a.id}" type="button">${corona(a.coronas)}</button>`;
    return `<span class="as-solo">${tr('Solo en el Pack de inicio')}</span>`;
  }
  function filaAspecto(a) {
    const retrato = AS.dibujos.cssRetrato(a.heroe, 1) + ';' + AS.pieles.filtro(ASALTO.aspectos[a.id]);
    return `<li class="as-item as-aspecto"><i class="as-retrato as-pix" style="${retrato}"></i><div><b>${tr(a.nombre)}</b><span>${a.puesto ? tr('Puesto') : ASALTO.heroes[a.heroe].nombre}</span></div>${botonAspecto(a)}</li>`;
  }
  function aspectos() {
    const el = subventana(`<h2>${tr('ASPECTOS')}</h2><p class="as-plumas">${corona(casos.coronas())}</p><p class="as-nota">${tr('Solo cambian cómo se ve el héroe: no dan fuerza ni se usan en nada con azar. Cuestan siempre lo mismo.')}</p><ul class="as-lista">${casos.aspectos().map(filaAspecto).join('')}</ul>`);
    for (const b of el.querySelectorAll('[data-compra]')) b.onclick = () => { AS.suena('clic'); preguntaCompra(b.dataset.compra); };
    for (const b of el.querySelectorAll('[data-pon]')) b.onclick = () => { casos.ponAspecto(b.dataset.pon); AS.suena('clic'); aspectos(); };
    for (const b of el.querySelectorAll('[data-quita]')) b.onclick = () => { casos.quitaAspecto(b.dataset.quita); AS.suena('clic'); aspectos(); };
  }
  function preguntaCompra(id) {
    const a = ASALTO.aspectos[id];
    confirmBox(tr('¿COMPRAR?'), `${tr(a.nombre)} · ${corona(a.coronas)}`, tr('SÍ'), () => {
      const r = casos.compraAspecto(id);
      if (r.ok) { AS.suena('cofre'); toast(tr('¡Es tuyo! {c}', { c: tr(a.nombre) }), true); } else { AS.suena('noVale'); toast(r.error === 'sin-coronas' ? tr('Te faltan {n} Coronas', { n: r.datos.coste - casos.coronas() }) : tr('No se puede')); }
      aspectos();
    });
  }
  AS.derechos.alCambiar(() => { if (enTienda()) abre(); });
  return { abre };
};
