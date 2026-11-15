// Fans Of Paperwork · aplicación · MOTOR: avanza la partida dt segundos. El líder pica el primer bloque vivo a su ritmo, los ayudantes
// (los líderes de las facciones liberadas) golpean bloques al azar, la dinamita se carga (y se lanza sola con el plan de carrera), y
// corren la Trituradora, los correos, el sindicato y los objetos en uso. Mientras hay un intento contra la Trituradora, todo el equipo
// pega a la máquina y no se pica. Devuelve la lista de sucesos para que la pantalla los pinte. El azar y dt vienen de fuera.
'use strict';
PW.motor = (() => {
  const AJ = PW.AJ;
  const PASO_MAX = 0.25;   // un tick largo se parte en pasos, para que los golpes no se salten plantas

  function pica(e, B, dt, azar, sucesos) {
    const r = e.r;
    r.acumPico = (r.acumPico || 0) + dt * B.golpesSeg;
    while (r.acumPico >= 1) {
      r.acumPico -= 1;
      const i = PW.planta.primerVivo(r.planta);
      if (i >= 0) PW.picar.golpeDePico(e, B, i, B.dano, azar, sucesos);
    }
  }
  function ayudan(e, B, dt, azar, sucesos) {
    const r = e.r;
    if (!B.ayudantes) return;
    r.acumAyud = (r.acumAyud || 0) + dt * AJ.ayudante.golpesSeg * B.ayudantes;
    while (r.acumAyud >= 1) {
      r.acumAyud -= 1;
      const vivos = PW.planta.vivos(r.planta);
      if (!vivos.length) return;
      const i = vivos[Math.floor(azar() * vivos.length) % vivos.length];
      const quien = 1 + Math.floor(azar() * B.ayudantes) % B.ayudantes;
      sucesos.push({ t: 'ayuda', i, quien });
      PW.picar.golpea(e, B, i, B.dano * B.ayud, azar, sucesos);
    }
  }
  function dinamita(e, B, dt, azar, sucesos) {
    e.r.dinamita = Math.min(B.recargaDinamita, (e.r.dinamita || 0) + dt);
    if (B.autoDinamita && PW.extras.dinamitaLista(e, B)) PW.extras.lanzaDinamita(e, B, azar, sucesos);
  }
  // el ritmo de oro por segundo, suavizado (lo usan los premios y las horas extra)
  function mideRitmo(e, oroAntes, dt) {
    const ahora = Math.max(0, e.r.oro - oroAntes) / dt, k = Math.min(1, dt / 30);
    e.r.ritmoOro = (e.r.ritmoOro || 0) * (1 - k) + ahora * k;
  }
  function paso(e, dt, azar, sucesos) {
    const B = PW.bonos.calcula(e), oroAntes = e.r.oro;
    e.r.tiempo += dt;
    e.c.tiempoTotal += dt;
    if (PW.trituradora.atacando(e)) PW.trituradora.avanza(e, B, dt, sucesos);
    else {
      PW.trituradora.pasaEspera(e, dt);
      pica(e, B, dt, azar, sucesos);
      ayudan(e, B, dt, azar, sucesos);
      dinamita(e, B, dt, azar, sucesos);
    }
    PW.extras.avanzaCorreo(e, dt, azar, sucesos);
    PW.extras.avanzaSindicato(e, dt);
    PW.extras.gastaActivos(e, dt);
    mideRitmo(e, oroAntes, dt);
  }
  // con el nodo 'autodespido', el equipo se despide solo al llegar al nivel elegido
  function despidoSolo(e, azar, sucesos) {
    const n = Math.min(e.c.autoDespido, PW.curvas.topeNivel(e.c.trituradora.nivel));   // si el elegido pasa del tope, al llegar al tope
    if (!e.c.plan.autodespido || !n || e.r.nivel < n) return;
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
