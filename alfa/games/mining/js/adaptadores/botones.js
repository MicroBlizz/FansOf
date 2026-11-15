// Fans Of Mining · adaptador · BOTONES: lo que hace cada data-acc de los paneles. Cada uno llama a su caso de uso (MN.casos) y cuenta el
// resultado con un sonido y, si falla, con un aviso que dice por qué (los errores con nombre del dominio). Las reglas no viven aquí.
'use strict';
MN.botones = (() => {
  const ERRORES = {
    'sin-saldo': 'No te llega', 'al-maximo': 'Ya está al máximo', 'no-disponible': 'Aún no has llegado a ese material',
    'falta-requisito': 'Antes necesitas el nodo anterior', cargando: 'La dinamita aún se está cargando', esperando: 'La Trituradora aún no está lista',
    atacando: 'Ya estás atacando', acabada: 'La Trituradora ya está destrozada', 'nivel-bajo': 'Aún no te pueden despedir',
    'sin-cofres': 'No tienes cofres', 'no-tienes': 'No tienes ese objeto', 'sin-paquetes': 'Aún no ha llegado el paquete del sindicato',
    'sin-correo': 'Se ha ido el correo',
  };
  // cuenta el resultado de una orden: sonido si sale bien, aviso si no; y pasa sus sucesos a los efectos
  function cuenta(res, sonidoBien = 'select') {
    if (res.sucesos) MN.efectos.sucesos(res.sucesos, MN.ui.t);
    if (res.ok) { MN.sonido.toca(sonidoBien); return true; }
    MN.sonido.toca('deny');
    toast(tr(ERRORES[res.error] || 'No se puede'));
    return false;
  }
  function despedir() {
    const cobra = MN.despido.cobraria(MN.casos.partida, MN.casos.bonos());
    confirmBox(tr('¿DESPEDIROS?'), tr('Vuelves a la planta 1 y cobras {n} de Indemnización.', { n: MN.txt.num(cobra) }), tr('SÍ, A LA CALLE'), () => {
      if (cuenta(MN.casos.despide(), 'despido')) MN.ui.pestana = 'carrera';
    });
  }
  function borrar() {
    confirmBox(tr('¿BORRAR LA PARTIDA?'), tr('Se pierde todo, también la carrera. No hay vuelta atrás.'), tr('BORRAR'), () => { MN.casos.borra(); toast(tr('Partida nueva')); });
  }
  function abreCofre() {
    const res = MN.casos.abreCofre();
    if (cuenta(res, 'pop')) toast(tr('¡{o}!', { o: tr(MN.OBJETOS.find(o => o.id === res.valor).nombre) }), true);
  }
  function sindicato() {
    const res = MN.casos.abreSindicato();
    if (cuenta(res, 'pop')) toast(tr('Paquete del sindicato: {n} de oro y un cofre', { n: MN.txt.num(res.valor.oro) }), true);
  }
  const ACCIONES = {
    pestana: arg => { MN.ui.pestana = arg; },
    dinamita: () => cuenta(MN.casos.dinamita(), 'boom'),
    atacar: () => cuenta(MN.casos.ataca(), 'boom'),
    sindicato,
    cofre: abreCofre,
    usar: arg => cuenta(MN.casos.usaObjeto(arg)),
    pico: arg => cuenta(MN.casos.compraPico(arg), 'pop'),
    material: arg => cuenta(MN.casos.compraMaterial(+arg), 'pop'),
    venta: arg => cuenta(MN.casos.fijaVenta(+arg)),
    recuerdo: arg => cuenta(MN.casos.compraRecuerdo(arg), 'pop'),
    carrera: arg => cuenta(MN.casos.compraCarrera(arg), 'pop'),
    autodespido: arg => cuenta(MN.casos.fijaAutoDespido(+arg)),
    despedir,
    cobrar: arg => { const [p, id] = arg.split(':'); if (MN.retos.cobrar(p, id)) MN.sonido.toca('pop'); },
    sonido: () => MN.sonido.alterna(),
    borrar,
    // las ayudas de pruebas (solo salen en desarrollo y en la alfa): velocidad del tiempo, una hora fuera y oro
    'dev-velocidad': arg => { MN.ui.velocidad = +arg; },
    'dev-fuera': () => { MN.casos.tick(3600); toast('+1 h'); },
    'dev-oro': () => { MN.casos.partida.r.oro += 1e3 + MN.casos.partida.r.oro; },
  };
  // un solo oyente para toda la capa de botones. El panel se rehace cuatro veces por segundo, así que el botón que se pulsa puede no ser
  // el mismo nodo al soltar: se apunta su orden al apoyar el dedo y se lanza al soltarlo cerca. El clic de teclado (detail 0) va directo.
  function lanza(b) {
    if (!b || b.disabled || !ACCIONES[b.dataset.acc]) return;
    ACCIONES[b.dataset.acc](b.dataset.arg);
    MN.ui.sucio = true;
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
