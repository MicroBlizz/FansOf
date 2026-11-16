// Fans Of Paperwork · calibrado · JUGADOR TIPO: juega una partida entera a cámara rápida con los casos de uso de verdad, segundo a segundo
// mientras está, y con las horas extra mientras no. Cada `mira` segundos compra lo más barato que pueda (también con las grapas de oro), abre todo lo que llega, usa los
// objetos, atasca la Trituradora en cuanto puede y se despide al llevar `estancado` segundos de juego sin bajar de planta. Perfiles: «activo»
// (no se va nunca), «hora» (5 min de cada hora) y «dia» (dos ratos de 15 min al día). Apunta los hitos y una serie con el estado cada minuto
// (y a cada vuelta). Lo usan la simulación de ritmo de los tests y el panel de calibrado. ADR 122.
'use strict';
PW.calibrado = PW.calibrado || {};
PW.calibrado.jugador = (() => {
  // juega: segundos seguidos jugando en cada rato; cada: segundos entre el principio de un rato y el del siguiente
  const PERFILES = {
    activo: { nombre: 'Activo (no se va nunca)', juega: Infinity, cada: Infinity },
    hora: { nombre: 'Cada hora (5 min)', juega: 300, cada: 3600 },
    dosHoras: { nombre: 'Cada 2 horas (5 min)', juega: 300, cada: 7200 },
    dia: { nombre: 'Dos veces al día (15 min)', juega: 900, cada: 43200 },
  };
  const UTILES = ['gafas', 'cafe', 'carrito', 'guantes', 'fundas'];

  function compraUtiles(cs, e) {
    for (let k = 0; k < 40; k++) {
      const libres = UTILES.filter(c => PW.compras.vistoUtil(e, c) && e.r.utiles[c] < PW.AJ.utiles[c].max && PW.compras.precioUtil(e, c) <= e.r.oro);
      if (!libres.length) return;
      libres.sort((a, b) => PW.compras.precioUtil(e, a) - PW.compras.precioUtil(e, b));
      cs.compraUtil(libres[0]);
    }
  }
  // las grapas de oro, en lo más barato que haya: un nivel de la tienda o un punto del plan de carrera
  function gastaGrapas(cs, e) {
    for (let k = 0; k < 50; k++) {
      const opciones = PW.tienda.lista(e).filter(t => PW.tienda.nivel(e, t.id) < t.max).map(t => [PW.tienda.precio(e, t.id), () => cs.compraTienda(t.id)]);
      opciones.push([PW.meritos.precioPunto(e), () => cs.compraPunto()]);
      opciones.sort((a, b) => a[0] - b[0]);
      if (!opciones.some(([precio, compra]) => precio <= e.c.grapas && compra().ok)) return;
    }
  }
  function compraTodo(cs, e) {
    compraUtiles(cs, e);
    gastaGrapas(cs, e);
    for (let z = 0; z < PW.ZONAS.length; z++) while (cs.compraHerramienta(z).ok);
    for (let m = 0; m < PW.DOCUMENTOS.length; m++) while (cs.compraDocumento(m).ok);
    for (const n of PW.CARRERA) cs.compraCarrera(n.id);
    for (const r of PW.RECUERDOS) while (cs.compraRecuerdo(r.id).ok);
  }
  function abreTodo(cs) {
    cs.estanteria(); cs.abreCorreo(); cs.recogeSindicato(); cs.entregaUrgente();
    if (cs.partida.c.oferta.length) cs.eligeCarta(cs.partida.c.oferta[0]);
    while (cs.abreCofre().ok);
    for (const o of PW.OBJETOS) cs.usaObjeto(o.id);
  }
  // lo que se apunta en la serie: una foto pequeña del estado en el segundo t
  const cuenta = o => Object.values(o).reduce((s, n) => s + n, 0);
  function foto(e, t) {
    return { t, trituradora: e.c.trituradora.nivel, planta: e.r.planta.n, plantaMax: e.c.plantaMax, nivel: e.r.nivel, oro: e.r.oro,
      grapas: e.c.grapas, meritos: cuenta(e.c.meritos), paquetes: cuenta(e.c.rarezas), despidos: e.c.despidos, indemnizacion: e.c.indemnizacion };
  }
  // un segundo de juego: el motor, sus hitos y, cada `mira` segundos, las decisiones del jugador
  function segundo(j, cs, mira, estancado) {
    const e = cs.partida, { hitos } = j;
    for (const s of cs.tick(1)) {
      if (s.t === 'trituradora') hitos.trituradora.push(j.t);
      if (s.t === 'planta') hitos.recorridos[hitos.recorridos.length - 1].push([j.t, s.n]);
    }
    if (e.r.planta.n !== j.ultimaPlanta) { j.ultimaPlanta = e.r.planta.n; j.desde = j.jugado; }
    if (j.jugado % mira) return;
    abreTodo(cs);
    compraTodo(cs, e);
    if (PW.trituradora.lista(e)) cs.atasca();
    if (PW.despido.puede(e) && !PW.trituradora.atascando(e) && j.jugado - j.desde > estancado) {
      hitos.despidos.push({ t: j.t, nivel: e.r.nivel, planta: e.r.planta.n, cobra: cs.despide().valor });
      hitos.recorridos.push([]);
      j.ultimaPlanta = 1; j.desde = j.jugado;
    }
  }
  // un rato fuera: se guarda, pasa el reloj y al volver se cobran las horas extra (y se apunta en la serie)
  function fuera(j, cs, reloj, s) {
    cs.sale();
    reloj.adelanta(s);
    j.t += s;
    const vuelta = cs.entra();
    if (vuelta) j.hitos.vueltas.push({ t: j.t, oro: vuelta.oro, paquetes: vuelta.paquetes, cofres: vuelta.cofres });
    j.serie.push(foto(cs.partida, j.t));
  }
  // Juega `horas` horas de reloj (contando las de fuera). Resultado: { hitos, serie, partida, perfil }, con
  // hitos = { trituradora: [t de cada nivel], despidos: [{ t, nivel, planta, cobra }], recorridos: [[[t, planta]…]…], vueltas: [{ t, oro, paquetes, cofres }] }
  function juega({ perfil = 'activo', horas = 6, semilla = 7, estancado = 180, mira = 5, muestra = 60, mejoras = [], puertos = PW.calibrado.puertos } = {}) {
    const P = PERFILES[perfil];
    if (!P) return PW.error('perfil-desconocido', { perfil });
    const reloj = puertos.reloj();
    const cs = PW.creaCasos({ almacen: puertos.almacen(), reloj, azar: puertos.azar(semilla), retos: puertos.retos() });
    cs.ponMejoras(PW.mejoras.de(mejoras));   // las claves de las mejoras de pago con las que juega (ADR 125)
    cs.arranca();
    const j = { t: 0, jugado: 0, ultimaPlanta: 1, desde: 0, serie: [foto(cs.partida, 0)], hitos: { trituradora: [], despidos: [], recorridos: [[]], vueltas: [] } };
    const fin = horas * 3600;
    while (j.t < fin) {
      const rato = Math.min(P.juega, fin - j.t);
      for (let k = 0; k < rato; k++) {
        j.t++; j.jugado++;
        reloj.adelanta(1);
        segundo(j, cs, mira, estancado);
        if (j.t % muestra === 0) j.serie.push(foto(cs.partida, j.t));
      }
      if (j.t < fin) fuera(j, cs, reloj, Math.min(P.cada - P.juega, fin - j.t));
    }
    return PW.ok({ hitos: j.hitos, serie: j.serie, partida: cs.partida, perfil });
  }
  return { PERFILES, juega, foto };
})();
