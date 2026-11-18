// Fans of Asalto · ADAPTADORES · La ventana de la tienda de la partida (HTML sobre el lienzo): la esencia que tienes, la oferta de tres
// objetos (comprar, o subir de nivel el que ya tienes), el botón de cambiar la oferta (pagando, o gratis con un anuncio una vez por oferta), el anuncio de esencia extra (uno por oleada) y tus objetos con el botón de vender. Cada
// compra, venta o cambio llama a su caso de uso y vuelve a pintar la ventana. No decide reglas.
'use strict';
AS.ventanas.tienda = (() => {
  const V = AS.ventanas, ico = V.ico, btn = V.btn, TI = AS.tienda;
  const gema = n => `<em class="as-esencia">${ico('gema')}${n}</em>`;
  const efecto = (d, nivel) => tr(d.txt, { v: d.v[nivel - 1] });
  const ERRORES = { 'sin-esencia': 'Te falta esencia', 'sin-hueco': 'Sin hueco: vende un objeto', 'nivel-maximo': 'Ya está al nivel máximo' };
  const avisa = r => { if (!r.ok) { AS.suena('noVale'); toast(tr(ERRORES[r.error] || 'Ahora no se puede')); } return r.ok; };

  // una carta de la oferta: el objeto, lo que da al nivel que tendría y su precio; apagada si no llega la esencia o no hay hueco
  function carta(p, id, i) {
    if (!id) return `<div class="as-carta as-vendido"><span>${tr('Comprado')}</span></div>`;
    const d = ASALTO.objetos[id], mio = TI.mio(p.tienda, id), nivel = mio ? mio.nivel + 1 : 1, precio = TI.precio(ASALTO, id);
    const cabe = !!mio || p.tienda.objetos.length < ASALTO.tienda.huecos, pega = !cabe ? ERRORES['sin-hueco'] : p.esencia < precio ? ERRORES['sin-esencia'] : '';
    const titulo = tr(d.nombre) + (mio ? ' · ' + tr('sube a nivel {n}', { n: nivel }) : '');
    return `<button class="as-carta${pega ? ' as-no' : ''}" data-compra="${i}" type="button">${ico(d.icono, 'as-ico2')}<b class="as-q${d.rareza}">${titulo} ${gema(precio)}</b><span>${efecto(d, nivel)}${pega ? ` <small>${tr(pega)}</small>` : ''}</span></button>`;
  }
  function mio(o) {
    const d = ASALTO.objetos[o.id];
    return `<li class="as-item">${ico(d.icono, 'as-ico2')}<div><b class="as-q${d.rareza}">${tr(d.nombre)} · ${tr('Nivel {n}', { n: o.nivel })}</b><span>${efecto(d, o.nivel)}</span></div>${btn('', tr('VENDER') + ' +' + TI.valorVenta(ASALTO, o), 'as-naranja as-chico').replace('id=""', `data-vende="${o.id}"`)}</li>`;
  }
  function abre(E) {
    const p = E.casos.partida, t = p.tienda, H = ASALTO.tienda.huecos, coste = p.costeCambio, faltan = TI.faltan(ASALTO, p.oleada);
    const tuyos = t.objetos.length ? `<ul class="as-lista">${t.objetos.map(mio).join('')}</ul>` : `<p class="as-nota">${tr('Aún no tienes objetos. Lo que compres vale para toda la partida.')}</p>`;
    const gratis = p.puedeAnuncio('oferta') ? btn('as-anu-oferta', tr('GRATIS · ANUNCIO'), 'as-verde as-chico') : '';
    const extra = p.puedeAnuncio('esencia') ? btn('as-anu-esencia', tr('+{n} ESENCIA · ANUNCIO', { n: ASALTO.anuncios.esencia.cantidad }), 'as-verde as-chico') : '';
    const caja = V.abre(`<h2>${tr('TIENDA')}</h2><p class="as-botin">${tr('Tu esencia:')} ${gema(p.esencia)}</p>${extra}
      <p class="as-nota">${tr('La esencia se gana al superar oleadas. Aquí no se gasta oro.')}</p>
      ${t.oferta.map((id, i) => carta(p, id, i)).join('')}
      <p class="as-nota">${faltan === 1 ? tr('Oferta nueva en la próxima oleada.') : tr('Oferta nueva en {n} oleadas.', { n: faltan })}</p>
      <div class="as-fila as-junta">${btn('as-otra-oferta', tr('OTRA OFERTA') + ' ' + ico('gema') + coste, 'as-oro as-chico')}${gratis}</div>
      <h3>${tr('TUS OBJETOS {n}/{de}', { n: t.objetos.length, de: H })}</h3>${tuyos}` + btn('as-cerrar', tr('CERRAR'), 'as-azul'));
    V.alPulsar('as-cerrar', V.cierra);
    V.alPulsar('as-otra-oferta', () => { if (avisa(E.casos.cambiaOferta())) abre(E); });
    // los anuncios: el premio llega solo al acabar de verse (V.anuncio llama después); cerrarlo antes no da nada
    V.alPulsar('as-anu-oferta', () => V.anuncio(() => { if (avisa(E.casos.anuncio('oferta'))) abre(E); }));
    V.alPulsar('as-anu-esencia', () => V.anuncio(() => { if (avisa(E.casos.anuncio('esencia'))) { AS.suena('cofre'); abre(E); } }));
    for (const b of caja.querySelectorAll('[data-compra]')) b.onclick = () => { if (avisa(E.casos.compraObjeto(+b.dataset.compra))) { AS.suena('cofre'); abre(E); } };
    for (const b of caja.querySelectorAll('[data-vende]')) b.onclick = () => {
      const d = ASALTO.objetos[b.dataset.vende];
      confirmBox(tr('¿VENDER?'), tr('Vendes {objeto} y recuperas la mitad de su esencia.', { objeto: tr(d.nombre) }), tr('SÍ, VENDER'), () => { if (avisa(E.casos.vendeObjeto(b.dataset.vende))) { AS.suena('moneda'); abre(E); } });
    };
  }
  return abre;
})();
