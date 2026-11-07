// Fans of Zombies · LA PARTIDA (dominio): crea una partida (animal, dificultad, dónde empiezas y dónde hay fans) y la hace avanzar un
// fotograma: reloj, necesidades, tú, los zombis, el ruido y el registro. Lo que pasa queda en e.eventos (la pantalla los lee y los
// borra). Sin reloj, azar ni pantalla propios: el azar y el mundo (choques, vista, sitios) llegan de fuera.
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  // op = { animal, dificultad, x, z, azar, mundo }; el mundo da mundo.aparicion(azar) → { x, z } para poblar el distrito
  Z.nuevaPartida = function (AJ, op) {
    const dif = AJ.dificultades[op.dificultad];
    if (!dif) return Z.error('dificultadDesconocida', { dificultad: op.dificultad });
    const j = Z.nuevoJugador(AJ, op.animal, op.x, op.z);
    if (!j.ok) return j;
    const [c0, c1] = AJ.mundo.corte;
    const e = { min: AJ.reloj.empieza, inicio: AJ.reloj.empieza, dif, dificultad: op.dificultad, jugador: j.valor, zombis: [], ruidos: [], huellas: [], cuerpos: [],
      registrados: {}, contenidos: {}, estacion: Z.estacionDe(AJ, AJ.reloj.empieza), semilla: Math.floor(op.azar() * 2147483647), trozos: {}, rescates: [], refugio: null, coches: [], llaves: {}, planta: 0, torre: { visitadas: {} }, jefeCaido: null, desmontados: {}, abierto: null, sinAgua: false, diaCorteAgua: AJ.mundo.corteAgua[0] + Math.floor(op.azar() * (AJ.mundo.corteAgua[1] - AJ.mundo.corteAgua[0] + 1)), eventos: [], stats: { bajas: 0, registros: 0 }, parche: null, sinLuz: false, diaCorte: c0 + Math.floor(op.azar() * (c1 - c0 + 1)), ultimoId: 0, muerto: null };
    Z.preparaHuecos(AJ, e, op.mundo.huecos ? op.mundo.huecos() : []);
    Z.ponRefugio(e, op.refugio);
    for (const c of op.coches || []) Z.nuevoCoche(AJ, e, c, op.azar);   // los coches del distrito que se conducen
    const n = Math.round(AJ.mundo.zombis * dif.zombis);
    for (let i = 0; i < n; i++) {
      const s = op.mundo.aparicion(op.azar);
      if (Z.dist(s.x, s.z, op.x, op.z) > 16) Z.nuevoZombi(AJ, e, Z.sortea(AJ.reparto, op.azar), s.x, s.z, op.azar);
    }
    return Z.ok(e);
  };
  Z.vivos = (e) => e.zombis.filter((z) => z.vida > 0);

  // un fotograma de dt segundos. ent: la entrada del jugador (ver js/jugador.js) más { usar (id), come, bebe, dormir, registrar (id del sitio) }
  Z.paso = function (AJ, e, dt, ent, mundo, azar) {
    if (e.muerto) return;
    const horas = Z.avanzaReloj(AJ, e, dt, mundo, azar);
    Z.pasoEstacion(AJ, e);
    Z.pasoNecesidades(AJ, e, horas);
    Z.pasoHeridas(AJ, e, horas, azar);                 // sangrar, curarse y la infección de las heridas (js/heridas.js)
    const usar = ent.usar || (ent.come && (Z.primeraQue(AJ, e, 'hambre') || 'judias')) || (ent.bebe && (Z.primeraQue(AJ, e, 'sed') || 'agua'));
    if (usar) avisa(e, Z.usar(AJ, e, usar));
    if (ent.dormir) avisa(e, Z.dormir(AJ, e, mundo));
    if (e.jugador.conduce) Z.pasoCoche(AJ, e, dt, ent, mundo, azar, horas);   // al volante no se registra, ni se pelea, ni se clavan tablas
    else pasoAPie(AJ, e, dt, ent, mundo);
    Z.pasoRegistro(AJ, e, dt, azar);
    Z.pasoTablas(AJ, e, dt);
    Z.pasoObra(AJ, e, dt);                              // construir (js/construir.js)
    Z.pasoLuces(AJ, e, horas);
    Z.pasoDesmontar(AJ, e, dt);
    Z.pasoZombis(AJ, e, dt, mundo, azar);
    Z.pasoRefugio(AJ, e, dt);
    Z.podaLejanos(AJ, e);
    Z.vigilaSueno(AJ, e);
    Z.marcaExplorado(AJ, e, e.jugador.x, e.jugador.z);
    Z.pasoRuidos(e, dt);
  };
  function pasoAPie(AJ, e, dt, ent, mundo) {
    if (ent.registrar) avisa(e, Z.empiezaRegistro(AJ, e, ent.registrar, ent.tipoSitio));
    Z.pasoJugador(AJ, e, dt, ent, mundo);
    if (ent.puerta) avisa(e, Z.usaPuerta(AJ, e, ent.puerta));
    if (ent.tablas) avisa(e, Z.empiezaTablas(AJ, e, ent.tablas));
  }
  // lo que no se ha podido hacer se avisa en pantalla (con el código del error)
  const avisa = (e, r) => { if (!r.ok) e.eventos.push({ tipo: 'noPuedes', codigo: r.codigo }); };
})(ZOM);
