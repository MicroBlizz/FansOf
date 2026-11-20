// Fans of Pinball · adaptador · PANTALLA DE MENÚ: el botón grande JUGAR (la historia; el sin fin cuando está abierto, con la historia de
// segundo botón), tu criatura líder de cara y centrada, las fichas, el récord, la racha de días, el letrero de la primera partida del
// día, las 3 misiones del día y EQUIPO. La primera vez que se abre el juego solo hay título y JUGAR (PROTOTIPO.md, «El primer minuto»).
// Al volver otro día, la ventana de la racha con su premio.
'use strict';
(() => {
  let caja = null;
  const app = () => PB.app;
  const ficha = (clase, ...hijos) => PB.crea('div', { className: 'pb-chapa ' + clase }, ...hijos);
  function cabecera(D) {
    const lider = D.equipo[0], arte = AJUSTES.arte.criaturas[lider];
    return PB.crea('div', { className: 'pb-menu-arriba' },
      ficha('pb-chapa-fichas', PB.imagen(AJUSTES.arte.imagenes.moneda, 2, 'pb-icono'), PB.crea('b', { textContent: PB.miles(D.fichas) })),
      ficha('pb-chapa-racha', PB.crea('b', { textContent: D.racha.dias > 1 ? tr('Racha: {n} días').replace('{n}', D.racha.dias) : tr('Racha: 1 día') })),
      PB.crea('div', { className: 'pb-carta pb-lider' }, PB.imagen(AJUSTES.arte.imagenes[arte.carta], 2), PB.crea('b', { textContent: AJUSTES.criaturas.lista[lider].nombre })));
  }
  function misiones() {
    const filas = app().diario.misiones().map(m => PB.crea('li', { className: m.cobrada ? 'pb-hecha' : '' },
      PB.crea('span', { textContent: tr(m.txt) }), PB.crea('i', { style: 'width:' + Math.round(m.prog / m.goal * 100) + '%' }),
      PB.crea('b', { textContent: m.cobrada ? tr('HECHA') : m.prog + '/' + m.goal + ' · +' + m.r })));
    return PB.crea('section', { className: 'pb-misiones' }, PB.crea('h3', { textContent: tr('MISIONES DEL DÍA') }), PB.crea('ul', {}, ...filas));
  }
  const ve = (id, datos) => () => { app().sonido.despierta(); app().sonido.toca('boton'); PB.pantallas.ve(id, datos); };
  function botones(D) {
    const sinfin = D.sinfinAbierto;
    const jugar = PB.crea('button', { type: 'button', className: 'pb-boton pb-naranja pb-jugar', textContent: tr('JUGAR'), onclick: ve('partida', { modo: sinfin ? 'sinfin' : 'historia' }) });
    const fila = PB.crea('div', { className: 'pb-fila' }, PB.crea('button', { type: 'button', className: 'pb-boton pb-azul', textContent: tr('EQUIPO'), onclick: ve('equipo') }));
    if (sinfin) fila.prepend(PB.crea('button', { type: 'button', className: 'pb-boton pb-verde', textContent: tr('HISTORIA'), onclick: ve('partida', { modo: 'historia' }) }));
    return [jugar, fila];
  }
  function datosDeVolver(D) {
    const l = [];
    if (app().diario.esPrimeraDelDia) l.push(PB.crea('p', { className: 'pb-doble', textContent: tr('Primera partida del día: fichas ×2') }));
    if (D.sinfinAbierto) l.push(PB.crea('p', { className: 'pb-record', textContent: tr('Récord: planta {p} · {n} puntos').replace('{p}', D.record.planta).replace('{n}', PB.miles(D.record.puntos)) }));
    else l.push(PB.crea('p', { className: 'pb-record', textContent: tr('Historia: capítulo Oficinas') + (D.historia.mejorPlanta ? ' · ' + tr('mejor planta {n}').replace('{n}', D.historia.mejorPlanta) : '') }));
    return l;
  }
  function racha() {
    const d = app().diario;
    if (!d.rachaDisponible || app().sesion.datos.partidas === 0) return;
    const r = d.racha();
    PB.ventanas.abre({
      clase: 'pb-hoja-racha', titulo: tr('RACHA: DÍA {n}').replace('{n}', r.dias),
      cuerpo: [PB.imagen(AJUSTES.arte.imagenes.cofre, 3), PB.crea('p', { className: 'pb-ganadas', textContent: '+' + r.premio + ' ' + tr('fichas') })],
      botones: [{ texto: tr('COBRAR'), clase: 'pb-naranja pb-grande', alPulsar: () => { d.cobraRacha(); pinta(); } }],
    });
  }
  function pinta() {
    if (caja) caja.remove();
    const D = app().sesion.datos, primera = D.partidas === 0;
    const titulo = PB.crea('h1', { className: 'pb-logo', textContent: 'FANS OF PINBALL' });
    caja = primera
      ? PB.crea('section', { className: 'pb-menu pb-menu-primera' }, titulo, ...botones(D).slice(0, 1))
      : PB.crea('section', { className: 'pb-menu' }, cabecera(D), titulo, ...datosDeVolver(D), ...botones(D), misiones());
    PB.capa().append(caja);
  }
  PB.pantallas.registra({
    id: 'menu',
    entra() { pinta(); racha(); if (typeof REPORTE !== 'undefined') REPORTE.activar({}); },
    sale() { if (caja) caja.remove(); caja = null; },
    paso() {},
    pinta() {},
  });
})();
