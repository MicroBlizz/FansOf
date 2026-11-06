// Fans of Zombies · EL SUPERVIVIENTE (dominio): el animal que eliges y su ventaja, el hambre, la sed y el sueño que bajan con las
// horas, la infección de los mordiscos, usar lo de la mochila (judías, agua, vendas), dormir, registrar y morir (con su causa).
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  Z.nuevoJugador = function (AJ, animal, x, z) {
    const A = AJ.animales[animal];
    if (!A) return Z.error('animalDesconocido', { animal });
    const vida = A.vida || AJ.jugador.vida;
    return Z.ok({ animal, A, x, z, a: 0, vida, max: vida, hambre: 85, sed: 85, sueno: 90, infeccion: 0, agacha: false, corre: false, duerme: false,
      arma: 'escopeta', tArma: 0, registra: null, mochila: Object.assign({}, AJ.mochilaInicial), andado: 0, ultimoGolpe: null });
  };

  // las necesidades bajan con las horas; si alguna llega a 0, quita vida (y se apunta la causa por si mueres)
  Z.pasoNecesidades = function (AJ, e, horas) {
    const J = e.jugador, N = AJ.necesidades, p = Z.parcheDe(AJ, e), k = e.dif.necesidades * horas;
    J.hambre = Math.max(0, J.hambre - N.hambre * k * ((p && p.hambre) || 1));
    J.sed = Math.max(0, J.sed - N.sed * k);
    J.sueno = J.duerme ? Math.min(100, J.sueno + N.recuperaSueno * horas) : Math.max(0, J.sueno - N.sueno * k);
    for (const n of ['hambre', 'sed', 'sueno']) if (J[n] <= 0) Z.dana(e, N.vidaSiVacia * horas, n);
    if (J.infeccion > 0) { J.infeccion = Math.min(100, J.infeccion + N.infeccion * horas * (J.A.infeccion || 1)); Z.dana(e, J.infeccion / 100 * N.infeccion * horas * 2, 'infeccion'); }
    else if (J.hambre > 30 && J.sed > 30) J.vida = Math.min(J.max, J.vida + N.curaSola * horas);
  };
  // quitar vida; causa = 'mordisco' | 'hambre' | 'sed' | 'sueno' | 'infeccion' (y quién, si fue un zombi)
  Z.dana = function (e, cuanto, causa, quien) {
    const J = e.jugador;
    if (e.muerto || cuanto <= 0) return;
    J.vida -= cuanto; J.ultimoGolpe = { causa, quien: quien || null };
    if (J.vida <= 0) { J.vida = 0; e.muerto = Z.resumen(e); e.eventos.push({ tipo: 'muerte' }); }
  };
  Z.resumen = (e) => ({ animal: e.jugador.animal, min: e.min - e.inicio, dias: Z.diaDe(e.min), causa: e.jugador.ultimoGolpe, bajas: e.stats.bajas, registros: e.stats.registros, parche: e.parche });

  // usar una cosa de la mochila
  Z.usar = function (AJ, e, cosa) {
    const J = e.jugador, U = AJ.usos[cosa];
    if (!U) return Z.error('noSeUsa', { cosa });
    if (!J.mochila[cosa]) return Z.error('noTienes', { cosa });
    J.mochila[cosa]--;
    if (U.hambre) J.hambre = Math.min(100, J.hambre + U.hambre);
    if (U.sed) J.sed = Math.min(100, J.sed + U.sed);
    if (U.vida) J.vida = Math.min(J.max, J.vida + U.vida * (J.A.venda || 1));
    if (U.infeccion) J.infeccion = Math.max(0, J.infeccion + U.infeccion);
    if (U.ruido) Z.haceRuido(AJ, e, J.x, J.z, AJ.ruido[U.ruido] * (J.A.ruido || 1), 'jugador');
    return Z.ok(cosa);
  };

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

  // registrar un sitio (id): tarda un poco, hace algo de ruido y da cosas al azar. Cada sitio, una vez
  Z.empiezaRegistro = function (AJ, e, sitio) {
    const J = e.jugador;
    if (!sitio) return Z.error('nadaCerca');
    if (e.registrados[sitio]) return Z.error('yaRegistrado', { sitio });
    J.registra = { sitio, t: AJ.botin.tiempo * (J.A.registra || 1) };
    Z.haceRuido(AJ, e, J.x, J.z, AJ.ruido.registrar * (J.A.ruido || 1), 'jugador');
    return Z.ok(sitio);
  };
  Z.pasoRegistro = function (AJ, e, dt, azar) {
    const J = e.jugador, R = J.registra;
    if (!R) return;
    R.t -= dt;
    if (R.t > 0) return;
    J.registra = null; e.registrados[R.sitio] = true; e.stats.registros++;
    const sale = Z.botinDe(AJ, AJ.botin.maximo + (J.A.botinExtra || 0), azar);
    for (const c of sale) J.mochila[c] = (J.mochila[c] || 0) + (c === 'cartuchos' ? AJ.botin.cartuchos : 1);
    e.eventos.push({ tipo: 'botin', cosas: sale });
  };
  Z.botinDe = function (AJ, n, azar) {
    const out = [];
    for (let i = 0; i < n; i++) { const c = Z.sortea(AJ.botin.cosas, azar); if (c !== 'nada') out.push(c); }
    return out;
  };
})(ZOM);
