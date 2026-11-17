// Fans Of Paperwork · calibrado · FÓRMULAS: lo que se puede calcular sin jugar, al momento, con las cifras de PW.AJ de ahora: la Trituradora
// nivel a nivel, lo que pide cada planta, la Indemnización por nivel, lo que vale de media un paquete del sindicato (con la garantía de los
// raros), las grapas de oro que llegan por día según el jugador tipo y lo que cuesta gastarlas. Todo sale de las funciones del dominio
// (PW.curvas…), sin bonos de la partida. No ve el azar ni las decisiones del jugador: para eso está jugador.js. ADR 122.
'use strict';
PW.calibrado = PW.calibrado || {};
PW.calibrado.formulas = (() => {
  const C = PW.curvas, AJ = () => PW.AJ;
  const suma = (lista, f) => lista.reduce((s, x) => s + f(x), 0);
  const nombresAbiertos = nivel => PW.DESBLOQUEOS.filter(d => d.nivel === nivel).map(d => d.nombre);

  // la Trituradora: lo que hay que llenar en cada nivel y lo que da atascarlo (grapas y oro, los de llegar al nivel `nivel`)
  function trituradora() {
    const T = AJ().trituradora;
    return Array.from({ length: T.niveles }, (_, n) => ({
      nivel: n + 1, capacidad: C.capacidadTrituradora(n), tragaderas: C.tragaderasTrituradora(n),
      grapas: AJ().grapas.porNivel * (n + 1), oro: T.premioOro * (n + 1), topeNivel: C.topeNivel(n + 1), abre: nombresAbiertos(n + 1),
    }));
  }
  // cada planta de la lista: su zona, sus dos documentos, lo que pide para dar con la entrada, la vida y la dureza del segundo documento
  function plantas(lista = [1, 5, 10, 16, 17, 24, 32, 33, 40, 48, 49, 56, 64, 72, 80]) {
    return lista.map(p => {
      const [a, b] = C.documentosDe(p);
      return { planta: p, zona: C.zonaDe(p), documentos: [a, b], entrada: C.entrada(p), vida: C.vidaDocumento(b, p), dureza: C.dureza(b, p) };
    });
  }
  const despido = (niveles = [5, 10, 20, 30, 40, 50, 60, 70, 80]) => niveles.map(nivel => ({ nivel, cobra: C.indemnizacion(nivel) }));

  // un paquete del sindicato: los puntos de mérito de media sin garantía y con ella (la cadena de «comunes seguidos» en su estado
  // estable: tras garantía − 1 comunes, la tirada se hace solo entre los raros o mejores), y la parte de paquetes raros o mejores
  function paquete() {
    const R = PW.RAREZAS, G = AJ().meritosGarantia, peso = suma(R, r => r.peso);
    const comun = R[0].peso / peso, medio = suma(R, r => r.peso * r.vale) / peso;
    const sinComun = suma(R.slice(1), r => r.peso * r.vale) / suma(R.slice(1), r => r.peso);
    // estado estable: estar en k comunes seguidos (0..G-1) pesa comun^k; el último estado obliga a raro o mejor
    const pesos = Array.from({ length: G }, (_, k) => Math.pow(comun, k)), total = suma(pesos, x => x);
    const ultimo = pesos[G - 1] / total;
    return { puntos: medio, conGarantia: (1 - ultimo) * medio + ultimo * sinComun, raroOMejor: (1 - ultimo) * (1 - comun) + ultimo,
      grapas: AJ().grapas.porPaquete };
  }
  // paquetes por día del jugador tipo, con el sindicato ya abierto y sin bonos: quien no se va abre uno cada `cada` segundos; quien juega
  // a ratos abre los que llegan mientras juega y, al volver, los que han llegado desde entonces, hasta el tope de la taquilla (llena, su
  // reloj se para)
  function paquetesDia(perfil, cada = AJ().sindicato.cada, tope = AJ().sindicato.guardaMax) {
    const P = PW.calibrado.jugador.PERFILES[perfil];
    if (!Number.isFinite(P.cada)) return 86400 / cada;
    const jugando = Math.floor(P.juega / cada), fuera = Math.min(tope, Math.floor((P.cada - jugando * cada) / cada));
    return (jugando + fuera) * 86400 / P.cada;
  }
  // grapas de oro por día con la Trituradora en el nivel n, por fuente; las de atascar son de una vez (de la 1 a la n)
  function grapas(perfil = 'hora', n = 5) {
    const A = AJ(), paquetes = paquetesDia(perfil);
    return { paquetes, porPaquetes: paquetes * A.grapas.porPaquete, porExpediente: A.expediente.grapasNivel * n * 86400 / A.expediente.duracion,
      porTrituradora: A.grapas.porNivel * n * (n + 1) / 2 };
  }
  // lo que cuesta gastarlas: los primeros puntos del plan y cada cosa de la tienda entera
  function costes(puntos = 10) {
    const G = AJ().grapas, plan = [];
    for (let k = 0, acum = 0; k < puntos; k++) { const p = Math.ceil(G.punto0 * Math.pow(G.puntoFactor, k)); acum += p; plan.push({ punto: k + 1, precio: p, acumulado: acum }); }
    const tienda = PW.TIENDA.map(t => ({ id: t.id, nombre: t.nombre, max: t.max,
      total: suma(Array.from({ length: t.max }, (_, k) => k), k => Math.ceil(t.precio0 * Math.pow(t.factor, k))) }));
    return { plan, tienda, tiendaEntera: suma(tienda, t => t.total) };
  }
  // todas las tablas de una vez (lo que enseña el panel)
  const todo = (perfil = 'hora', n = 5) => ({ trituradora: trituradora(), plantas: plantas(), despido: despido(), paquete: paquete(), grapas: grapas(perfil, n), costes: costes() });
  return { trituradora, plantas, despido, paquete, paquetesDia, grapas, costes, todo };
})();
