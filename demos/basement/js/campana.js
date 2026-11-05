// Fans of Basement · Campaña (dominio, sin DOM ni reloj ni azar propio): la dificultad de cada planta (por zona, con la pared
// suave entre departamentos y el Legacy sin fondo), qué departamentos puedes elegir para empezar, los trucos de cada zona
// (tickets que se reabren, bugs que se duplican, apagones, todo urgente), los eventos de planta (apagón, máquina de café,
// auditoría y paquete con guardias) y las ventajas que se eligen, 1 de 3, al entrar en cada zona.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const CA = B.campana = {};

  // Lo duro que es una planta: vida de bichos y jefes, lo que quitan sus golpes, gasto de café y valor del botín. El rango (ascensos) endurece a los bichos.
  B.difDe = function (AJ, planta, rango) {
    const z = B.zonaDe(AJ, planta), k = planta - z.desde, P = AJ.difPorPlanta, S = z.sinFin || { vida: 0, gasto: 0, valor: 0, golpe: 0 };
    const r = 1 + AJ.porRango.vida * (rango || 0);
    return {
      vida: z.dif.vida * (1 + (P.vida + S.vida) * k) * r,
      gasto: z.dif.gasto * (1 + (P.gasto + S.gasto) * k),
      valor: z.dif.valor * (1 + (P.valor + S.valor) * k),
      golpe: z.dif.golpe * (1 + (P.golpe + S.golpe) * k),
    };
  };

  // Los departamentos donde puedes empezar: Marketing siempre; cada uno de los otros, si ya venciste al jefe del anterior.
  B.departamentos = (AJ, p) => AJ.zonas.map((z) => ({ id: z.id, desde: z.desde, abierto: z.desde === 0 || p.vencidos.includes(z.desde - 1) }));
  B.inicioDe = function (AJ, p, id) {
    const d = B.departamentos(AJ, p).find((q) => q.id === id);
    if (!d) return B.error('departamentoDesconocido', { id });
    if (!d.abierto) return B.error('departamentoCerrado', { id });
    return B.ok(d.desde);
  };

  const truco = (e) => (e.zona.truco === 'todo' ? 'todo' : e.zona.truco);
  const tieneTruco = (e, t) => truco(e) === t || truco(e) === 'todo';
  CA.tieneTruco = tieneTruco;
  CA.velBichos = (e) => (tieneTruco(e, 'urgente') ? e.aj.trucos.urgente.vel : 1);

  // ---------- eventos de planta ----------
  // Se decide al generar el primer tramo de cada planta: qué pasa en ella (o nada).
  CA.alGenerar = function (e, planta, rnd) {
    const AJ = e.aj, Q = AJ.eventosPlanta;
    if (planta < Q.desde || B.jefes.dePlanta(AJ, planta) || rnd() >= Q.prob) return;
    const tipo = B.sortea(Q.tipos, rnd());
    e.eventosPlanta[planta] = tipo;
    if (tipo === 'cafe') for (let i = 0; i < Q.tazas; i++) B.enemigos.soltar(e, 'cafe', 120 + i * 60, planta * AJ.altoPlanta + 200);
    if (tipo === 'paquete') guardias(e, planta, rnd);
  };
  function guardias(e, planta, rnd) {
    const AJ = e.aj, y = planta * AJ.altoPlanta + 230, x = AJ.pared + 60 + rnd() * (AJ.ancho - 2 * AJ.pared - 120);
    B.enemigos.soltar(e, 'paquete', x, y);
    for (let i = 0; i < AJ.eventosPlanta.guardias; i++) B.enemigos.crear(e, 'reunion', x + (i - 1) * 50, y - 40);
  }
  CA.eventoAqui = (e) => e.eventosPlanta[e.planta] || null;

  // ---------- apagones (truco de la Sala de Servidores y evento de planta) ----------
  function apagones(e, dt) {
    const A = e.aj.trucos.apagon, hay = tieneTruco(e, 'apagon') || CA.eventoAqui(e) === 'apagon';
    if (!hay) { e.apagon = false; e.apagonT = A.cada * 0.5; return; }
    e.apagonT -= dt;
    if (e.apagonT > 0) return;
    e.apagon = !e.apagon;
    e.apagonT = e.apagon ? A.dura : A.cada;
    if (e.apagon) e.eventos.push({ tipo: 'apagon' });
  }

  // Al entrar en una planta nueva: su evento, si tiene.
  CA.alEntrar = function (e, planta) {
    const ev = e.eventosPlanta[planta];
    if (ev) e.eventos.push({ tipo: 'eventoPlanta', evento: ev, planta });
  };

  CA.paso = function (e, dt) { apagones(e, dt); };

  // ---------- trucos al caer un bicho ----------
  // Devuelve true si el bicho «no se queda caído»: un ticket que se reabre (vuelve con media vida) o un bug que se duplica.
  CA.alCaer = function (e, en, rnd) {
    const T = e.aj.trucos;
    if (en.tipo === 'correo' && !en.reabierto && tieneTruco(e, 'tickets') && rnd() < T.tickets.prob) {
      const c = B.enemigos.crear(e, 'correo', en.x, en.y); c.reabierto = true; c.vida = c.vidaMax = Math.ceil(c.vidaMax / 2);
      e.eventos.push({ tipo: 'reabierto', x: en.x, y: en.y });
    }
    if (en.tipo === 'bug' && !en.copia && tieneTruco(e, 'bugs') && rnd() < T.bugs.prob) {
      for (const s of [-1, 1]) { const c = B.enemigos.crear(e, 'bug', en.x + s * 16, en.y); c.copia = true; c.dir = s; }
      e.eventos.push({ tipo: 'duplicado', x: en.x, y: en.y });
    }
  };

  // ---------- ventajas (1 de 3 al entrar en cada zona) ----------
  CA.ofrece = function (e, rnd) {
    const libres = e.aj.ventajas.filter((v) => !e.ventajas.includes(v.id)).map((v) => v.id), opciones = [];
    while (opciones.length < 3 && libres.length) opciones.push(libres.splice(Math.floor(rnd() * libres.length), 1)[0]);
    if (opciones.length) { e.eleccion = opciones; e.eventos.push({ tipo: 'eleccion', opciones }); }
  };

  const APLICA = {
    cafe: (e, n) => { e.cafeMax += n; e.cafe = Math.min(e.cafeMax, e.cafe + n); },
    dano: (e, n) => { e.stats.dano = Math.round(e.stats.dano * (1 + n) * 10) / 10; },
    cadencia: (e, n) => { e.stats.cadencia *= 1 - n; },
    iman: (e, n) => { e.stats.iman += n; },
    caja: (e, n) => { e.caja.cap += n; },
    blindaje: (e, n) => { e.stats.blindaje = Math.min(0.8, (e.stats.blindaje || 0) + n); },
    valor: (e, n) => { e.stats.valor += n; },
    gasto: (e, n) => { e.stats.gasto *= 1 - n; },
    rebote: (e, n) => { e.stats.rebote = (e.stats.rebote || 0) + n; },
    espera: (e, n) => { e.stats.espera = Math.max(1, e.stats.espera - n); },
  };

  // Elegir una de las ventajas ofrecidas: se aplica al momento y la bajada sigue.
  B.elegirVentaja = function (e, id) {
    if (!e.eleccion) return B.error('nadaQueElegir');
    if (!e.eleccion.includes(id)) return B.error('noOfrecida', { id });
    const v = e.aj.ventajas.find((q) => q.id === id);
    for (const k of Object.keys(v.ef)) APLICA[k](e, v.ef[k]);
    e.ventajas.push(id);
    e.eleccion = null;
    e.eventos.push({ tipo: 'ventaja', id });
    combos(e);
    return B.ok(id);
  };

  // El combo que formaría esta ventaja con las que ya tienes (o null).
  CA.comboCon = (e, id) => e.aj.combos.find((c) => c.de.includes(id) && c.de.every((x) => x === id || e.ventajas.includes(x)) && !e.combos.includes(c.id)) || null;
  // Si ya tienes las dos ventajas de un combo, se juntan: sus efectos se suman.
  function combos(e) {
    for (const c of e.aj.combos) {
      if (e.combos.includes(c.id) || !c.de.every((x) => e.ventajas.includes(x))) continue;
      for (const k of Object.keys(c.ef)) APLICA[k](e, c.ef[k]);
      e.combos.push(c.id);
      e.eventos.push({ tipo: 'combo', id: c.id, nombre: c.nombre });
    }
  }
})(BAS);
