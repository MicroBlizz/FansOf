// Fans of Zombies · EL SUPERVIVIENTE (dominio): el animal que eliges y su ventaja, el hambre, la sed y el sueño que bajan con las
// horas, la infección de los mordiscos, usar lo de la mochila (js/mochila.js), dormir y morir (con su causa). Registrar y coger cosas
// está en js/registrar.js.
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  Z.nuevoJugador = function (AJ, animal, x, z) {
    const A = AJ.animales[animal];
    if (!A) return Z.error('animalDesconocido', { animal });
    const vida = A.vida || AJ.jugador.vida;
    const J = { animal, A, x, z, a: 0, vida, max: vida, hambre: 85, sed: 85, sueno: 90, infeccion: 0, agacha: false, corre: false, duerme: false, aguante: AJ.aguante.max, agotado: false,
      arma: 'escopeta', tArma: 0, registra: null, andado: 0, ultimoGolpe: null, ...Z.nuevoEquipo(AJ, A) };   // la mochila, la riñonera, los bolsillos y la ropa (js/equipo.js)
    const grandes = AJ.mochilaInicial.slice().sort((a, b) => Z.formaDe(AJ, b[0]).c.length - Z.formaDe(AJ, a[0]).c.length);   // lo grande primero, para que quepa todo
    for (const [id, n] of grandes) Z.meterLleva(AJ, J, id, n);
    return Z.ok(J);
  };

  // las necesidades bajan con las horas; si alguna llega a 0, quita vida (y se apunta la causa por si mueres)
  Z.pasoNecesidades = function (AJ, e, horas) {
    const J = e.jugador, N = AJ.necesidades, p = Z.parcheDe(AJ, e), k = e.dif.necesidades * horas, E = Z.estacion(AJ, e.min);
    J.hambre = Math.max(0, J.hambre - N.hambre * k * ((p && p.hambre) || 1) * Z.hambreRopa(AJ, J, E));   // el frío y el calor, según la ropa (js/equipo.js)
    J.sed = Math.max(0, J.sed - N.sed * k * Z.sedRopa(AJ, J, E));
    J.sueno = J.duerme ? Math.min(100, J.sueno + N.recuperaSueno * horas) : Math.max(0, J.sueno - N.sueno * k);
    for (const n of ['hambre', 'sed', 'sueno']) if (J[n] <= 0) Z.dana(e, N.vidaSiVacia * horas, n);
    if (J.infeccion > 0) { J.infeccion = Math.min(100, J.infeccion + N.infeccion * horas * (J.A.infeccion || 1)); Z.dana(e, J.infeccion / 100 * N.infeccion * horas * 2, 'infeccion'); }
    else if (J.hambre > 30 && J.sed > 30) J.vida = Math.min(J.max, J.vida + N.curaSola * horas);
  };
  // quitar vida; causa = 'mordisco' | 'hambre' | 'sed' | 'sueno' | 'infeccion' | 'sangra' (y quién, si fue un zombi)
  Z.dana = function (e, cuanto, causa, quien) {
    const J = e.jugador;
    if (e.muerto || cuanto <= 0) return;
    J.vida -= cuanto; J.ultimoGolpe = { causa, quien: quien || null };
    if (J.vida <= 0) { J.vida = 0; e.muerto = Z.resumen(e); e.eventos.push({ tipo: 'muerte' }); }
  };
  Z.resumen = (e) => ({ animal: e.jugador.animal, min: e.min - e.inicio, dias: Z.diaDe(e.min), causa: e.jugador.ultimoGolpe, bajas: e.stats.bajas, registros: e.stats.registros, parche: e.parche, ceo: !!e.jefeCaido });

  // usar una cosa de la mochila (la que tenga «usa» en AJ.objetos)
  Z.usar = function (AJ, e, cosa) {
    const J = e.jugador, O = AJ.objetos[cosa], U = O && O.usa;
    if (O && O.cura) return Z.curaSola(AJ, e, O.cura);       // vendas, desinfectante, aguja y tablilla van a una herida (js/heridas.js)
    if (!U) return Z.error('noSeUsa', { cosa });
    const r = Z.gastaLleva(J, cosa, 1);
    if (!r.ok) return r;
    const nutre = O.cocinado ? Z.mas(AJ, J, 'cocina', 'nutre') : 1;   // lo que cocinas alimenta más cuanto mejor cocinas
    for (const n of ['hambre', 'sed', 'sueno']) if (U[n]) J[n] = Math.max(0, Math.min(100, J[n] + U[n] * (U[n] > 0 ? nutre : 1)));
    if (U.vida > 0) J.vida = Math.min(J.max, J.vida + U.vida * (J.A.venda || 1));
    if (U.vida < 0) Z.dana(e, -U.vida, 'comida');
    if (U.infeccion) J.infeccion = Math.max(0, J.infeccion + U.infeccion);
    if (U.analgesico) Z.tomaAnalgesico(AJ, e);
    if (U.ruido) Z.haceRuido(AJ, e, J.x, J.z, AJ.ruido[U.ruido] * (J.A.ruido || 1), 'jugador');
    if (O.deja) Z.meterLleva(AJ, J, O.deja, 1);              // el agua deja su botella (si cabe)
    e.eventos.push({ tipo: 'usa', cosa, mal: !!U.mal });
    return Z.ok(cosa);
  };
  // la primera cosa de comer o beber que tengas (para las teclas E y Q)
  Z.primeraQue = (AJ, e, necesidad) => Object.keys(AJ.objetos).find((id) => { const U = AJ.objetos[id].usa; return U && U[necesidad] > 0 && !U.mal && Z.lleva(e.jugador, id); }) || null;   // nunca lo que sienta mal

  // dormir: solo con sueño y sin fans cerca; te despiertas solo, o si alguno se acerca
  Z.dormir = function (AJ, e) {
    const J = e.jugador;
    if (J.sueno > 70) return Z.error('sinSueno');
    if (Z.zombiCerca(e, AJ.mundo.despierta)) return Z.error('hayZombis');
    J.duerme = true; J.agacha = true;
    return Z.ok(true);
  };
  Z.zombiCerca = (e, r) => e.zombis.some((z) => z.vida > 0 && Z.dist(z.x, z.z, e.jugador.x, e.jugador.z) < r);
  Z.vigilaSueno = function (AJ, e) {
    const J = e.jugador;
    if (!J.duerme) return;
    if (J.sueno >= 100 || Z.zombiCerca(e, AJ.mundo.despierta * 0.6)) { J.duerme = false; e.eventos.push({ tipo: 'despierta', susto: J.sueno < 100 }); }
  };

})(ZOM);
