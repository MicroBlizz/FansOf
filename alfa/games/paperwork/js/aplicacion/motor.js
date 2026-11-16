// Fans Of Paperwork · aplicación · MOTOR: avanza la partida dt segundos. El líder rebusca en su archivador a su ritmo, cada trabajador en el
// suyo (dominio/equipo.js), el castor carga la estantería (y la vuelca solo con el plan de carrera), y corren la Trituradora, los correos,
// el sindicato, los urgentes y los objetos en uso. Mientras hay un intento contra la Trituradora, todo el equipo le echa documentos a la
// máquina y no se rebusca. Devuelve la lista de sucesos para que la pantalla los pinte. El azar y dt vienen de fuera.
'use strict';
PW.motor = (() => {
  const PREMIO = { 'pedido-ok': true, trituradora: true };   // sucesos cuyo oro es un premio, no venta
  const PASO_MAX = 0.25;   // un tick largo se parte en pasos, para que los vistazos no se salten plantas

  function lider(e, B, dt, azar, sucesos) {
    const r = e.r;
    r.acumLider = (r.acumLider || 0) + dt * B.vistazosSeg;
    while (r.acumLider >= 1) {
      r.acumLider -= 1;
      const i = PW.equipo.delLider(e);
      if (i >= 0) PW.rebuscar.vistazo(e, B, i, B.dano, azar, sucesos);
    }
  }
  function estanteria(e, B, dt, azar, sucesos) {
    e.r.estanteria = Math.min(B.recargaEstanteria, (e.r.estanteria || 0) + dt);
    if (B.autoEstanteria && PW.extras.estanteriaLista(e, B)) PW.extras.lanzaEstanteria(e, B, azar, sucesos);
  }
  // el ritmo de oro por segundo, suavizado (lo usan los premios y las horas extra)
  function mideRitmo(e, oroAntes, dt) { e.r.ritmoOro = PW.suaviza(e.r.ritmoOro, e.r.oro - oroAntes, dt); }
  function paso(e, dt, azar, sucesos) {
    const B = PW.bonos.calcula(e), oroAntes = e.r.oro, vaciosAntes = e.c.totales.archivadores, desde = sucesos.length;
    const atascando = PW.trituradora.atascando(e);
    e.r.tiempo += dt;
    e.c.tiempoTotal += dt;
    if (atascando) PW.trituradora.avanza(e, B, dt, sucesos);
    else {
      PW.trituradora.pasaEspera(e, dt);
      lider(e, B, dt, azar, sucesos);
      PW.equipo.trabajan(e, B, dt, azar, sucesos);
      estanteria(e, B, dt, azar, sucesos);
    }
    PW.extras.avanzaCorreo(e, dt, azar, sucesos);
    PW.extras.avanzaSindicato(e, B, dt);
    PW.extras.gastaActivos(e, dt);
    PW.sellos.avanza(e, B, dt, azar, sucesos);
    PW.encargos.avanza(e, B, dt, azar, sucesos);
    if (atascando) return;   // durante un intento no se rebusca: el ritmo se queda como estaba
    // los premios que se calculan con el ritmo de oro (y el de atascar un nivel) no cuentan como ritmo
    const premios = sucesos.slice(desde).reduce((s, x) => s + (PREMIO[x.t] ? x.oro || 0 : 0), 0);
    PW.encargos.mideRitmo(e, vaciosAntes, dt);
    mideRitmo(e, oroAntes + premios, dt);
  }
  // con el nodo 'autodespido', el equipo se despide solo al llegar al nivel elegido
  function despidoSolo(e, azar, sucesos) {
    const n = Math.min(e.c.autoDespido, PW.curvas.topeNivel(e.c.trituradora.nivel));   // si el elegido pasa del tope, al llegar al tope
    if (!PW.hitos.tieneNodo(e, 'autodespido') || !n || e.r.nivel < n) return;
    const res = PW.despido.despide(e, PW.bonos.calcula(e), azar);
    if (res.ok) sucesos.push({ t: 'despido', cobra: res.valor, solo: true });
  }
  function avanza(e, dt, azar) {
    const sucesos = [];
    let falta = Math.max(0, dt);
    while (falta > 1e-9) {
      const d = Math.min(PASO_MAX, falta);
      paso(e, d, azar, sucesos);
      falta -= d;
    }
    despidoSolo(e, azar, sucesos);
    return sucesos;
  }
  return { avanza };
})();
