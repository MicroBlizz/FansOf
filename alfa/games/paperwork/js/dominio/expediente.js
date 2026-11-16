// Fans Of Paperwork · dominio · EXPEDIENTE DE LA SEMANA: un encargo largo para quien entra un rato cada día. Pide vaciar tantos archivadores
// como el equipo vacía en unas horas de juego a su ritmo de ahora; cumplirlo paga grapas de oro (más con cada nivel de la Trituradora) y un
// cofre. Su plazo corre también fuera (en horas extra), y al acabar el plazo, cumplido o no, empieza otro. Vive en la carrera
// (c.expediente: { n, base, falta, cumplido }): el Despido no lo borra. Se abre con su nivel de la Trituradora.
'use strict';
PW.expediente = (() => {
  const X = PW.AJ.expediente;
  // un expediente nuevo, medido con el ritmo de vaciar archivadores de ahora
  function nuevo(e) {
    const n = Math.max(X.minimo, Math.round((e.r.ritmoVacio || 0) * 3600 * X.horasJuego));
    e.c.expediente = { n, base: e.c.totales.archivadores, falta: X.duracion, cumplido: false };
    return e.c.expediente;
  }
  // cuántos archivadores lleva (sin pasar de lo pedido)
  const hechos = e => Math.min(e.c.expediente.n, e.c.totales.archivadores - e.c.expediente.base);
  const grapas = e => X.grapasNivel * Math.max(1, e.c.trituradora.nivel);
  // avanza dt segundos: el plazo corre; al cumplirlo paga una vez; al acabar el plazo empieza otro
  function avanza(e, B, dt, sucesos) {
    if (!B.abierto.expediente) return;
    const x = e.c.expediente || nuevo(e);
    x.falta -= dt;
    if (!x.cumplido && hechos(e) >= x.n) cobra(e, B, x, sucesos);
    if (x.falta > 0) return;
    if (!x.cumplido) sucesos.push({ t: 'expediente-fin' });
    nuevo(e);
  }
  function cobra(e, B, x, sucesos) {
    const g = grapas(e);
    x.cumplido = true;
    e.c.grapas += g;
    if (B.abierto.cofres) PW.extras.guardaCofre(e);
    sucesos.push({ t: 'expediente-ok', grapas: g });
  }
  return { nuevo, hechos, grapas, avanza };
})();
