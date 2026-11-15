// Fans Of Sótano · adaptador · PANELES DE LA CARRERA: lo que se queda entre Despidos. El Despido (y el automático), los Recuerdos, el plan de
// carrera, los retos (diarias, semanales y logros) y las opciones. Mismo contrato que paneles.js: solo HTML con data-acc.
'use strict';
SO.panelesCarrera = (() => {
  const P = SO.paneles, n = v => SO.txt.num(v);

  function despido(e, B) {
    const puede = SO.despido.puede(e), cobra = SO.despido.cobraria(e, B), min = SO.AJ.despido.nivelMinimo;
    const txt = puede ? tr('El CEO os echa a todos. Vuelves a la planta 1 sin oro, piezas, nivel ni mejoras del pico, y cobras {n} de Indemnización.', { n: n(cobra) })
      : tr('Hasta el nivel {m} no te pueden despedir (te faltan {f}).', { m: min, f: min - e.r.nivel });
    return `<div class="so-texto"><h4>${tr('El Despido')}</h4><p>${txt}</p><p><small>${tr('Se quedan la Trituradora, tu equipo, los Recuerdos, los expedientes, el plan de carrera y los objetos.')}</small></p>`
      + `${P.boton('despedir', '', tr('DESPEDIRSE'), puede, 'grande peligro')}${autoDespido(e)}</div>`;
  }
  function autoDespido(e) {
    if (!e.c.plan.autodespido) return '';
    const min = SO.AJ.despido.nivelMinimo, tope = SO.curvas.topeNivel(e.c.trituradora.nivel);
    const opciones = [0];
    for (let v = min; v <= tope; v += 5) opciones.push(v);
    const botones = opciones.map(v => P.boton('autodespido', v, v ? tr('Nv. {n}', { n: v }) : tr('No'), true, e.c.autoDespido === v ? 'activo' : '')).join('');
    return `<div class="so-venta"><b>${tr('Despedirse solo al llegar al nivel')}</b><div>${botones}</div></div>`;
  }
  function recuerdos(e) {
    return `<h4 class="so-sub">${tr('Recuerdos')} · ${tr('tienes {n} de Indemnización', { n: n(e.c.indemnizacion) })}</h4>` + SO.RECUERDOS.map(r => {
      const nivel = e.c.recuerdos[r.id] || 0, precio = SO.compras.precioRecuerdo(e, r.id);
      const der = nivel >= SO.AJ.recuerdo.max ? `<em>${tr('Máximo')}</em>` : P.boton('recuerdo', r.id, `${n(precio)}<i class="so-indem-i"></i>`, e.c.indemnizacion >= precio);
      return P.fila(P.icono(`img/icono-${r.id}.png`, '#b06bff'), `${tr(r.nombre)} · ${tr('nivel {n}', { n: nivel })}`, tr(r.txt), der);
    }).join('');
  }
  function plan(e) {
    const puntos = SO.compras.puntos(e);
    return `<h4 class="so-sub">${tr('Plan de carrera')} · ${tr('{n} puntos', { n: puntos })}</h4>`
      + `<p class="so-nota">${tr('Un punto por cada nivel roto de la Trituradora y otro cada 10 niveles de tu nivel más alto.')}</p>` + SO.CARRERA.map(c => {
        const hecho = !!e.c.plan[c.id], falta = c.pide && !e.c.plan[c.pide];
        const der = hecho ? `<em>${tr('Hecho')}</em>` : falta ? `<em>${tr('Antes: {n}', { n: tr(SO.CARRERA.find(x => x.id === c.pide).nombre) })}</em>` : P.boton('carrera', c.id, tr('{n} pt', { n: c.coste }), puntos >= c.coste);
        return P.fila(P.icono('', hecho ? '#3ddc84' : '#555'), tr(c.nombre), tr(c.txt), der);
      }).join('');
  }
  // cuántos Recuerdos y nodos del plan se pueden pagar ahora
  function avisos(e) {
    const puntos = SO.compras.puntos(e);
    const recuerdos = SO.RECUERDOS.filter(r => (e.c.recuerdos[r.id] || 0) < SO.AJ.recuerdo.max && e.c.indemnizacion >= SO.compras.precioRecuerdo(e, r.id)).length;
    const nodos = SO.CARRERA.filter(c => !e.c.plan[c.id] && !(c.pide && !e.c.plan[c.pide]) && puntos >= c.coste).length;
    return recuerdos + nodos;
  }
  const carrera = (e, B) => despido(e, B) + recuerdos(e) + plan(e);

  const LISTAS = [['d', 'Hoy'], ['s', 'Esta semana'], ['l', 'Logros']];
  function retos() {
    return LISTAS.map(([p, titulo]) => `<h4 class="so-sub">${tr(titulo)}</h4>` + SO.retos.lista(p).map(m => {
      const der = m.cobrada ? `<em>${tr('Cobrado')}</em>` : P.boton('cobrar', `${p}:${m.id}`, tr('+{n}', { n: m.r }), m.listo, m.listo ? 'listo' : '');
      return P.fila(P.icono('', m.listo ? '#ffd23f' : '#555'), tr(m.txt), `${n(m.prog)} / ${n(m.goal)}`, der);
    }).join('')).join('');
  }
  // las ayudas de pruebas: solo en desarrollo y en la alfa
  function dev() {
    if (typeof NUCLEO === 'undefined' || !(NUCLEO.desarrollo || NUCLEO.alfa)) return '';
    const vel = [1, 10, 100].map(v => P.boton('dev-velocidad', v, 'x' + v, true, SO.ui.velocidad === v ? 'activo' : '')).join('');
    return `<div class="so-venta"><b>DEV</b><div>${vel}${P.boton('dev-fuera', '', '+1 h')}${P.boton('dev-oro', '', '+oro')}</div></div>`;
  }
  function opciones() {
    return `<div class="so-texto">${P.boton('sonido', '', SO.sonido.apagado ? tr('Activar el sonido') : tr('Quitar el sonido'))}`
      + `<p>${tr('Versión {v}. Prototipo: las cifras cambiarán.', { v: SO.AJ.version })}</p>${P.boton('borrar', '', tr('Borrar la partida'), true, 'peligro')}</div>${dev()}`;
  }
  return { carrera, retos, opciones, avisos };
})();
