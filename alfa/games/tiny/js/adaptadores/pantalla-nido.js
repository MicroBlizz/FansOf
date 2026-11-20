// Tiny Fans · adaptador · PANTALLA «nido»: el nido en vivo, que es la pantalla principal. Arriba, el almacén y la meta; abajo, los
// botones grandes. En modo construir se elige una pieza y se pinta con el dedo sobre las casillas (arrastrar pone varias); la goma quita.
// Un intento que no vale dice por qué en un bocadillo, encima de la casilla.
'use strict';
(() => {
  let escena = null, piezas = null, arriba = null, paleta = null, construyendo = false, elegida = 'pared-carton', ultima = '', t = 0, becario = null, oyentes = [];
  const R = () => AJUSTES.nido, casos = () => TN.casosNido;
  const PORQUE = { 'sin-materiales': 'Te faltan materiales: sal a por más', 'camino-tapiado': '¡Tapas el camino al almacén!', 'tope-de-trampas': 'Ya tienes todas las trampas', 'casilla-ocupada': 'Ahí ya hay algo',
    'almacen-fijo': 'El almacén no se mueve', 'casilla-vacia': '', 'fuera-de-rejilla': '' };
  const centro = (col, fila) => TN.vista.aPantalla(col + .5, 1, fila + .5);
  // vuelve a poner en la escena las piezas del nido
  function pintaPiezas() {
    if (!escena) return;
    for (const m of piezas.values()) escena.remove(m);
    piezas.clear();
    const n = casos().nido, pon = (nombre, col, fila) => { const m = TN.modelos.pieza(nombre); m.position.set(col + .5, 0, fila + .5); escena.add(m); piezas.set(col + ',' + fila, m); };
    pon('almacen', R().almacen.col, R().almacen.fila);
    for (const p of n.piezas) pon(p.pieza, p.col, p.fila);
  }
  function pintaArriba() {
    const a = casos().nido.almacen, meta = TN.metas.actual();
    arriba.replaceChildren(
      TN.crea('div', { className: 'tn-almacen' }, ...Object.keys(TN.textos.materiales).map(m => TN.crea('span', {}, TN.iconos.nodo(m, 28), TN.crea('b', { textContent: a[m] || 0 })))),
      meta ? TN.crea('div', { className: 'tn-meta' }, TN.crea('span', { textContent: meta.texto }), TN.crea('b', { textContent: meta.tiene + '/' + meta.pide })) : TN.crea('div', { className: 'tn-meta', textContent: tr('¡Nido completo! Sal a por más.') }));
  }
  const cuesta = pieza => Object.entries(R().piezas[pieza].cuesta).map(([m, c]) => TN.crea('em', {}, TN.iconos.nodo(m, 18), String(c)));
  function pintaPaleta() {
    if (paleta) paleta.remove(); paleta = null;
    if (!construyendo) return;
    const boton = (id, hijos) => TN.crea('button', { type: 'button', className: 'tn-pieza' + (elegida === id ? ' tn-elegida' : ''), onclick: () => { elegida = id; TN.sonido.toca('boton'); pintaPaleta(); } }, ...hijos);
    paleta = TN.crea('div', { className: 'tn-paleta tn-toca' },
      ...Object.keys(R().piezas).map(id => boton(id, [TN.iconos.nodo(id, 40), TN.crea('span', { className: 'tn-coste' }, ...cuesta(id))])),
      boton('quitar', [TN.iconos.nodo('papelera', 40), TN.crea('span', { className: 'tn-coste', textContent: tr('Quitar') })]));
    TN.capa().append(paleta);
  }
  function barra() {
    const p = TN.sesion.partida;
    TN.hudBarra.monta(TN.capa(), { asaltoAbierto: p.asaltoAbierto, mochilaCaida: !!p.mochilaCaida(TN.reloj.ahora(), AJUSTES.mochila.caidaHoras * 3600000), construyendo }, id => {
      TN.sonido.toca('boton');
      if (id !== 'construir') return TN.pantallas.ve(id);
      construyendo = !construyendo; TN.vista.encuadre(construyendo ? 'construir' : 'nido'); barra(); pintaPaleta();
    });
  }
  // un dedo sobre una casilla en modo construir: pone la pieza elegida o quita la que haya
  function toca(e) {
    if (!construyendo || e.target.closest('button, .tn-ventana')) return;
    const caja = TN.capa().getBoundingClientRect(), s = TN.vista.deToque(e.clientX - caja.left, e.clientY - caja.top), col = Math.floor(s.x), fila = Math.floor(s.z), clave = col + ',' + fila;
    if (clave === ultima || col < 0 || fila < 0 || col >= R().columnas || fila >= R().filas) return;
    ultima = clave;
    const r = elegida === 'quitar' ? casos().quita(col, fila) : casos().coloca(elegida, col, fila);
    if (!r.ok && PORQUE[r.error]) TN.bocadillos.dice(tr(PORQUE[r.error]), centro(col, fila), 1.3, 'malo');
  }
  const alBajar = e => { ultima = ''; toca(e); }, alMover = e => { if (e.buttons || e.pointerType === 'touch') toca(e); };
  TN.pantallas.registra({
    id: 'nido',
    entra() {
      construyendo = false; t = 0; piezas = new Map();
      escena = TN.vista.escena();
      if (escena) {
        escena.add(TN.modelos.sueloNido(R().columnas, R().filas)); escena.add(TN.modelos.moqueta(90, -.62));
        TN.piezas3d.caja(escena, 0xff8a1f, .9, .06, .5, R().entrada.col + .5, .03, R().entrada.fila + 1.3);   // el felpudo de la entrada
        becario = TN.modelos.becario(); becario.scale.setScalar(.75); becario.position.set(R().entrada.col + .5, 0, R().entrada.fila + .5); becario.rotation.y = Math.PI; escena.add(becario);
        pintaPiezas();
      }
      arriba = TN.crea('header', { className: 'tn-nido-arriba' }); TN.capa().append(arriba);
      pintaArriba(); barra();
      oyentes = [TN.eventos.oye(['pieza-puesta', 'pieza-quitada', 'meta-cumplida'], () => { pintaPiezas(); pintaArriba(); }),
        TN.eventos.oye('meta-cumplida', () => TN.bocadillos.dice(tr('¡Meta cumplida!'), { x: TN.capa().clientWidth / 2, y: 240 }, 1.8, 'bueno'))];
      TN.capa().addEventListener('pointerdown', alBajar); TN.capa().addEventListener('pointermove', alMover);
      const vacio = !casos().nido.piezas.length && !Object.values(casos().nido.almacen).some(c => c > 0);
      if (vacio) setTimeout(() => { if (TN.pantallas.actual !== 'nido') return; TN.guia.olvida('nido-vacio'); TN.guia.dice('nido-vacio', 'Sal de expedición a por materiales para tu nido', 7); }, 50);
      TN.vista.encuadre('nido', 0, true); TN.vista.sigue(R().columnas / 2, R().filas / 2 + .6, true);
    },
    sale() {
      for (const f of oyentes) f(); oyentes = [];
      TN.capa().removeEventListener('pointerdown', alBajar); TN.capa().removeEventListener('pointermove', alMover);
      TN.hudBarra.desmonta(); TN.bocadillos.limpia(); if (arriba) arriba.remove(); if (paleta) paleta.remove();
      escena = piezas = arriba = paleta = becario = null;
    },
    paso() {},
    pinta(alfa, dt) {
      if (!escena) return;
      t += dt; becario.userData.anima(t, {});
      for (const m of piezas.values()) if (m.userData.anima) m.userData.anima(t);
      TN.vista.pinta(escena, dt);
    },
    estado: () => ({ construyendo, elegida, piezas: casos().nido.piezas, almacen: casos().nido.almacen, meta: TN.metas.actual() }),
  });
})();
