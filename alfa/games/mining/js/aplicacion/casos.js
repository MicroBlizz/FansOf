// Fans Of Mining · aplicación · CASOS DE USO: lo único que la pantalla puede pedir. Carga la partida (y cobra las horas extra del tiempo
// fuera), avanza el motor cada fotograma, ejecuta las órdenes del jugador (picar, comprar, atacar, despedirse…), guarda y avisa a los
// retos. Los puertos vienen de fuera: almacen { cargaPartida, guardaPartida }, reloj { ahora }, azar () → 0..1, retos { evento, maximo }.
'use strict';
MN.creaCasos = ({ almacen, reloj, azar, retos }) => {
  const AJ = MN.AJ, GUARDA_CADA = 10, VUELTA_MIN = 60;   // segundos de juego entre guardados; segundos fuera para cobrar horas extra
  let e = null, sinGuardar = 0;

  // los sucesos del motor y de las órdenes que cuentan para los logros
  const AVISOS = {
    roto: () => ['evento', 'bloques', 1],
    planta: s => ['maximo', 'planta', s.n],
    nivel: s => ['maximo', 'nivel', s.n],
    trituradora: s => ['maximo', 'trituradora', s.nivel],
    despido: () => ['evento', 'despidos', 1],
    dinamita: () => ['evento', 'dinamitas', 1],
    expediente: () => ['evento', 'expedientes', 1],
    reciclado: () => ['evento', 'reciclados', 1],
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
    almacen.guardaPartida({ ...MN.partida.aJson(e), t: reloj.ahora() });
    sinGuardar = 0;
  }
  const B = () => MN.bonos.calcula(e);

  // Resultado: MN.ok({ vuelta }) con lo cobrado en horas extra (o null), o MN.ok({ nueva: true })
  function arranca() {
    const j = almacen.cargaPartida(), cargada = j ? MN.partida.desdeJson(j, azar) : null;
    if (!cargada || !cargada.ok) {
      if (j) almacen.guardaCopia(j);   // un guardado que no se entiende no se pisa sin más: se aparta una copia
      e = MN.partida.nueva(azar);
      guarda();
      return MN.ok({ nueva: true, vuelta: null, error: cargada && cargada.error });
    }
    e = cargada.valor;
    const vuelta = vuelve((reloj.ahora() - (j.t || reloj.ahora())) / 1000);
    guarda();
    return MN.ok({ nueva: false, vuelta });
  }
  // al volver tras s segundos fuera (al cargar o al volver a la pestaña): las horas extra, si fue un rato. Resultado: lo cobrado o null
  function vuelve(s) {
    if (!(s >= VUELTA_MIN)) return null;
    const res = MN.extras.horasExtra(e, B(), s).valor;
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
    const sucesos = MN.motor.avanza(e, dt, azar);
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
      if (guardaYa) guarda();
    }
    return { ...res, sucesos };
  }
  // tocar un bloque: un golpe extra del pico (no mientras se ataca a la Trituradora)
  function toca(i) {
    return orden(s => {
      if (MN.trituradora.atacando(e)) return MN.error('atacando');
      if (!(e.r.planta.bloques[i] && e.r.planta.bloques[i].vida > 0)) return MN.error('sin-bloque');
      const b = B();
      MN.picar.golpeDePico(e, b, i, b.dano * AJ.pico.toqueMulti, azar, s);
      return MN.ok(i);
    }, 'toques', false);
  }
  function despide() {
    return orden(s => {
      const res = MN.despido.despide(e, B(), azar);
      if (res.ok) s.push({ t: 'despido', cobra: res.valor });
      return res;
    });
  }
  // los logros pagan en Indemnización: es lo que se queda entre despidos
  function ingresa(n) { e.c.indemnizacion += Math.max(0, Math.floor(n)); guarda(); }
  function borra() { e = MN.partida.nueva(azar); guarda(); }

  return {
    arranca, vuelve, sale, entra, tick, toca, despide, ingresa, borra, guarda,
    get partida() { return e; },
    bonos: B,
    dinamita: () => orden(s => MN.extras.lanzaDinamita(e, B(), azar, s)),
    ataca: () => orden(() => MN.trituradora.ataca(e, B()), 'ataques'),
    compraPico: cual => orden(() => MN.compras.compraPico(e, cual), 'mejoras'),
    compraMaterial: m => orden(() => MN.compras.compraMaterial(e, m), 'mejoras'),
    compraRecuerdo: id => orden(() => MN.compras.compraRecuerdo(e, id), 'recuerdos'),
    compraCarrera: id => orden(() => MN.compras.compraCarrera(e, id), 'carrera'),
    fijaVenta: parte => orden(() => MN.compras.fijaVenta(e, parte)),
    fijaAutoDespido: n => orden(() => MN.compras.fijaAutoDespido(e, n)),
    abreCofre: () => orden(() => MN.extras.abreCofre(e, azar), 'cofres'),
    usaObjeto: id => orden(() => MN.extras.usaObjeto(e, B(), id), 'objetos'),
    abreCorreo: () => orden(() => MN.extras.abreCorreo(e, B(), azar), 'correos'),
    abreSindicato: () => orden(() => MN.extras.abreSindicato(e), 'sindicatos'),
  };
};
