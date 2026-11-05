// Fans of Basement · Enemigos (dominio): los bichos de la oficina. Bugs que corretean y te persiguen si te acercas, correos
// «RE: RE: URGENTE» que te siguen y al romperse se parten en dos, reuniones grandes y lentas que, si te tocan, te frenan, y los
// raros del catálogo (el dorado que huye, el spam de Soporte y el bug crítico de QA). Salen por tramos (ninguno nuevo mientras hay
// un jefe), con la vida de su zona (campana.js), se borran al quedar muy arriba y sueltan botín al caer (las reuniones, a veces,
// un paquete de mensajería). Al caer, los trucos de la zona pueden reabrir un ticket o duplicar un bug.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const E = B.enemigos = {};

  E.crear = function (e, tipo, x, y) {
    const AJ = e.aj, d = AJ.enemigos[tipo], planta = B.plantaDe(AJ, y);
    const vida = Math.round(d.vida * B.difDe(AJ, planta, e.rango).vida);
    const en = { id: e.ids++, tipo, x, y, vida, vidaMax: vida, radio: d.radio, fase: (x * 7 + y) % 6.28, dir: x < AJ.ancho / 2 ? 1 : -1, golpeT: 0 };
    e.enemigos.push(en);
    return en;
  };

  // Elige qué sale en esta planta según los pesos de los enemigos ya abiertos.
  function eligeTipo(AJ, planta, r) {
    const tipos = Object.keys(AJ.enemigos).filter((t) => AJ.enemigos[t].desde <= planta && AJ.enemigos[t].peso > 0);
    const total = tipos.reduce((s, t) => s + AJ.enemigos[t].peso, 0);
    let x = r * total;
    for (const t of tipos) { x -= AJ.enemigos[t].peso; if (x <= 0) return t; }
    return tipos[tipos.length - 1];
  }

  // Un raro, a veces: los que pueden salir en esta planta (y en su zona, si solo salen en una).
  function eligeRaro(e, planta, rnd) {
    const AJ = e.aj, zona = B.zonaDe(AJ, planta).id;
    for (const t of Object.keys(AJ.enemigos)) {
      const d = AJ.enemigos[t];
      if (d.raro && d.desde <= planta && (!d.solo || d.solo === zona || zona === 'legacy') && rnd() < d.raro) return t;
    }
    return null;
  }

  E.raroDe = eligeRaro;
  E.densidad = (AJ, planta) => Math.min(AJ.generar.max, AJ.generar.base + AJ.generar.porPlanta * planta);

  // Va llenando el pozo por debajo del jugador, tramo a tramo.
  function generar(e, rnd) {
    const AJ = e.aj, G = AJ.generar;
    while (e.generadoHasta < e.jugador.y + G.delante) {
      const y = e.generadoHasta, planta = B.plantaDe(AJ, y);
      if (y % AJ.altoPlanta < G.tramo) { B.becarios.alGenerar(e, planta, rnd); B.campana.alGenerar(e, planta, rnd); B.muebles.alGenerar(e, planta, rnd); }   // planta nueva
      if (!e.jefe && e.enemigos.length < G.maxActivos) tramo(e, planta, y, rnd);
      e.generadoHasta += G.tramo;
    }
  }
  function tramo(e, planta, y, rnd) {
    const AJ = e.aj, x = () => AJ.pared + 20 + rnd() * (AJ.ancho - 2 * AJ.pared - 40);
    const raro = eligeRaro(e, planta, rnd);
    if (raro) { E.crear(e, raro, x(), y + rnd() * AJ.generar.tramo); return; }
    if (rnd() < E.densidad(AJ, planta)) E.crear(e, eligeTipo(AJ, planta, rnd()), x(), y + rnd() * AJ.generar.tramo);
  }

  const MOVER = {
    bug(e, en, d, dt, cerca, v) {
      if (cerca) return hacia(e, en, d.vel * 1.3 * v, dt);
      en.x += en.dir * d.vel * v * dt; en.y += Math.sin(e.t * 3 + en.fase) * 12 * dt;
    },
    correo(e, en, d, dt, cerca, v) { if (cerca) hacia(e, en, d.vel * v, dt); else en.y += Math.sin(e.t * 2 + en.fase) * 10 * dt; },
    reunion(e, en, d, dt, cerca, v) { en.x += en.dir * d.vel * v * dt; en.y += Math.sin(e.t + en.fase) * 6 * dt; },
    // el dorado huye de ti si te acercas
    dorado(e, en, d, dt, cerca, v) {
      const dx = en.x - e.jugador.x, dy = en.y - e.jugador.y, m = Math.hypot(dx, dy) || 1;
      if (m < d.huye) { en.x += dx / m * d.vel * v * dt; en.y += dy / m * d.vel * 0.6 * v * dt; } else en.x += en.dir * 30 * dt;
    },
  };
  MOVER.miniCorreo = MOVER.correo;
  MOVER.spam = MOVER.correo;
  MOVER.critico = MOVER.bug;

  function hacia(e, en, vel, dt) {
    const dx = e.jugador.x - en.x, dy = e.jugador.y - en.y, m = Math.hypot(dx, dy) || 1;
    en.x += dx / m * vel * dt; en.y += dy / m * vel * dt;
    if (Math.abs(dx) > 1) en.dir = dx > 0 ? 1 : -1;
  }

  // Rebota en las paredes del pozo.
  function paredes(AJ, en) {
    const min = AJ.pared + en.radio, max = AJ.ancho - AJ.pared - en.radio;
    if (en.x < min) { en.x = min; en.dir = 1; }
    if (en.x > max) { en.x = max; en.dir = -1; }
  }

  function tocar(e, en, d) {
    const j = e.jugador, r = en.radio + e.aj.jugador.radio;
    if (!d.golpe || (j.x - en.x) ** 2 + (j.y - en.y) ** 2 > r * r) return;
    if (d.frena) { if (j.frenoT <= 0) e.eventos.push({ tipo: 'frenado', x: j.x, y: j.y }); j.frenoT = d.frenaT; }
    B.herirJugador(e, d.golpe * B.difDe(e.aj, e.planta, 0).golpe, en.tipo);
  }

  E.paso = function (e, dt, rnd) {
    generar(e, rnd);
    const AJ = e.aj, j = e.jugador, v = B.campana.velBichos(e);
    for (let i = e.enemigos.length - 1; i >= 0; i--) {
      const en = e.enemigos[i], d = AJ.enemigos[en.tipo];
      if (en.y < j.y - AJ.generar.detras) { e.enemigos.splice(i, 1); continue; }
      const cerca = d.persigue > 0 && (j.x - en.x) ** 2 + (j.y - en.y) ** 2 < d.persigue * d.persigue;
      en.lentoT = Math.max(0, (en.lentoT || 0) - dt);
      MOVER[en.tipo](e, en, d, dt, cerca, en.lentoT > 0 ? v * en.lento : v);
      paredes(AJ, en);
      en.golpeT = Math.max(0, en.golpeT - dt);
      tocar(e, en, d);
    }
  };

  // Un disparo le da: si se queda sin vida cae, suelta su botín (y a veces una taza de café) y, si es un correo, se parte en dos.
  E.herir = function (e, en, dano, rnd) {
    en.vida -= dano; en.golpeT = 0.12;
    e.eventos.push({ tipo: 'impacto', x: en.x, y: en.y, dano });
    if (en.vida > 0) return false;
    const i = e.enemigos.indexOf(en);
    if (i >= 0) e.enemigos.splice(i, 1);
    morir(e, en, rnd);
    return true;
  };

  function morir(e, en, rnd) {
    const AJ = e.aj, d = AJ.enemigos[en.tipo];
    e.bajas++;
    e.bajasPorTipo[en.tipo] = (e.bajasPorTipo[en.tipo] || 0) + 1;
    e.eventos.push({ tipo: 'baja', x: en.x, y: en.y, enemigo: en.tipo, raro: !!d.raro });
    for (let k = 0; k < (d.botinX || 1) && d.botin; k++) soltar(e, d.botin, en.x + (k % 4 - 1.5) * 10, en.y + Math.floor(k / 4) * 10);
    if (rnd() < AJ.probCafe) soltar(e, 'cafe', en.x + 8, en.y);
    if (en.tipo === 'reunion' && rnd() < AJ.probPaquete) soltar(e, 'paquete', en.x - 10, en.y);
    if (d.divide) {
      for (const s of [-1, 1]) E.crear(e, d.divide, en.x + s * 10, en.y).dir = s;
      e.eventos.push({ tipo: 'divide', x: en.x, y: en.y });
    }
    B.campana.alCaer(e, en, rnd);
  }

  // Suelta botín: vale lo de su zona, lo de tus mejoras y, en una planta en auditoría, el doble.
  function soltar(e, tipo, x, y) {
    const AJ = e.aj, o = AJ.objetos[tipo], planta = B.plantaDe(AJ, y);
    const auditoria = e.eventosPlanta[planta] === 'auditoria' ? AJ.eventosPlanta.valorAuditoria : 1;
    const valor = Math.round(o.valor * B.difDe(AJ, planta, 0).valor * e.stats.valor * auditoria);
    e.objetos.push({ id: e.ids++, tipo, x, y, valor, peso: o.peso });
  }
  E.soltar = soltar;
})(BAS);
