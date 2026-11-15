// Fans Of Paperwork · aplicación · CASOS DE USO: lo único que la pantalla puede pedir. Carga la partida (y cobra las horas extra del tiempo
// fuera), avanza el motor cada fotograma, ejecuta las órdenes del jugador (rebuscar, comprar, atascar, despedirse…), guarda y avisa a los
// retos. Los puertos vienen de fuera: almacen { cargaPartida, guardaPartida }, reloj { ahora }, azar () → 0..1, retos { evento, maximo }.
'use strict';
PW.creaCasos = ({ almacen, reloj, azar, retos }) => {
  const AJ = PW.AJ, GUARDA_CADA = 10, VUELTA_MIN = 60;   // segundos de juego entre guardados; segundos fuera para cobrar horas extra
  let e = null, sinGuardar = 0;

  // los sucesos del motor y de las órdenes que cuentan para los logros
  const AVISOS = {
    vacio: () => ['evento', 'archivadores', 1],
    'pedido-ok': () => ['evento', 'pedidos', 1],
    planta: s => ['maximo', 'planta', s.n],
    nivel: s => ['maximo', 'nivel', s.n],
    trituradora: s => ['maximo', 'trituradora', s.nivel],
    empujon: () => ['evento', 'empujones', 1],
    despido: () => ['evento', 'despidos', 1],
    estanteria: () => ['evento', 'estanterias', 1],
    especialidad: () => ['evento', 'especialidad', 1],
    clasificado: () => ['evento', 'clasificados', 1],
  };
  // junta los avisos de una tanda (suma los eventos y se queda con el mayor de cada máximo) para escribir los retos una sola vez
  function avisa(sucesos) {
    const suma = {}, max = {};
    for (const s of sucesos) {
      const a = AVISOS[s.t] && AVISOS[s.t](s);
      if (a && a[0] === 'evento') suma[a[1]] = (suma[a[1]] || 0) + a[2];
      else if (a) max[a[1]] = Math.max(max[a[1]] || 0, a[2]);
    }
    for (const k in suma) retos.evento(k, suma[k]);
    for (const k in max) retos.maximo(k, max[k]);
  }
  function guarda() {
    almacen.guardaPartida({ ...PW.partida.aJson(e), t: reloj.ahora() });
    sinGuardar = 0;
  }
  const B = () => PW.bonos.calcula(e);

  // Resultado: PW.ok({ vuelta }) con lo cobrado en horas extra (o null), o PW.ok({ nueva: true })
  function arranca() {
    const j = almacen.cargaPartida(), cargada = j ? PW.partida.desdeJson(j, azar) : null;
    if (!cargada || !cargada.ok) {
      if (j) almacen.guardaCopia(j);   // un guardado que no se entiende no se pisa sin más: se aparta una copia
      e = PW.partida.nueva(azar);
      guarda();
      return PW.ok({ nueva: true, vuelta: null, error: cargada && cargada.error });
    }
    e = cargada.valor;
    const vuelta = vuelve((reloj.ahora() - (j.t || reloj.ahora())) / 1000);
    guarda();
    return PW.ok({ nueva: false, vuelta });
  }
  // al volver tras s segundos fuera (al cargar o al volver a la pestaña): las horas extra, si fue un rato. Resultado: lo cobrado o null
  function vuelve(s) {
    if (!(s >= VUELTA_MIN)) return null;
    const res = PW.extras.horasExtra(e, B(), s).valor;
    guarda();
    return res;
  }
  // la pestaña se esconde (se guarda y se apunta la hora) y vuelve (las horas extra de ese rato, o null)
  let fuera = null;
  function sale() { fuera = reloj.ahora(); guarda(); }
  function entra() {
    if (fuera === null) return null;
    const s = (reloj.ahora() - fuera) / 1000;
    fuera = null;
    return vuelve(s);
  }
  function tick(dt) {
    const sucesos = PW.motor.avanza(e, dt, azar);
    avisa(sucesos);
    sinGuardar += dt;
    if (sinGuardar >= GUARDA_CADA || sucesos.some(s => s.t === 'trituradora' || s.t === 'despido')) guarda();
    return sucesos;
  }
  // una orden: ejecuta, guarda si salió bien y avisa a los retos de lo que haya pasado
  // (guardaYa = false: lo guarda el temporizador de tick, para las órdenes que se repiten mucho, como tocar)
  function orden(fn, aviso, guardaYa = true) {
    const sucesos = [], res = fn(sucesos);
    if (res.ok) {
      avisa(sucesos);
      if (aviso) retos.evento(aviso, 1);
      if (guardaYa || sucesos.some(s => s.t === 'trituradora')) guarda();
    }
    return { ...res, sucesos };
  }
  // tocar un archivador: un vistazo extra del líder, que además se queda trabajando ahí; durante un intento, el toque empuja a la Trituradora
  function toca(i) {
    return orden(s => {
      if (PW.trituradora.atascando(e)) return PW.trituradora.empuja(e, B(), s);
      if (!(e.r.planta.archivadores[i] && e.r.planta.archivadores[i].vida > 0)) return PW.error('sin-archivador');
      const b = B();
      e.r.ultimoToque = e.r.tiempo;
      PW.equipo.apunta(e, i);
      PW.rebuscar.vistazo(e, b, i, b.dano * AJ.lider.toqueMulti, azar, s);
      return PW.ok(i);
    }, 'toques', false);
  }
  function despide() {
    return orden(s => {
      const res = PW.despido.despide(e, B(), azar);
      if (res.ok) s.push({ t: 'despido', cobra: res.valor });
      return res;
    });
  }
  // los logros pagan en Indemnización: es lo que se queda entre despidos
  function ingresa(n) { e.c.indemnizacion += Math.max(0, Math.floor(n)); guarda(); }
  function borra() { e = PW.partida.nueva(azar); guarda(); }

  return {
    arranca, vuelve, sale, entra, tick, toca, despide, ingresa, borra, guarda,
    get partida() { return e; },
    bonos: B,
    estanteria: () => orden(s => PW.extras.lanzaEstanteria(e, B(), azar, s)),
    atasca: () => orden(() => PW.trituradora.atasca(e, B()), 'atascos'),
    compraUtil: cual => orden(() => PW.compras.compraUtil(e, cual), 'mejoras'),
    compraHerramienta: z => orden(() => PW.compras.compraHerramienta(e, z), 'mejoras'),
    entregaUrgente: () => orden(() => PW.sellos.entrega(e, B()), 'urgentes'),
    fijaMunicion: (cual, si) => orden(() => PW.trituradora.fijaMunicion(e, cual, si)),
    eligeCarta: id => orden(s => PW.cartas.elige(e, B(), id, azar, s), 'cartas'),
    fijaFotocopia: m => orden(() => PW.compras.fijaFotocopia(e, m)),
    irA: n => orden(s => PW.rebuscar.irA(e, B(), n, azar, s)),
    cambiaAuto: () => orden(() => PW.rebuscar.fijaAuto(e)),
    manda: (k, i) => orden(() => PW.equipo.manda(e, B(), k, i)),
    compraDocumento: m => orden(() => PW.compras.compraDocumento(e, m), 'mejoras'),
    compraRecuerdo: id => orden(() => PW.compras.compraRecuerdo(e, id), 'recuerdos'),
    compraCarrera: id => orden(() => PW.compras.compraCarrera(e, id), 'carrera'),
    fijaVenta: parte => orden(() => PW.compras.fijaVenta(e, parte)),
    fijaAutoDespido: n => orden(() => PW.compras.fijaAutoDespido(e, n)),
    abreCofre: () => orden(() => PW.extras.abreCofre(e, azar), 'cofres'),
    usaObjeto: id => orden(() => PW.extras.usaObjeto(e, B(), id), 'objetos'),
    abreCorreo: () => orden(() => PW.extras.abreCorreo(e, B(), azar), 'correos'),
    abreSindicato: () => orden(() => PW.extras.abreSindicato(e), 'sindicatos'),
  };
};
