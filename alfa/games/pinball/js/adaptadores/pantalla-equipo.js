// Fans of Pinball · adaptador · PANTALLA DE EQUIPO: una carta por criatura (de cara y centrada, con su nivel y su poder), SUBIR con fichas
// (verde; si no llegan, dice cuántas faltan) y LÍDER (la primera bola). JunkCoon sale en silueta hasta vencer al jefe (casi-desbloqueo).
'use strict';
(() => {
  let caja = null;
  const app = () => PB.app;
  function botonSubir(id, D) {
    const precio = PB.progreso.coste(AJUSTES, D.niveles[id]);
    if (precio === null) return PB.crea('span', { className: 'pb-maximo', textContent: tr('NIVEL MÁXIMO') });
    const llega = D.fichas >= precio;
    return PB.crea('button', { type: 'button', className: 'pb-boton ' + (llega ? 'pb-verde' : 'pb-amarillo'),
      textContent: llega ? tr('SUBIR') + ' · ' + PB.miles(precio) : tr('Faltan {n}').replace('{n}', PB.miles(precio - D.fichas)),
      onclick: () => {
        const r = app().casos.subeNivel(id);
        app().sonido.toca(r.ok ? 'mejora' : 'boton');
        pinta();
      } });
  }
  function carta(id, D) {
    const c = AJUSTES.criaturas.lista[id], tiene = D.desbloqueadas.includes(id), lider = D.equipo[0] === id;
    const img = PB.imagen(AJUSTES.arte.imagenes[AJUSTES.arte.criaturas[id].carta], 2, tiene ? '' : 'pb-silueta');
    const pie = tiene
      ? [PB.crea('em', { textContent: tr('Nivel {n}').replace('{n}', D.niveles[id]) }), PB.crea('small', { textContent: tr(c.texto) }), botonSubir(id, D),
        lider ? PB.crea('span', { className: 'pb-es-lider', textContent: tr('LÍDER') }) : PB.crea('button', { type: 'button', className: 'pb-boton pb-azul', textContent: tr('PONER DE LÍDER'),
          onclick: () => { app().casos.ponLider(id); pinta(); } })]
      : [PB.crea('small', { textContent: tr('Vence a SurvivalBot para desbloquearla') })];
    return PB.crea('article', { className: 'pb-carta' + (lider ? ' pb-lider' : '') }, img, PB.crea('b', { textContent: tiene ? c.nombre : '???' }), ...pie);
  }
  function pinta() {
    if (caja) caja.remove();
    const D = app().sesion.datos;
    caja = PB.crea('section', { className: 'pb-menu pb-equipo' },
      PB.crea('div', { className: 'pb-menu-arriba' }, PB.crea('div', { className: 'pb-chapa pb-chapa-fichas' }, PB.imagen(AJUSTES.arte.imagenes.moneda, 2, 'pb-icono'), PB.crea('b', { textContent: PB.miles(D.fichas) }))),
      PB.crea('h2', { className: 'pb-titulo', textContent: tr('EQUIPO') }),
      PB.crea('div', { className: 'pb-cartas' }, ...Object.keys(AJUSTES.criaturas.lista).map(id => carta(id, D))),
      PB.crea('button', { type: 'button', className: 'pb-boton pb-azul', textContent: tr('VOLVER'), onclick: () => PB.pantallas.ve('menu') }));
    PB.capa().append(caja);
  }
  PB.pantallas.registra({ id: 'equipo', entra: pinta, sale() { if (caja) caja.remove(); caja = null; }, paso() {}, pinta() {} });
})();
