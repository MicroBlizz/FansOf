// Fans of Basement · Bajada (dominio, sin DOM ni reloj ni azar propio): una bajada por el hueco del ascensor de Microblizz.
// El jugador se mueve con el dedo, el café baja cada segundo (según la zona: campana.js), el botín va a la caja del despedido y el
// ascensor de emergencia te sube con lo que lleves. Si el café llega a cero te desmayas y pierdes la caja. Mientras hay un jefe vivo,
// no se puede bajar de su planta; al vencer al CEO el servidor queda arreglado (el final). Al entrar en cada zona se elige 1 de 3
// ventajas (la bajada espera). Los enemigos están en enemigos.js, los jefes en jefes.js, los becarios en becarios.js, el arma (la
// tuya y la de tus ayudantes) en arma.js y la campaña (dificultad, trucos, eventos, ventajas) en campana.js. principal.js llama a
// paso() 60 veces por segundo y convierte e.eventos en efectos y sonidos.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  // opc = { vencidos: plantas cuyo jefe ya venciste (su jefe suelta un paquete normal), inicio: planta donde empiezas (la primera
  // de un departamento), rango: tus ascensos, ventajas: si se ofrecen ventajas al entrar en cada zona }. Vale un array (los vencidos).
  B.nuevaBajada = function (AJ, stats, opc) {
    const o = Array.isArray(opc) ? { vencidos: opc } : opc || {}, inicio = o.inicio || 0, y = inicio * AJ.altoPlanta + AJ.inicio;
    const e = {
      aj: AJ, stats: { ...stats }, t: 0, eventos: [], ids: 1, rango: o.rango || 0, conVentajas: !!o.ventajas,
      jugador: { x: AJ.ancho / 2, y, vx: 0, vy: 0, invulT: 0, frenoT: 0, mira: 1 },
      cafe: stats.cafeMax, cafeMax: stats.cafeMax, cafeBajoAvisado: false,
      caja: { peso: 0, cap: stats.caja, valor: 0, cuenta: 0, paquetes: { normal: 0, jefe: 0 }, materiales: {} }, avisoLlenaT: 0, capturas: {}, capturasValor: 0, redes: stats.redes || 0,
      enemigos: [], muebles: [], balas: [], objetos: [], proyectiles: [], becarios: [], ayudantes: [], armaT: 0,
      generadoHasta: y + AJ.generar.zonaSegura, jefe: null, jefesVistos: {}, jefesVencidos: 0, jefesNuevos: [], vencidos: [...(o.vencidos || [])],
      rescatados: 0, eventosPlanta: {}, ventajas: [], eleccion: null, apagon: false, apagonT: AJ.trucos.apagon.cada * 0.5,
      bajasPorTipo: {}, final: false, inicio, planta: inicio, plantaMax: inicio, zona: B.zonaDe(AJ, inicio), bajas: 0,
      ascensorT: -1, fin: null, finT: 0, resultado: null, empezada: false, combos: [], mueblesRotos: 0, habilidadUsos: 0,
      habilidad: stats.habilidad || null, habilidadT: stats.habilidad ? AJ.habilidades[stats.habilidad].recarga * 0.5 : 0, congeladoT: 0,
    };
    if (stats.mascota) B.arma.nuevoAyudante(e, 'mascota', stats.mascota);
    return e;
  };

  B.plantaDe = (AJ, y) => Math.max(0, Math.floor(y / AJ.altoPlanta));
  B.zonaDe = (AJ, planta) => { let z = AJ.zonas[0]; for (const q of AJ.zonas) if (planta >= q.desde) z = q; return z; };

  // Un paso. orden = { mx, my (−1..1, el dedo), ascensor, habilidad y red (pulsaciones) }; rnd = azar (0..1). Mientras hay que elegir ventaja, espera.
  B.paso = function (e, dt, orden, rnd) {
    e.eventos = [];
    if (e.fin) { e.finT += dt; return e; }
    if (!e.empezada) { e.empezada = true; if (e.conVentajas) B.campana.ofrece(e, rnd); }
    if (e.eleccion) return e;
    e.t += dt;
    const o = orden || { mx: 0, my: 0, ascensor: false };
    mover(e, dt, o);
    B.habilidad.paso(e, dt, o, rnd);
    B.captura.paso(e, o);
    plantas(e, rnd);
    B.campana.paso(e, dt);
    B.enemigos.paso(e, dt, rnd);
    B.muebles.paso(e, dt);
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
    const vel = J.vel * e.stats.vel * (j.frenoT > 0 ? frenoDe(e) : 1) * B.presionDe(AJ, e.zona.id, e.stats, 'vel');
    j.vx = o.mx * k * vel;
    j.vy = m > 0.05 ? o.my * k * vel : J.deriva;
    if (Math.abs(j.vx) > 1) j.mira = j.vx > 0 ? 1 : -1;
    j.x = Math.max(AJ.pared + J.radio, Math.min(AJ.ancho - AJ.pared - J.radio, j.x + j.vx * dt));
    j.y = Math.max(e.inicio * AJ.altoPlanta + J.radio, j.y + j.vy * dt);
    if (e.jefe) j.y = Math.min(j.y, e.jefe.suelo - J.radio);   // la cinta de PRECAUCIÓN no deja pasar
    j.invulT = Math.max(0, j.invulT - dt);
    j.frenoT = Math.max(0, j.frenoT - dt);
  }

  // Al pasar a una planta nueva avisa (y si cambia de zona, también, y se ofrecen ventajas); y si la planta tiene evento, también.
  function plantas(e, rnd) {
    const p = B.plantaDe(e.aj, e.jugador.y);
    e.planta = p;
    if (p <= e.plantaMax) return;
    e.plantaMax = p;
    const z = B.zonaDe(e.aj, p);
    if (z !== e.zona) {
      e.zona = z; e.eventos.push({ tipo: 'zona', zona: z, presion: B.bajoPresion(e.aj, z.id, e.stats) });
      if (e.conVentajas) B.campana.ofrece(e, rnd);
    } else e.eventos.push({ tipo: 'planta', planta: p });
    B.campana.alEntrar(e, p);
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
  // los materiales del taller tampoco ocupan sitio
  for (const t of ['tornillo', 'cable', 'chip', 'disco']) ESPECIAL[t] = (e, ob) => { e.caja.materiales[t] = (e.caja.materiales[t] || 0) + 1; e.eventos.push({ tipo: 'material', material: t, x: ob.x, y: ob.y }); };

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

  // El café que se gasta por segundo en una planta (stats: lo que lo rebajan la formación y las ventajas; sin stats, lo de base).
  B.gastoCafe = function (AJ, planta, stats) {
    const s = stats || { gasto: 1, crunch: 1 }, crunch = B.zonaDe(AJ, planta).crunch ? 1 + (AJ.cafe.crunch - 1) * s.crunch : 1;
    return AJ.cafe.gasto * B.difDe(AJ, planta, 0).gasto * crunch * s.gasto * B.presionDe(AJ, B.zonaDe(AJ, planta).id, stats, 'cafe');
  };

  function cafe(e, dt) {
    e.cafe -= B.gastoCafe(e.aj, e.planta, e.stats) * dt;
    if (!e.cafeBajoAvisado && e.cafe < e.cafeMax * 0.25) { e.cafeBajoAvisado = true; e.eventos.push({ tipo: 'cafeBajo' }); }
    if (e.cafe <= 0) { e.cafe = 0; B.terminar(e, 'desmayo'); }
  }

  // Los golpes quitan café (menos con el blindaje de las ventajas); el jugador queda un momento sin poder recibir más.
  B.herirJugador = function (e, cuanto, tipo) {
    const j = e.jugador;
    if (j.invulT > 0 || e.fin) return false;
    j.invulT = e.aj.jugador.invul;
    const quita = Math.round(cuanto * (1 - (e.stats.blindaje || 0)) * 10) / 10;
    e.cafe = Math.max(0, e.cafe - quita);
    e.eventos.push({ tipo: 'golpe', x: j.x, y: j.y, cuanto: quita, por: tipo });
    return true;
  };

  // Llamar al ascensor: en una planta en auditoría no llega.
  function ascensor(e, dt, o) {
    if (e.fin) return;
    if (o.ascensor && e.ascensorT < 0) {
      if (B.campana.eventoAqui(e) === 'auditoria') { e.eventos.push({ tipo: 'auditoriaAscensor' }); return; }
      e.ascensorT = e.stats.espera; e.eventos.push({ tipo: 'ascensorLlamado' }); return;
    }
    if (e.ascensorT < 0) return;
    e.ascensorT = Math.max(0, e.ascensorT - dt);
    if (e.ascensorT === 0) B.terminar(e, 'ascensor');
  }

  // La propina de los becarios rescatados (sube con lo que vale el botín de la planta más honda).
  B.propinas = (e) => Math.round(e.rescatados * e.aj.becarios.propina * B.difDe(e.aj, e.plantaMax, 0).valor);

  // El final: con el ascensor cobras la caja, los paquetes y las propinas; desmayado, lo pierdes todo menos lo aprendido (los bichos
  // vistos para el catálogo, los jefes vencidos y, si lo arreglaste, el servidor).
  B.terminar = function (e, como) {
    if (e.fin) return;
    e.fin = como;
    const salvo = como === 'ascensor', propinas = salvo ? B.propinas(e) : 0;
    e.resultado = Object.freeze({
      como, planta: e.plantaMax, inicio: e.inicio, bajas: e.bajas, objetos: e.caja.cuenta, valorCaja: e.caja.valor, propinas,
      monedas: salvo ? e.caja.valor + propinas + e.capturasValor : 0, rescatados: e.rescatados, jefes: e.jefesVencidos,
      paquetes: salvo ? { ...e.caja.paquetes } : { normal: 0, jefe: 0 }, materiales: salvo ? { ...e.caja.materiales } : {}, jefesNuevos: salvo ? [...e.jefesNuevos] : [],
      bajasPorTipo: { ...e.bajasPorTipo }, final: e.final, segundos: Math.round(e.t),
      muebles: e.mueblesRotos, habilidades: e.habilidadUsos, combos: e.combos.length, capturas: salvo ? { ...e.capturas } : {},
    });
    e.eventos.push({ tipo: 'fin', como, resultado: e.resultado });
  };
})(BAS);
