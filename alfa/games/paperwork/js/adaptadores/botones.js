// Fans Of Paperwork · adaptador · BOTONES: lo que hace cada data-acc de los paneles. Cada uno llama a su caso de uso (PW.casos) y cuenta el
// resultado con un sonido y, si falla, con un aviso que dice por qué (los errores con nombre del dominio). Las reglas no viven aquí.
'use strict';
PW.botones = (() => {
  const ERRORES = {
    'sin-saldo': 'No te llega', 'al-maximo': 'Ya está al máximo', 'no-disponible': 'Aún no has llegado ahí', auditoria: 'Antes, acaba la auditoría', 'sin-entrada': 'Aún no has encontrado la entrada',
    'falta-requisito': 'Antes necesitas el nodo anterior', cargando: 'El castor aún está cogiendo carrerilla', esperando: 'La Trituradora aún no está lista',
    atascando: 'Ya la estás atascando', acabada: 'La Trituradora ya está atascada del todo', 'sin-indemnizacion': 'Aún no cobrarías nada',
    'sin-cofres': 'No tienes cofres', 'no-tienes': 'No tienes ese objeto', 'sin-paquetes': 'Aún no ha llegado el paquete del sindicato',
    'sin-correo': 'Se ha ido el correo', 'sin-urgentes': 'Ahora no hay nada urgente', 'sin-archivador': 'Ese archivador ya está vacío',
    'sin-oferta': 'Ya has elegido tu carta', desconocido: 'Eso no está aquí', 'no-alcanza': 'El dron solo llega a la fila de arriba',
  };
  // cuenta el resultado de una orden: sonido si sale bien, aviso si no; y pasa sus sucesos a los efectos
  function cuenta(res, sonidoBien = 'select') {
    if (res.sucesos) PW.efectos.sucesos(res.sucesos, PW.ui.t);
    if (res.ok) { PW.sonido.toca(sonidoBien); return true; }
    PW.sonido.toca('deny');
    toast(tr(ERRORES[res.error] || 'No se puede'));
    return false;
  }
  function despedir() {
    const cobra = PW.despido.cobraria(PW.casos.partida, PW.casos.bonos());
    confirmBox(tr('¿DESPEDIROS?'), tr('Vuelves a la planta 1 y cobras {n} de Indemnización.', { n: PW.txt.num(cobra) }), tr('SÍ, A LA CALLE'), () => {
      if (cuenta(PW.casos.despide(), 'despido')) PW.ui.pestana = 'recuerdos';
    });
  }
  function borrar() {
    confirmBox(tr('¿BORRAR LA PARTIDA?'), tr('Se pierde todo, también la carrera. No hay vuelta atrás.'), tr('BORRAR'), () => { PW.casos.borra(); toast(tr('Partida nueva')); });
  }
  function abreCofre() {
    const res = PW.casos.abreCofre();
    if (cuenta(res, 'pop')) toast(tr('¡{o}!', { o: tr(PW.OBJETOS.find(o => o.id === res.valor).nombre) }), true);
  }
  function sindicato() {
    const res = PW.casos.recogeSindicato();
    if (!cuenta(res, 'pop')) return;
    const v = res.valor, num = PW.txt.num;
    // con un solo paquete se nombra su mérito; con varios, solo las rarezas buenas (el detalle está en la pestaña Méritos)
    const solo = v.paquetes === 1 ? ' · ' + tr('Mérito: {m}', { m: tr(PW.MERITOS.find(x => x.id === Object.keys(v.meritos)[0]).nombre) }) : '';
    const raros = PW.RAREZAS.slice(1).filter(r => v.rarezas[r.id]).map(r => tr(r.nombre) + ' ×' + v.rarezas[r.id]).join(', ');
    const cuantos = v.paquetes > 1 ? tr('{p} paquetes', { p: num(v.paquetes) }) : tr('Un paquete');
    toast(cuantos + ': ' + tr('+{g} grapas de oro · {o} de oro', { g: num(v.grapas), o: num(v.oro) })
      + (v.cofres ? ' · ' + tr('{c} cofres', { c: num(v.cofres) }) : '') + solo + (raros ? ' · ' + raros : ''), true);
  }
  // una mejora de pago (ADR 125): cobra core (MONEDAS.compraReal); al llegar, la cuenta la apunta y el juego la aplica sola
  function pago(id) {
    const x = PW.MEJORAS_PAGO.find(m => m.id === id);
    if (!x) return;
    const html = `<p>${tr(x.txt, PW.panelesPago.cifras())}</p><p><b>${PW.panelesPago.euros(PW.AJ.mejoras[id].eur)}</b></p>`;
    PW.mejorasPago.compra(id, tr(x.nombre), html, r => { if (r && (r.prueba || r.real)) { PW.sonido.toca('pop'); toast(tr('¡{n} ya es tuya!', { n: tr(x.nombre) }), true); } });
  }
  function urgente() {
    const res = PW.casos.entregaUrgente();
    if (cuenta(res, 'pop')) toast(tr('Entregado a tiempo: {n} de oro', { n: PW.txt.num(res.valor.oro) }), true);
  }
  // marcar o desmarcar una munición de la Trituradora: los caducados o los expedientes de un documento
  function municion(arg) {
    const M = PW.casos.partida.c.municion, cual = arg === 'caducados' ? arg : +arg;
    cuenta(PW.casos.fijaMunicion(cual, !(cual === 'caducados' ? M.caducados : M.docs[cual])));
  }
  function carta(id) {
    if (cuenta(PW.casos.eligeCarta(id), 'card')) toast(tr('¡{o}!', { o: tr(PW.CARTAS.find(c => c.id === id).nombre) }), true);
  }
  const ACCIONES = {
    carta,
    fotocopia: arg => cuenta(PW.casos.fijaFotocopia(+arg)),
    pestana: arg => { PW.ui.pestana = arg; PW.ui.elegido = 0; },
    estanteria: () => cuenta(PW.casos.estanteria(), 'boom'),
    // atascar pasa por la cortinilla (si se puede intentar); el intento empieza con su botón
    atascar: () => { if (PW.trituradora.lista(PW.casos.partida)) { PW.ui.cortinilla = true; PW.sonido.toca('select'); } else cuenta(PW.casos.atasca()); },
    'atascar-ya': () => { PW.ui.cortinilla = false; cuenta(PW.casos.atasca(), 'boom'); },
    'cortinilla-no': () => { PW.ui.cortinilla = false; },
    planta: arg => cuenta(PW.casos.irA(+arg), 'blip'),
    auto: () => cuenta(PW.casos.cambiaAuto()),
    urgente,
    municion,
    herramienta: arg => cuenta(PW.casos.compraHerramienta(+arg), 'pop'),
    sindicato,
    cofre: abreCofre,
    usar: arg => cuenta(PW.casos.usaObjeto(arg)),
    util: arg => cuenta(PW.casos.compraUtil(arg), 'pop'),
    documento: arg => cuenta(PW.casos.compraDocumento(+arg), 'pop'),
    venta: arg => cuenta(PW.casos.fijaVenta(+arg)),
    recuerdo: arg => cuenta(PW.casos.compraRecuerdo(arg), 'pop'),
    carrera: arg => cuenta(PW.casos.compraCarrera(arg), 'pop'),
    punto: () => cuenta(PW.casos.compraPunto(), 'pop'),
    tienda: arg => cuenta(PW.casos.compraTienda(arg), 'pop'),
    pago,
    autodespido: arg => cuenta(PW.casos.fijaAutoDespido(+arg)),
    despedir,
    cobrar: arg => { const [p, id] = arg.split(':'); if (PW.retos.cobrar(p, id)) PW.sonido.toca('pop'); },
    sonido: () => PW.sonido.alterna(),
    borrar,
  };
  // un solo oyente para toda la capa de botones. El panel se rehace cuatro veces por segundo, así que el botón que se pulsa puede no ser
  // el mismo nodo al soltar: se apunta su orden al apoyar el dedo y se lanza al soltarlo cerca. El clic de teclado (detail 0) va directo.
  function lanza(b) {
    if (!b || b.disabled || !ACCIONES[b.dataset.acc]) return;
    ACCIONES[b.dataset.acc](b.dataset.arg);
    PW.ui.sucio = true;
  }
  function engancha(raiz) {
    let apoyo = null;
    raiz.addEventListener('pointerdown', ev => {
      const b = ev.target.closest('[data-acc]');
      apoyo = b && !b.disabled ? { b: { disabled: false, dataset: { ...b.dataset } }, x: ev.clientX, y: ev.clientY } : null;
    });
    raiz.addEventListener('pointerup', ev => {
      if (apoyo && Math.hypot(ev.clientX - apoyo.x, ev.clientY - apoyo.y) < 14) lanza(apoyo.b);
      apoyo = null;
    });
    raiz.addEventListener('pointercancel', () => { apoyo = null; });
    raiz.addEventListener('click', ev => { if (ev.detail === 0) lanza(ev.target.closest('[data-acc]')); });
  }
  return { engancha, cuenta };
})();
