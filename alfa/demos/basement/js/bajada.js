// Fans of Basement · Bajada (dominio, sin DOM ni reloj ni azar propio): una bajada por el hueco del ascensor de Microblizz.
// El jugador se mueve con el dedo, el café baja cada segundo (más cuanto más abajo y más en la CRUNCH ZONE), el botín va a la caja
// del despedido y el ascensor de emergencia te sube con lo que lleves. Si el café llega a cero te desmayas y pierdes la caja.
// Mientras hay un jefe vivo, no se puede bajar de su planta. Los enemigos están en enemigos.js, los jefes en jefes.js, los
// becarios en becarios.js y el arma (la tuya y la de tus ayudantes) en arma.js. principal.js llama a paso() 60 veces por
// segundo y convierte e.eventos en efectos y sonidos.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  // vencidos = plantas cuyo jefe ya venciste otra vez (su jefe suelta un paquete normal en vez del paquete del jefe).
  B.nuevaBajada = function (AJ, stats, vencidos) {
    const e = {
      aj: AJ, stats, t: 0, eventos: [], ids: 1,
      jugador: { x: AJ.ancho / 2, y: AJ.inicio, vx: 0, vy: 0, invulT: 0, frenoT: 0, mira: 1 },
      cafe: stats.cafeMax, cafeMax: stats.cafeMax, cafeBajoAvisado: false,
      caja: { peso: 0, cap: stats.caja, valor: 0, cuenta: 0, paquetes: { normal: 0, jefe: 0 } }, avisoLlenaT: 0,
      enemigos: [], balas: [], objetos: [], proyectiles: [], becarios: [], ayudantes: [], armaT: 0,
      generadoHasta: AJ.inicio + AJ.generar.zonaSegura, jefe: null, jefesVistos: {}, jefesVencidos: 0, jefesNuevos: [], vencidos: [...(vencidos || [])], rescatados: 0,
      planta: 0, plantaMax: 0, zona: AJ.zonas[0], bajas: 0, ascensorT: -1, fin: null, finT: 0, resultado: null,
    };
    if (stats.mascota) B.arma.nuevoAyudante(e, 'mascota', stats.mascota);
    return e;
  };

  B.plantaDe = (AJ, y) => Math.max(0, Math.floor(y / AJ.altoPlanta));
  B.zonaDe = (AJ, planta) => { let z = AJ.zonas[0]; for (const q of AJ.zonas) if (planta >= q.desde) z = q; return z; };

  // Un paso. orden = { mx, my (−1..1, el dedo), ascensor (pulsación) }; rnd = azar (0..1).
  B.paso = function (e, dt, orden, rnd) {
    e.eventos = [];
    if (e.fin) { e.finT += dt; return e; }
    e.t += dt;
    const o = orden || { mx: 0, my: 0, ascensor: false };
    mover(e, dt, o);
    plantas(e);
    B.enemigos.paso(e, dt, rnd);
    B.jefes.paso(e, dt, rnd);
    B.becarios.paso(e);
    B.arma.paso(e, dt, rnd);
    botin(e, dt);
    cafe(e, dt);
    ascensor(e, dt, o);
    return e;
  };

  // Cuánto te frena una reunión: el freno de la reunión, menos lo que te protejan los auriculares.
  const frenoDe = (e) => 1 - (1 - e.aj.enemigos.reunion.frena) * (1 - e.stats.freno);

  function mover(e, dt, o) {
    const AJ = e.aj, j = e.jugador, J = AJ.jugador;
    const m = Math.hypot(o.mx, o.my), k = m > 1 ? 1 / m : 1;
    const vel = J.vel * e.stats.vel * (j.frenoT > 0 ? frenoDe(e) : 1);
    j.vx = o.mx * k * vel;
    j.vy = m > 0.05 ? o.my * k * vel : J.deriva;
    if (Math.abs(j.vx) > 1) j.mira = j.vx > 0 ? 1 : -1;
    j.x = Math.max(AJ.pared + J.radio, Math.min(AJ.ancho - AJ.pared - J.radio, j.x + j.vx * dt));
    j.y = Math.max(J.radio, j.y + j.vy * dt);
    if (e.jefe) j.y = Math.min(j.y, e.jefe.suelo - J.radio);   // la cinta de PRECAUCIÓN no deja pasar
    j.invulT = Math.max(0, j.invulT - dt);
    j.frenoT = Math.max(0, j.frenoT - dt);
  }

  // Al pasar a una planta nueva avisa (y si cambia de zona, también: la CRUNCH ZONE gasta más café).
  function plantas(e) {
    const p = B.plantaDe(e.aj, e.jugador.y);
    e.planta = p;
    if (p <= e.plantaMax) return;
    e.plantaMax = p;
    const z = B.zonaDe(e.aj, p);
    if (z !== e.zona) { e.zona = z; e.eventos.push({ tipo: 'zona', zona: z }); }
    else e.eventos.push({ tipo: 'planta', planta: p });
  }

  // Recoge el botín cercano: el imán lo acerca y, si cabe en la caja, entra. La taza de café rellena el café y los paquetes
  // no ocupan sitio.
  function botin(e, dt) {
    const AJ = e.aj, j = e.jugador;
    e.avisoLlenaT = Math.max(0, e.avisoLlenaT - dt);
    for (let i = e.objetos.length - 1; i >= 0; i--) {
      const ob = e.objetos[i], dx = j.x - ob.x, dy = j.y - ob.y, d = Math.hypot(dx, dy);
      const cabe = ob.peso === 0 || e.caja.peso + ob.peso <= e.caja.cap;
      if (cabe && d < e.stats.iman && d > 0) { const v = 220 * dt / d; ob.x += dx * Math.min(1, v); ob.y += dy * Math.min(1, v); }
      if (d < AJ.recoge) recoger(e, i, ob, cabe);
      else if (ob.y < j.y - AJ.generar.detras) e.objetos.splice(i, 1);
    }
  }

  const ESPECIAL = {
    cafe(e, ob) { e.cafe = Math.min(e.cafeMax, e.cafe + e.stats.taza); e.eventos.push({ tipo: 'cafe', x: ob.x, y: ob.y }); },
    paquete(e, ob) { e.caja.paquetes.normal++; e.eventos.push({ tipo: 'paquete', x: ob.x, y: ob.y, paquete: 'normal' }); },
    paqueteJefe(e, ob) { e.caja.paquetes.jefe++; e.eventos.push({ tipo: 'paquete', x: ob.x, y: ob.y, paquete: 'jefe' }); },
  };

  function recoger(e, i, ob, cabe) {
    if (ESPECIAL[ob.tipo]) { ESPECIAL[ob.tipo](e, ob); e.objetos.splice(i, 1); return; }
    if (!cabe) {
      if (e.avisoLlenaT <= 0) { e.avisoLlenaT = e.aj.avisoLlena; e.eventos.push({ tipo: 'cajaLlena' }); }
      return;
    }
    e.caja.peso += ob.peso; e.caja.valor += ob.valor; e.caja.cuenta++;
    e.objetos.splice(i, 1);
    e.eventos.push({ tipo: 'recoge', objeto: ob.tipo, valor: ob.valor, x: ob.x, y: ob.y, llena: e.caja.peso >= e.caja.cap });
  }

  // El café que se gasta por segundo en una planta (stats: lo que lo rebajan la formación; sin stats, lo de base).
  B.gastoCafe = function (AJ, planta, stats) {
    const s = stats || { gasto: 1, crunch: 1 }, crunch = B.zonaDe(AJ, planta).crunch ? 1 + (AJ.cafe.crunch - 1) * s.crunch : 1;
    return AJ.cafe.gasto * (1 + AJ.cafe.gastoPorPlanta * planta) * crunch * s.gasto;
  };

  function cafe(e, dt) {
    e.cafe -= B.gastoCafe(e.aj, e.planta, e.stats) * dt;
    if (!e.cafeBajoAvisado && e.cafe < e.cafeMax * 0.25) { e.cafeBajoAvisado = true; e.eventos.push({ tipo: 'cafeBajo' }); }
    if (e.cafe <= 0) { e.cafe = 0; B.terminar(e, 'desmayo'); }
  }

  // Los golpes quitan café; el jugador queda un momento sin poder recibir más.
  B.herirJugador = function (e, cuanto, tipo) {
    const j = e.jugador;
    if (j.invulT > 0 || e.fin) return false;
    j.invulT = e.aj.jugador.invul;
    e.cafe = Math.max(0, e.cafe - cuanto);
    e.eventos.push({ tipo: 'golpe', x: j.x, y: j.y, cuanto, por: tipo });
    return true;
  };

  function ascensor(e, dt, o) {
    if (e.fin) return;
    if (o.ascensor && e.ascensorT < 0) { e.ascensorT = e.stats.espera; e.eventos.push({ tipo: 'ascensorLlamado' }); return; }
    if (e.ascensorT < 0) return;
    e.ascensorT = Math.max(0, e.ascensorT - dt);
    if (e.ascensorT === 0) B.terminar(e, 'ascensor');
  }

  // La propina de los becarios rescatados (sube con la planta más honda).
  B.propinas = (e) => Math.round(e.rescatados * e.aj.becarios.propina * (1 + e.aj.valorPorPlanta * e.plantaMax));

  // El final: con el ascensor cobras la caja, los paquetes y las propinas; desmayado, lo pierdes todo menos los jefes vencidos.
  B.terminar = function (e, como) {
    if (e.fin) return;
    e.fin = como;
    const salvo = como === 'ascensor', propinas = salvo ? B.propinas(e) : 0;
    e.resultado = Object.freeze({
      como, planta: e.plantaMax, bajas: e.bajas, objetos: e.caja.cuenta, valorCaja: e.caja.valor, propinas,
      monedas: salvo ? e.caja.valor + propinas : 0, rescatados: e.rescatados, jefes: e.jefesVencidos,
      paquetes: salvo ? { ...e.caja.paquetes } : { normal: 0, jefe: 0 }, jefesNuevos: salvo ? [...e.jefesNuevos] : [], segundos: Math.round(e.t),
    });
    e.eventos.push({ tipo: 'fin', como, resultado: e.resultado });
  };
})(BAS);
