// Fans Of Paperwork · dominio · EXTRAS: lo que se carga con el tiempo y da premios aparte de rebuscar. La estantería que vuelca el castor, los cofres
// (el medidor da un cofre; un cofre da un objeto que se usa cuando quieras), los correos del CEO que cruzan la pantalla, el paquete del
// sindicato cada AJ.sindicato.cada segundos y las horas extra al volver. Los premios en oro se miden con el ritmo de oro del recorrido.
'use strict';
PW.extras = (() => {
  const AJ = PW.AJ;
  const premioOro = (e, segundos) => Math.max(10, Math.round((e.r.ritmoOro || 0) * segundos));

  // ---- estanteria
  const estanteriaLista = (e, B) => e.r.estanteria >= B.recargaEstanteria;
  // Resultado: PW.ok(archivadores rebuscados) o 'cargando'
  function lanzaEstanteria(e, B, azar, sucesos) {
    if (!estanteriaLista(e, B)) return PW.error('cargando', { falta: B.recargaEstanteria - e.r.estanteria });
    e.r.estanteria = 0;
    e.c.totales.estanterias++;
    const fuerza = B.dano * B.estanteria, llenos = PW.planta.llenos(e.r.planta), planta = e.r.planta;
    sucesos.push({ t: 'estanteria' });
    for (const i of llenos) if (planta === e.r.planta) PW.rebuscar.rebusca(e, B, i, fuerza, azar, sucesos);
    return PW.ok(llenos.length);
  }

  // ---- cofres y objetos
  const cofres = e => e.r.objetos.cofre || 0;
  function guardaCofre(e) {
    e.r.objetos.cofre = Math.min(AJ.cofre.guardaMax, cofres(e) + 1);
    e.c.totales.cofres++;
  }
  // Resultado: PW.ok(id del objeto) o 'sin-cofres'
  function abreCofre(e, azar) {
    if (!cofres(e)) return PW.error('sin-cofres');
    e.r.objetos.cofre--;
    const o = PW.OBJETOS[Math.floor(azar() * PW.OBJETOS.length) % PW.OBJETOS.length];
    e.r.objetos[o.id] = (e.r.objetos[o.id] || 0) + 1;
    return PW.ok(o.id);
  }
  // Resultado: PW.ok(segundos que dura) o 'no-tienes' / 'desconocido'
  function usaObjeto(e, B, id) {
    if (!PW.OBJETOS.some(o => o.id === id)) return PW.error('desconocido', { id });
    if (!(e.r.objetos[id] > 0)) return PW.error('no-tienes');
    e.r.objetos[id]--;
    if (id === 'silbato') { e.r.estanteria = B.recargaEstanteria; return PW.ok(0); }
    e.r.activos[id] = (e.r.activos[id] || 0) + AJ.cofre.duracion;
    return PW.ok(e.r.activos[id]);
  }
  function gastaActivos(e, dt) { for (const k in e.r.activos) e.r.activos[k] = Math.max(0, e.r.activos[k] - dt); }

  // ---- correos del CEO: c.correo.falta = segundos hasta el siguiente; vuela = segundos que le quedan en pantalla
  function avanzaCorreo(e, dt, azar, sucesos) {
    const k = e.c.correo;
    if (k.vuela > 0) { k.vuela = Math.max(0, k.vuela - dt); return; }
    k.falta -= dt;
    if (k.falta > 0) return;
    k.vuela = AJ.correo.vuelo;
    k.x = azar();
    k.falta = AJ.correo.cadaMin + azar() * AJ.correo.cadaExtra;
    sucesos.push({ t: 'correo' });
  }
  // tocar el correo en vuelo. Resultado: PW.ok({ oro, cofre, pedido? }) (puede traer un pedido del CEO en vez de premio) o 'sin-correo'
  function abreCorreo(e, B, azar) {
    const k = e.c.correo;
    if (!(k.vuela > 0)) return PW.error('sin-correo');
    k.vuela = 0;
    e.c.totales.correos++;
    if (azar() < AJ.correo.cofre) { guardaCofre(e); return PW.ok({ oro: 0, cofre: 1 }); }
    if (!e.r.pedido && !PW.trituradora.atascando(e) && azar() < AJ.pedido.prob) return PW.ok({ oro: 0, cofre: 0, pedido: PW.encargos.abre(e) });
    const oro = premioOro(e, AJ.correo.premioSegundos) * B.correos;
    e.r.oro += oro;
    return PW.ok({ oro, cofre: 0 });
  }

  // ---- paquete del sindicato
  function avanzaSindicato(e, dt) {
    const s = e.c.sindicato;
    if (s.guardados >= AJ.sindicato.guardaMax) return;
    s.falta -= dt;
    while (s.falta <= 0 && s.guardados < AJ.sindicato.guardaMax) { s.guardados++; s.falta += AJ.sindicato.cada; }
  }
  function abreSindicato(e) {
    const s = e.c.sindicato;
    if (!s.guardados) return PW.error('sin-paquetes');
    s.guardados--;
    const oro = premioOro(e, AJ.sindicato.premioSegundos);
    e.r.oro += oro;
    guardaCofre(e);
    return PW.ok({ oro, cofre: 1 });
  }

  // ---- horas extra: al volver tras s segundos fuera, se cobra el ritmo de oro a una parte, con tope de horas
  function horasExtra(e, B, s) {
    const segundos = Math.min(Math.max(0, s), AJ.horasExtra.topeHoras * 3600);
    const oro = Math.floor((e.r.ritmoOro || 0) * segundos * B.horasExtra);
    e.r.oro += oro;
    PW.trituradora.pasaEspera(e, s);
    avanzaSindicato(e, s);
    return PW.ok({ oro, segundos });
  }

  return { premioOro, estanteriaLista, lanzaEstanteria, cofres, guardaCofre, abreCofre, usaObjeto, gastaActivos, avanzaCorreo, abreCorreo,
    avanzaSindicato, abreSindicato, horasExtra };
})();
