// Fans of Asalto · ADAPTADORES · La ventana del regalo diario y de las misiones del día (tareas #313 y #317): los 7 días del calendario (los
// cobrados, el de hoy destacado y los que vienen, con el premio de mañana a la vista), el botón de cobrar, el de doblar el premio con un
// anuncio (una vez al día) y las tres misiones del día con su barra, que se cobran tocando. Cada toque llama a su caso de uso y repinta.
// No decide reglas (dominio/regalo.js y el sistema de retos de core).
'use strict';
AS.ventanas.regalo = (() => {
  const V = AS.ventanas, ico = V.ico, btn = V.btn;
  const ERRORES = { 'sin-dia': 'No sabemos qué día es: inténtalo en un momento.', 'ya-cobrado': 'Hoy ya has cobrado el regalo. Vuelve mañana.', 'ya-doblado': 'Hoy ya has doblado el premio.' };
  const barra = (va, meta) => `<div class="as-barra"><i style="width:${Math.min(100, Math.round(va / meta * 100))}%"></i></div>`;
  const cofre = k => `<i class="as-cofre as-pix as-cofre-mini" style="${AS.dibujos.cssRetrato('cofre', k)}"></i>`;
  // un premio { plumas, cofres } con sus iconos (para el calendario) y con palabras (para el aviso)
  function htmlPremio(p, k) {
    return `${p.plumas ? `<span>${ico('pluma')}${p.plumas}</span>` : ''}${p.cofres ? `<span>${cofre(k)}${p.cofres > 1 ? '×' + p.cofres : ''}</span>` : ''}`;
  }
  function textoPremio(p) {
    const plumas = p.plumas ? tr('+{n} plumas', { n: p.plumas }) : '', cofres = !p.cofres ? '' : p.cofres === 1 ? tr('Cofre de equipo') : tr('{n} cofres de equipo', { n: p.cofres });
    return plumas && cofres ? tr('{a} y {b}', { a: plumas, b: cofres }) : plumas || cofres;
  }
  const textoObjeto = o => { const E = ASALTO.equipo; return `${tr(E.rarezas[o.rareza].nombre)}: ${tr(E.nombres[o.hueco])} +${o.valor} % ${tr(E.stats[o.stat])}`; };
  function htmlDia(d) {
    const hecho = d.estado === 'cobrado' || d.cobradoHoy;
    return `<div class="as-dia as-${d.estado}${d.n === 7 ? ' as-gordo' : ''}"><small>${d.estado === 'hoy' && !hecho ? tr('HOY') : tr('DÍA {n}', { n: d.n })}</small><div>${htmlPremio(d.premio, d.n === 7 ? 0.7 : 0.55)}</div>${hecho ? `<i>${tr('HECHO')}</i>` : ''}</div>`;
  }
  function htmlMision(m) {
    const d = ASALTO.retosDia.find(x => x.id === m.id);
    const der = m.cobrada ? `<span class="as-hecho">${tr('COBRADA')}</span>` : m.listo ? `<button class="as-btn as-verde as-chico" data-mision="${m.id}" type="button">${ico('pluma')}${m.r}</button>` : '';
    return `<li class="as-item">${ico(d.icono, 'as-ico2')}<div><b>${tr(m.txt, { n: m.goal })}</b><span>${m.prog}/${m.goal} · ${ico('pluma')}+${m.r}</span>${barra(m.prog, m.goal)}</div>${der}</li>`;
  }
  // los botones de abajo: cobrar el de hoy, o doblarlo con un anuncio, o nada (ya doblado)
  function htmlAcciones(c) {
    if (c.pendiente) return btn('as-rg-cobra', tr('COBRAR EL DE HOY'), 'as-verde as-enorme');
    return c.puedeDoblar ? btn('as-rg-dobla', tr('DOBLAR · ANUNCIO'), 'as-oro') : '';
  }
  // casos: los casos de uso; alCerrar: lo que hace el menú al cerrarla (repintarse); recibido: los objetos que ha dado el cofre de hoy (solo mientras sigue abierta)
  function abre(casos, alCerrar, recibido = []) {
    const c = casos.regalo(), D = c.dias, manana = D[(c.hoy + 1) % D.length];
    const nota = c.sinDia ? tr('No sabemos qué día es: inténtalo en un momento.') : c.pendiente ? tr('Día {n} de 7: ¡toca cobrar!', { n: c.hoy + 1 }) : tr('Hoy ya lo has cobrado. Vuelve mañana.');
    const objetos = recibido.length ? `<ul class="as-lista">${recibido.map(o => `<li class="as-item">${ico('equipo-' + o.hueco)}<div><b class="as-r${o.rareza}">${textoObjeto(o)}</b></div></li>`).join('')}</ul>` : '';
    const el = V.abre(`<div class="as-regalo"><h2>${tr('REGALO DIARIO')}</h2><p class="as-nota">${nota}</p><div class="as-cal">${D.map(htmlDia).join('')}</div>
      <p class="as-manana">${tr('Mañana')}: <span>${textoPremio(manana.premio)}</span></p>${objetos}<div class="as-fila">${htmlAcciones(c)}</div>
      <h2>${tr('MISIONES DEL DÍA')}</h2><p class="as-nota">${tr('Se rehacen cada día. Toca el premio para cobrarlo.')}</p><ul class="as-lista as-metas">${casos.misionesDia().map(htmlMision).join('')}</ul>
      ${btn('as-rg-volver', tr('VOLVER'), 'as-azul')}</div>`, 'as-alta');
    V.alPulsar('as-rg-volver', () => { V.cierra(); alCerrar(); });
    V.alPulsar('as-rg-cobra', () => cobra(casos, alCerrar));
    V.alPulsar('as-rg-dobla', () => dobla(casos, alCerrar, recibido));
    for (const b of el.querySelectorAll('[data-mision]')) b.onclick = () => { if (casos.cobraMision(b.dataset.mision).ok) AS.suena('cofre'); abre(casos, alCerrar, recibido); };
  }
  const falla = r => { AS.suena('noVale'); toast(tr(ERRORES[r.error] || 'Ahora no se puede')); };
  function cobra(casos, alCerrar) {
    const r = casos.cobraRegalo();
    if (!r.ok) { falla(r); abre(casos, alCerrar); return; }
    V.premio(textoPremio(r.valor.premio));
    abre(casos, alCerrar, r.valor.objetos);
  }
  // el anuncio ya visto da el premio otra vez (V.anuncio solo llama después de verse entero)
  function dobla(casos, alCerrar, recibido) {
    V.anuncio('regalo-doble', () => {
      const r = casos.doblaRegalo();
      if (!r.ok) { falla(r); abre(casos, alCerrar, recibido); return; }
      V.premio(tr('¡Premio doble!') + ' ' + textoPremio(r.valor.premio));
      abre(casos, alCerrar, [...recibido, ...r.valor.objetos]);
    });
  }
  return abre;
})();
