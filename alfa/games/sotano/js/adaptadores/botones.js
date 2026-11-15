// Fans Of Sótano · adaptador · BOTONES: lo que hace cada data-acc de los paneles. Cada uno llama a su caso de uso (SO.casos) y cuenta el
// resultado con un sonido y, si falla, con un aviso que dice por qué (los errores con nombre del dominio). Las reglas no viven aquí.
'use strict';
SO.botones = (() => {
  const ERRORES = {
    'sin-saldo': 'No te llega', 'al-maximo': 'Ya está al máximo', 'no-disponible': 'Aún no has llegado a ese material',
    'falta-requisito': 'Antes necesitas el nodo anterior', cargando: 'La dinamita aún se está cargando', esperando: 'La Trituradora aún no está lista',
    atacando: 'Ya estás atacando', acabada: 'La Trituradora ya está destrozada', 'nivel-bajo': 'Aún no te pueden despedir',
    'sin-cofres': 'No tienes cofres', 'no-tienes': 'No tienes ese objeto', 'sin-paquetes': 'Aún no ha llegado el paquete del sindicato',
    'sin-correo': 'Se ha ido el correo',
  };
  // cuenta el resultado de una orden: sonido si sale bien, aviso si no; y pasa sus sucesos a los efectos
  function cuenta(res, sonidoBien = 'select') {
    if (res.sucesos) SO.efectos.sucesos(res.sucesos, SO.ui.t);
    if (res.ok) { SO.sonido.toca(sonidoBien); return true; }
    SO.sonido.toca('deny');
    toast(tr(ERRORES[res.error] || 'No se puede'));
    return false;
  }
  function despedir() {
    const cobra = SO.despido.cobraria(SO.casos.partida, SO.casos.bonos());
    confirmBox(tr('¿DESPEDIROS?'), tr('Vuelves a la planta 1 y cobras {n} de Indemnización.', { n: SO.txt.num(cobra) }), tr('SÍ, A LA CALLE'), () => {
      if (cuenta(SO.casos.despide(), 'despido')) SO.ui.pestana = 'carrera';
    });
  }
  function borrar() {
    confirmBox(tr('¿BORRAR LA PARTIDA?'), tr('Se pierde todo, también la carrera. No hay vuelta atrás.'), tr('BORRAR'), () => { SO.casos.borra(); toast(tr('Partida nueva')); });
  }
  function abreCofre() {
    const res = SO.casos.abreCofre();
    if (cuenta(res, 'pop')) toast(tr('¡{o}!', { o: tr(SO.OBJETOS.find(o => o.id === res.valor).nombre) }), true);
  }
  function sindicato() {
    const res = SO.casos.abreSindicato();
    if (cuenta(res, 'pop')) toast(tr('Paquete del sindicato: {n} de oro y un cofre', { n: SO.txt.num(res.valor.oro) }), true);
  }
  const ACCIONES = {
    pestana: arg => { SO.ui.pestana = arg; },
    dinamita: () => cuenta(SO.casos.dinamita(), 'boom'),
    atacar: () => cuenta(SO.casos.ataca(), 'boom'),
    sindicato,
    cofre: abreCofre,
    usar: arg => cuenta(SO.casos.usaObjeto(arg)),
    pico: arg => cuenta(SO.casos.compraPico(arg), 'pop'),
    material: arg => cuenta(SO.casos.compraMaterial(+arg), 'pop'),
    venta: arg => cuenta(SO.casos.fijaVenta(+arg)),
    recuerdo: arg => cuenta(SO.casos.compraRecuerdo(arg), 'pop'),
    carrera: arg => cuenta(SO.casos.compraCarrera(arg), 'pop'),
    autodespido: arg => cuenta(SO.casos.fijaAutoDespido(+arg)),
    despedir,
    cobrar: arg => { const [p, id] = arg.split(':'); if (SO.retos.cobrar(p, id)) SO.sonido.toca('pop'); },
    sonido: () => SO.sonido.alterna(),
    borrar,
    // las ayudas de pruebas (solo salen en desarrollo y en la alfa): velocidad del tiempo, una hora fuera y oro
    'dev-velocidad': arg => { SO.ui.velocidad = +arg; },
    'dev-fuera': () => { SO.casos.tick(3600); toast('+1 h'); },
    'dev-oro': () => { SO.casos.partida.r.oro += 1e3 + SO.casos.partida.r.oro; },
  };
  // un solo oyente para toda la capa de botones. El panel se rehace cuatro veces por segundo, así que el botón que se pulsa puede no ser
  // el mismo nodo al soltar: se apunta su orden al apoyar el dedo y se lanza al soltarlo cerca. El clic de teclado (detail 0) va directo.
  function lanza(b) {
    if (!b || b.disabled || !ACCIONES[b.dataset.acc]) return;
    ACCIONES[b.dataset.acc](b.dataset.arg);
    SO.ui.sucio = true;
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
