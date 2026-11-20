// Fans of Pinball · dominio · CAOS: la barra (100; ×1,5 en la planta 1; Café doble la llena antes; tras cada CAOS de una sala la
// siguiente pide un 20 % más) y el modo CAOS: el equipo entero sale de bola a la vez (y un clon con Cuarta bola), puntos y fichas ×2 y
// perder bolas no quita tiempo. Al acabar se queda la criatura activa o, si cayó, la bola más cerca de unas palas.
'use strict';
PB.caos = (() => {
  // la barra al empezar una sala: lo que pide vuelve a 100 (lo llenado se queda: no baja sola)
  function nuevaSala(s) { s.caos.veces = 0; s.caos.umbral = s.r.caos.barra; }
  function llena(s, cantidad) {
    const c = s.caos;
    if (c.activo || cantidad <= 0) return;
    c.barra += cantidad * (s.planta === 1 ? s.r.caos.primeraPlanta : 1) * s.cif.caos;
    if (c.barra >= c.umbral) empieza(s);
  }
  // las criaturas del equipo que no están ya de bola, más el clon de la activa con Cuarta bola
  function invitadas(s) {
    const enMesa = new Set(s.bolas.map(b => b.criatura));
    const lista = s.equipo.filter(c => !enMesa.has(c));
    if (s.cif.cuartaBola) lista.push(s.equipo[s.activa]);
    return lista;
  }
  // sale una bola nueva junto a la que ya está, con la velocidad girada (si la de la mesa está de viaje, viaja con ella)
  function saleJunto(s, origen, criatura, i) {
    const b = PB.bolas.crea(s, criatura);
    b.clon = s.bolas.some(x => x.criatura === criatura);
    const giro = (i % 2 ? 1 : -1) * (0.5 + 0.25 * i), c = Math.cos(giro), sn = Math.sin(giro);
    Object.assign(b, { x: origen.x, y: origen.y, vx: origen.vx * c - origen.vy * sn, vy: origen.vx * sn + origen.vy * c });
    if (origen.estado === 'viaje') b.estado = 'viaje', b.viaje = { ...origen.viaje };
    s.bolas.push(b);
  }
  function empieza(s) {
    const c = s.caos, origen = s.bolas.find(b => b.vivo);
    c.activo = true; c.quedan = s.r.caos.segundos + s.cif.caosExtra; c.duracion = c.quedan;
    let i = 0;
    for (const criatura of invitadas(s)) {
      if (!origen || s.bolas.length >= s.r.fisica.topeBolas) break;
      saleJunto(s, origen, criatura, i++);
    }
    PB.emite(s, 'caos_empieza', { segundos: c.quedan, bolas: s.bolas.length });
  }
  function paso(s, dt) {
    if (!s.caos.activo) return;
    s.caos.quedan -= dt;
    if (s.caos.quedan <= 0) acaba(s);
  }
  // la bola que se queda: la de la criatura activa, o la más cerca de unas palas
  function laQueQueda(s) {
    const vivas = s.bolas.filter(b => b.vivo);
    const activa = vivas.find(b => b.criatura === s.equipo[s.activa] && !b.clon);
    if (activa || !vivas.length) return activa || null;
    const cerca = b => Math.min(...s.palas.map(p => Math.hypot(b.x - p.x, b.y - p.y)));
    return vivas.reduce((a, b) => (cerca(b) < cerca(a) ? b : a));
  }
  // acaba el CAOS; `callado` lo acaba sin evento ni bola que se quede (al entrar en la escalera)
  function acaba(s, callado = false) {
    const c = s.caos, queda = callado ? null : laQueQueda(s);
    c.activo = false; c.quedan = 0; c.barra = 0; c.veces += 1;
    c.umbral = s.r.caos.barra * Math.pow(1 + s.r.caos.subePorCaos, c.veces);
    if (callado) return;
    for (const b of s.bolas) if (b !== queda) b.vivo = false;
    if (queda) { queda.clon = false; s.activa = s.equipo.indexOf(queda.criatura); } else PB.bolas.lanza(s, s.equipo[s.activa]);
    PB.emite(s, 'caos_acaba', { criatura: s.equipo[s.activa] });
  }
  return { nuevaSala, llena, empieza, paso, acaba };
})();
