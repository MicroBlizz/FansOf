// Fans Of Pets · aplicación · CASOS DE USO: una función por cosa que hace el jugador o el reloj (responder la entrevista, elegir huevo, poner
// el horario, cuidar, jugar, dormir, la contraoferta, ascender, despedir, otro huevo, simular lo que ha pasado, cargar otra partida) y las de DEV. No tienen reglas: cargan la partida, le piden al dominio que haga la
// acción, la guardan y devuelven el resultado para que la pantalla lo cuente. Los puertos que necesitan (se los da principal.js):
//   almacen: { cargaPartida() → json | null, guardaPartida(json), leeExtra(nombre), escribeExtra(nombre, valor) }
//   reloj: { ahora() → ms, minutoDelDia(ms) → 0..1439, adelanta(horas) }
//   retos (opcional): { evento(ev, n), maximo(ev, n), conseguido(id) }: el sistema de logros, avisado por PT.creaAvisos tras cada acción
// La cartera (PT.Cartera: Tickets restaurante y Bonus) va aparte de la partida, en el extra 'cartera' del almacén: sobrevive a otro huevo y a reiniciar.
'use strict';
PT.creaCasos = ({ reglas, catalogo, almacen, reloj, retos }) => {
  let partida = cargaOEmpieza();
  const cartera = cargaCartera();
  const avisos = PT.creaAvisos(retos || { evento() {}, maximo() {}, conseguido: () => false }, () => partida);

  function cargaOEmpieza() {
    const guardada = almacen.cargaPartida();
    const r = guardada ? PT.Partida.desdeJson(reglas, catalogo, guardada) : null;
    return r && r.ok ? r.valor : PT.Partida.nueva(reglas, catalogo);   // sin partida, o una que no vale: se empieza de cero
  }
  function cargaCartera() {
    const guardada = almacen.leeExtra('cartera');
    const r = guardada ? PT.Cartera.desdeJson(guardada) : null;
    return r && r.ok ? r.valor : PT.Cartera.nueva();
  }
  const guarda = () => almacen.guardaPartida(partida.aJson());
  const guardaCartera = () => almacen.escribeExtra('cartera', cartera.aJson());
  const minutoDelDia = t => reloj.minutoDelDia(t);
  const conGuardado = r => { if (r.ok) guarda(); return r; };
  // una acción del jugador: se guarda si salió bien y se avisa a los logros
  const accion = (nombre, r) => { conGuardado(r); avisos.tras(nombre, r); return r; };
  // entra dinero en la cartera: n Tickets (un número) o { ganada, comprada } (los premios grandes)
  function ingresa(premio) {
    const p = typeof premio === 'number' ? { ganada: premio } : premio;
    for (const cual of PT.MONEDAS) if (p[cual] > 0) cartera.ingresa(cual, p[cual]);
    guardaCartera();
  }

  return {
    get partida() { return partida; },
    get cartera() { return cartera; },
    ahora: () => reloj.ahora(),
    minutoDelDia,
    esDia: t => partida.esDia(t, minutoDelDia),

    // la entrevista: la pregunta del ritmo cambia la partida; las demás solo se mezclan con un número al azar para sacar la semilla y se olvidan
    eligeRitmo: nombre => conGuardado(partida.eligeRitmo(nombre)),
    terminaEntrevista(respuestas, azar) {
      const semilla = PT.huevos.hash(respuestas.join('-') + '|' + azar);
      return accion('terminaEntrevista', partida.terminaEntrevista(semilla));
    },
    eligeHuevo: i => conGuardado(partida.eligeHuevo(i)),
    ponHorario: datos => accion('ponHorario', partida.ponHorario(datos, reloj.ahora(), minutoDelDia)),

    // simula desde la última vez: lo de PT.Partida ({ nacio, durmio, desperto, crecio, nomina, carta, convencida, seMarcha }) más
    // { crecido } la primera vez que está lista para crecer o ascender. La nómina del día entra en la cartera.
    // Se guarda solo si ha pasado algo (la mascota ha vivido algún minuto o ha nacido): el reloj llama cada pocos segundos
    simula() {
      const antes = partida.mascota ? partida.mascota.ultimo : 0;
      const pasa = partida.simulaHasta(reloj.ahora(), minutoDelDia), m = partida.mascota;
      if (m && partida.fase === 'mascota' && m.avisaCrecido()) pasa.crecido = true;
      if (m && (m.ultimo !== antes || Object.keys(pasa).length)) guarda();
      if (pasa.nomina) ingresa(pasa.nomina);
      avisos.pasa(pasa);
      return pasa;
    },

    cuida: tipo => accion('cuida', partida.cuida(tipo)),
    juega: id => conGuardado(partida.juega(id)),
    dormirODespertar: () => accion('dormirODespertar', partida.dormirODespertar(reloj.ahora(), minutoDelDia)),
    contraoferta: () => accion('contraoferta', partida.contraoferta()),
    asciende: () => accion('asciende', partida.asciende()),
    despide: () => accion('despide', partida.despide()),
    // tras el ascenso o el final: 3 huevos nuevos, con un azar de verdad como semilla
    otroHuevo: () => conGuardado(partida.otroHuevo()),
    huevosNuevos: azar => conGuardado(partida.huevosNuevos(PT.huevos.hash('otro|' + azar))),

    // las monedas: el premio de un logro entra en la cartera (lo llama el adaptador de retos al cobrar); core (MONEDAS.escribir) fija
    // el saldo al cambiar Tickets por Bonus
    ingresa,
    fijaSaldo(cual, n) { const r = cartera.fija(cual, n); if (r.ok) guardaCartera(); return r; },

    // cargar una partida guardada en vez de la actual (la que llegue del servidor, o la que DEV retoca). Resultado: el de PT.Partida.desdeJson
    cargaDe(json) {
      const r = PT.Partida.desdeJson(reglas, catalogo, json);
      if (r.ok) { partida = r.valor; guarda(); }
      return r;
    },

    // DEV
    reinicia() { partida = PT.Partida.nueva(reglas, catalogo); guarda(); },
    adelanta(horas) { reloj.adelanta(horas); return this.simula(); },
  };
};
