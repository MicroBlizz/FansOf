// Fans Of Paperwork · adaptador · PANELES DE «TU CARRERA»: la mesa, lo que se queda entre Despidos. El Despido (y el automático), los Recuerdos
// (los objetos que hay encima de la mesa), el plan de carrera, el equipo con sus manías, los retos (diarias, semanales y logros) y las
// opciones. Mismo contrato que paneles.js: solo HTML con data-acc.
'use strict';
PW.panelesCarrera = (() => {
  const P = PW.paneles, n = v => PW.txt.num(v);

  function despido(e, B) {
    const puede = PW.despido.puede(e, B), cobra = PW.despido.cobraria(e, B);
    const txt = puede ? tr('El CEO os echa a todos. Vuelves a la planta 1 sin oro, expedientes, nivel ni útiles, y cobras {n} de Indemnización.', { n: n(cobra) })
      : tr('Aún no cobrarías nada: sube un poco de nivel y el Despido empezará a dar Indemnización.');
    const sancion = e.c.sancion > 0 ? `<p class="pw-nota pw-aviso">${tr('Sanción del CEO por pedidos sin cumplir: {p} menos en este Despido.', { p: PW.txt.pct(e.c.sancion) })}</p>` : '';
    return `<div class="pw-texto"><h4>${tr('El Despido')}</h4><p>${txt}</p>${sancion}<p><small>${tr('Al despedirte, tu antiguo jefe te ofrece 3 cartas de recomendación: eliges una ventaja para el turno siguiente.')}</small></p><p><small>${tr('Se quedan la Trituradora, tu equipo, los Recuerdos, la especialidad, el plan de carrera y los objetos.')}</small></p>`
      + `${P.boton('despedir', '', tr('DESPEDIRSE'), puede, 'grande peligro')}${autoDespido(e)}</div>`;
  }
  function autoDespido(e) {
    if (!e.c.plan.autodespido) return '';
    const tope = PW.curvas.topeNivel(e.c.trituradora.nivel);
    const opciones = [0];
    for (let v = 10; v <= tope; v += 5) opciones.push(v);
    const botones = opciones.map(v => P.boton('autodespido', v, v ? tr('Nv. {n}', { n: v }) : tr('No'), true, e.c.autoDespido === v ? 'activo' : '')).join('');
    return `<div class="pw-venta"><b>${tr('Despedirse solo al llegar al nivel')}</b><div>${botones}</div></div>`;
  }
  // los Recuerdos, cada uno una ficha encima de la mesa
  function recuerdos(e) {
    return `<h4 class="pw-sub">${tr('Recuerdos')} · ${tr('tienes {n} de Indemnización', { n: n(e.c.indemnizacion) })}</h4><div class="pw-mesa-objetos">` + PW.RECUERDOS.map(r => {
      const nivel = e.c.recuerdos[r.id] || 0, precio = PW.compras.precioRecuerdo(e, r.id);
      const der = nivel >= PW.AJ.recuerdo.max ? `<em>${tr('Máximo')}</em>` : P.boton('recuerdo', r.id, `${n(precio)}<i class="pw-indem-i"></i>`, e.c.indemnizacion >= precio);
      return `<div class="pw-recuerdo">${P.icono(`img/icono-${r.id}.png`, '#b06bff')}<b>${tr(r.nombre)}</b><small>${tr(r.txt)} · ${tr('nivel {n}', { n: nivel })}</small>${der}</div>`;
    }).join('') + '</div>';
  }
  // los méritos: los que trae el paquete del sindicato, cuántas veces se tiene cada uno y lo que suman en total
  function meritos(e) {
    const filas = PW.MERITOS.map(m => {
      const veces = PW.meritos.nivel(e, m.id);
      return P.fila(P.icono('', veces ? '#ffd23f' : '#555'), tr(m.nombre), tr(m.txt), `<em>×${n(veces)}</em>`);
    }).join('');
    return `<h4 class="pw-sub">${tr('Méritos')} · ${n(PW.meritos.total(e))}</h4>`
      + `<p class="pw-nota">${tr('Cada paquete del sindicato trae un mérito al azar y unas grapas de oro. Los méritos son para toda la carrera, no se pierden con el Despido y no tienen tope: cada uno suma su bono otra vez.')}</p>`
      + `<p class="pw-nota"><b>${tr('Grapas de oro: {n}', { n: n(e.c.grapas) })}</b> · ${PW.desbloqueos.tiene(e, 'plan') ? tr('Con ellas compras puntos del plan de carrera.') : tr('Guárdalas: cuando se abra el plan de carrera, compran puntos.')}</p>` + filas;
  }
  // comprar puntos del plan con grapas de oro (el precio sube con cada uno)
  function punto(e) {
    const precio = PW.meritos.precioPunto(e);
    return `<div class="pw-venta"><b>${tr('Grapas de oro: {n}', { n: n(e.c.grapas) })}</b><div>${P.boton('punto', '', tr('Comprar un punto · {n} grapas', { n: n(precio) }), e.c.grapas >= precio)}</div></div>`;
  }
  // la fotocopiadora (si se tiene su nodo): qué tipo de documento, de los que ya se han visto, sale el doble
  function fotocopia(e) {
    if (!e.c.plan.fotocopiadora) return '';
    const hasta = PW.curvas.documentosDe(e.c.plantaMax)[1];
    const botones = P.boton('fotocopia', -1, tr('Apagada'), true, e.c.fotocopia === -1 ? 'activo' : '')
      + PW.DOCUMENTOS.slice(0, hasta + 1).map((d, i) => P.boton('fotocopia', i, tr(d.nombre), true, e.c.fotocopia === i ? 'activo' : '')).join('');
    return `<div class="pw-venta"><b>${tr('La fotocopiadora saca el doble de')}</b><div>${botones}</div></div>`;
  }
  function plan(e) {
    const puntos = PW.compras.puntos(e);
    return `<h4 class="pw-sub">${tr('Plan de carrera')} · ${tr('{n} puntos', { n: puntos })}</h4>`
      + `<p class="pw-nota">${tr('Un punto por cada nivel atascado de la Trituradora, otro cada 10 niveles de tu nivel más alto y los que compres con grapas de oro.')}</p>` + punto(e) + fotocopia(e) + PW.CARRERA.map(c => {
        const hecho = !!e.c.plan[c.id], falta = c.pide && !e.c.plan[c.pide];
        const der = hecho ? `<em>${tr('Hecho')}</em>` : falta ? `<em>${tr('Antes: {n}', { n: tr(PW.CARRERA.find(x => x.id === c.pide).nombre) })}</em>` : P.boton('carrera', c.id, tr('{n} pt', { n: c.coste }), puntos >= c.coste);
        return P.fila(P.icono('', hecho ? '#3ddc84' : '#555'), tr(c.nombre), tr(c.txt), der);
      }).join('');
  }
  // el equipo: quién se ha unido ya (con su poder y su manía) y quién falta
  function equipo(e, B) {
    const lib = PW.bonos.liberadas(e);
    const drones = B.drones ? P.fila(P.icono('img/icono-dron.png', '#7ef9ff'), `${tr('Drones')} ×${B.drones}`, tr('Rebuscan sin manía y solo llegan a la fila de arriba del pasillo.'), '') : '';
    return `<h4 class="pw-sub">${tr('Tu equipo')}</h4><p class="pw-nota">${tr('Cada trabajador rebusca en su archivador a la vez que tú. Tócalo en el pasillo y luego toca un archivador para mandarlo ahí.')}</p>`
      + PW.FACCIONES.map((f, k) => (k < lib
        ? P.fila(P.icono('', '#ff9a3c'), `${f.lider} · ${tr(f.poder)}`, `${tr(f.txt)}<br>${tr(f.mania)}`, '')
        : P.fila(P.icono('', '#555'), '???', tr('Se une al atascar el nivel {n} de la Trituradora', { n: k }), ''))).join('') + drones;
  }
  // cuántos Recuerdos y nodos del plan se pueden pagar ahora, y si ya se puede cobrar un Despido
  function avisos(e) {
    const puntos = PW.compras.puntos(e);
    const recuerdos = PW.RECUERDOS.filter(r => (e.c.recuerdos[r.id] || 0) < PW.AJ.recuerdo.max && e.c.indemnizacion >= PW.compras.precioRecuerdo(e, r.id)).length;
    const plan = PW.CARRERA.filter(c => !e.c.plan[c.id] && !(c.pide && !e.c.plan[c.pide]) && puntos >= c.coste).length
      + (PW.desbloqueos.tiene(e, 'plan') && e.c.grapas >= PW.meritos.precioPunto(e) ? 1 : 0);   // un punto que se puede comprar con grapas
    return { despido: 0, recuerdos, plan };
  }

  const LISTAS = [['d', 'Hoy'], ['s', 'Esta semana'], ['l', 'Logros']];
  function retos() {
    return LISTAS.map(([p, titulo]) => `<h4 class="pw-sub">${tr(titulo)}</h4>` + PW.retos.lista(p).map(m => {
      const der = m.cobrada ? `<em>${tr('Cobrado')}</em>` : P.boton('cobrar', `${p}:${m.id}`, tr('+{n}', { n: m.r }), m.listo, m.listo ? 'listo' : '');
      return P.fila(P.icono('', m.listo ? '#ffd23f' : '#555'), tr(m.txt), `${n(m.prog)} / ${n(m.goal)}`, der);
    }).join('')).join('');
  }
  function opciones() {
    return `<div class="pw-texto">${P.boton('sonido', '', PW.sonido.apagado ? tr('Activar el sonido') : tr('Quitar el sonido'))}`
      + `<p>${tr('Versión {v}. Prototipo: las cifras cambiarán.', { v: PW.AJ.version })}</p>${P.boton('borrar', '', tr('Borrar la partida'), true, 'peligro')}</div>`;
  }
  return { despido, recuerdos, meritos, plan, equipo, retos, opciones, avisos };
})();
