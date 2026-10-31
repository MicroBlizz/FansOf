// Fans Of Pets · aplicación · CASOS DE USO: una función por cosa que hace el jugador o el reloj (responder la entrevista, elegir huevo, poner
// el horario, cuidar, dormir, simular lo que ha pasado) y las de DEV. No tienen reglas: cargan la partida, le piden al dominio que haga la
// acción, la guardan y devuelven el resultado para que la pantalla lo cuente. Los puertos que necesitan (se los da principal.js):
//   almacen: { cargaPartida() → json | null, guardaPartida(json) }     reloj: { ahora() → ms, minutoDelDia(ms) → 0..1439, adelanta(horas) }
'use strict';
PT.creaCasos = ({ reglas, catalogo, almacen, reloj }) => {
  let partida = cargaOEmpieza();

  function cargaOEmpieza() {
    const guardada = almacen.cargaPartida();
    const r = guardada ? PT.Partida.desdeJson(reglas, catalogo, guardada) : null;
    return r && r.ok ? r.valor : PT.Partida.nueva(reglas, catalogo);   // sin partida, o una que no vale: se empieza de cero
  }
  const guarda = () => almacen.guardaPartida(partida.aJson());
  const minutoDelDia = t => reloj.minutoDelDia(t);
  const conGuardado = r => { if (r.ok) guarda(); return r; };

  return {
    get partida() { return partida; },
    ahora: () => reloj.ahora(),
    minutoDelDia,
    esDia: t => partida.esDia(t, minutoDelDia),

    // la entrevista: la pregunta del ritmo cambia la partida; las demás solo se mezclan con un número al azar para sacar la semilla y se olvidan
    eligeRitmo: nombre => conGuardado(partida.eligeRitmo(nombre)),
    terminaEntrevista(respuestas, azar) {
      const semilla = PT.huevos.hash(respuestas.join('-') + '|' + azar);
      return conGuardado(partida.terminaEntrevista(semilla));
    },
    eligeHuevo: i => conGuardado(partida.eligeHuevo(i)),
    ponHorario: datos => conGuardado(partida.ponHorario(datos, reloj.ahora(), minutoDelDia)),

    // simula desde la última vez: { nacio, durmio, desperto, crecido } (crecido: la primera vez que está lista para crecer)
    simula() {
      const pasa = partida.simulaHasta(reloj.ahora(), minutoDelDia);
      if (partida.bebe && partida.bebe.avisaCrecido()) pasa.crecido = true;
      if (partida.bebe) guarda();
      return pasa;
    },

    cuida: tipo => conGuardado(partida.cuida(tipo)),
    dormirODespertar: () => conGuardado(partida.dormirODespertar(reloj.ahora(), minutoDelDia)),

    // DEV
    reinicia() { partida = PT.Partida.nueva(reglas, catalogo); guarda(); },
    adelanta(horas) { reloj.adelanta(horas); return this.simula(); },
    cambiaCriatura: id => conGuardado(partida.cambiaCriatura(id)),
  };
};
