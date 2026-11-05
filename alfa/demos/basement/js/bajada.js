// Fans of Basement · Bajada (dominio, sin DOM ni reloj ni azar propio): una bajada por el hueco del ascensor de Microblizz.
// El jugador se mueve con el dedo, el café baja cada segundo (más cuanto más abajo y más en la CRUNCH ZONE), el botín va a la caja
// del despedido y el ascensor de emergencia te sube con lo que lleves. Si el café llega a cero te desmayas y pierdes la caja.
// Los enemigos están en enemigos.js y el arma en arma.js; principal.js llama a paso() 60 veces por segundo y convierte
// e.eventos en efectos y sonidos.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  B.nuevaBajada = function (AJ, stats) {
    return {
      aj: AJ, stats, t: 0, eventos: [], ids: 1,
      jugador: { x: AJ.ancho / 2, y: AJ.inicio, vx: 0, vy: 0, invulT: 0, frenoT: 0, mira: 1 },
      cafe: stats.cafeMax, cafeMax: stats.cafeMax, cafeBajoAvisado: false,
      caja: { peso: 0, cap: stats.caja, valor: 0, cuenta: 0 }, avisoLlenaT: 0,
      enemigos: [], balas: [], objetos: [], armaT: 0, generadoHasta: AJ.inicio + AJ.generar.zonaSegura,
      planta: 0, plantaMax: 0, zona: AJ.zonas[0], bajas: 0, ascensorT: -1, fin: null, finT: 0, resultado: null,
    };
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
    B.arma.paso(e, dt, rnd);
    botin(e, dt);
    cafe(e, dt);
    ascensor(e, dt, o);
    return e;
  };

  function mover(e, dt, o) {
    const AJ = e.aj, j = e.jugador, J = AJ.jugador;
    const m = Math.hypot(o.mx, o.my), k = m > 1 ? 1 / m : 1;
    const freno = j.frenoT > 0 ? AJ.enemigos.reunion.frena : 1;
    j.vx = o.mx * k * J.vel * freno;
    j.vy = (m > 0.05 ? o.my * k * J.vel : J.deriva) * freno;
    if (Math.abs(j.vx) > 1) j.mira = j.vx > 0 ? 1 : -1;
    j.x = Math.max(AJ.pared + J.radio, Math.min(AJ.ancho - AJ.pared - J.radio, j.x + j.vx * dt));
    j.y = Math.max(J.radio, j.y + j.vy * dt);
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

  // Recoge el botín cercano: el imán lo acerca y, si cabe en la caja, entra. La taza de café rellena el café y no ocupa sitio.
  function botin(e, dt) {
    const AJ = e.aj, j = e.jugador;
    e.avisoLlenaT = Math.max(0, e.avisoLlenaT - dt);
    for (let i = e.objetos.length - 1; i >= 0; i--) {
      const ob = e.objetos[i], dx = j.x - ob.x, dy = j.y - ob.y, d = Math.hypot(dx, dy);
      const cabe = ob.tipo === 'cafe' || e.caja.peso + ob.peso <= e.caja.cap;
      if (cabe && d < AJ.iman && d > 0) { const v = 220 * dt / d; ob.x += dx * Math.min(1, v); ob.y += dy * Math.min(1, v); }
      if (d < AJ.recoge) recoger(e, i, ob, cabe);
      else if (ob.y < j.y - AJ.generar.detras) e.objetos.splice(i, 1);
    }
  }
  function recoger(e, i, ob, cabe) {
    if (ob.tipo === 'cafe') {
      e.cafe = Math.min(e.cafeMax, e.cafe + e.aj.cafe.taza);
      e.objetos.splice(i, 1);
      e.eventos.push({ tipo: 'cafe', x: ob.x, y: ob.y });
      return;
    }
    if (!cabe) {
      if (e.avisoLlenaT <= 0) { e.avisoLlenaT = e.aj.avisoLlena; e.eventos.push({ tipo: 'cajaLlena' }); }
      return;
    }
    e.caja.peso += ob.peso; e.caja.valor += ob.valor; e.caja.cuenta++;
    e.objetos.splice(i, 1);
    e.eventos.push({ tipo: 'recoge', objeto: ob.tipo, valor: ob.valor, x: ob.x, y: ob.y, llena: e.caja.peso >= e.caja.cap });
  }

  B.gastoCafe = (AJ, planta) => AJ.cafe.gasto * (1 + AJ.cafe.gastoPorPlanta * planta) * (B.zonaDe(AJ, planta).crunch ? AJ.cafe.crunch : 1);

  function cafe(e, dt) {
    e.cafe -= B.gastoCafe(e.aj, e.planta) * dt;
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
    if (o.ascensor && e.ascensorT < 0) { e.ascensorT = e.aj.ascensor.espera; e.eventos.push({ tipo: 'ascensorLlamado' }); return; }
    if (e.ascensorT < 0) return;
    e.ascensorT = Math.max(0, e.ascensorT - dt);
    if (e.ascensorT === 0) B.terminar(e, 'ascensor');
  }

  // El final: con el ascensor cobras toda la caja; desmayado, la pierdes.
  B.terminar = function (e, como) {
    if (e.fin) return;
    e.fin = como;
    const monedas = como === 'ascensor' ? e.caja.valor : 0;
    e.resultado = Object.freeze({ como, planta: e.plantaMax, bajas: e.bajas, objetos: e.caja.cuenta, valorCaja: e.caja.valor, monedas, segundos: Math.round(e.t) });
    e.eventos.push({ tipo: 'fin', como, resultado: e.resultado });
  };
})(BAS);
