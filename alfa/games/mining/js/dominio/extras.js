// Fans Of Mining · dominio · EXTRAS: lo que se carga con el tiempo y da premios aparte del picar. La dinamita del castor, los cofres
// (el medidor da un cofre; un cofre da un objeto que se usa cuando quieras), los correos del CEO que cruzan la pantalla, el paquete del
// sindicato cada AJ.sindicato.cada segundos y las horas extra al volver. Los premios en oro se miden con el ritmo de oro del recorrido.
'use strict';
MN.extras = (() => {
  const AJ = MN.AJ;
  const premioOro = (e, segundos) => Math.max(10, Math.round((e.r.ritmoOro || 0) * segundos));

  // ---- dinamita
  const dinamitaLista = (e, B) => e.r.dinamita >= B.recargaDinamita;
  // Resultado: MN.ok(bloques golpeados) o 'cargando'
  function lanzaDinamita(e, B, azar, sucesos) {
    if (!dinamitaLista(e, B)) return MN.error('cargando', { falta: B.recargaDinamita - e.r.dinamita });
    e.r.dinamita = 0;
    e.c.totales.dinamitas++;
    const golpe = B.dano * B.dinamita, vivos = MN.planta.vivos(e.r.planta), planta = e.r.planta;
    sucesos.push({ t: 'dinamita' });
    for (const i of vivos) if (planta === e.r.planta) MN.picar.golpea(e, B, i, golpe, azar, sucesos);
    return MN.ok(vivos.length);
  }

  // ---- cofres y objetos
  const cofres = e => e.r.objetos.cofre || 0;
  function guardaCofre(e) {
    e.r.objetos.cofre = Math.min(AJ.cofre.guardaMax, cofres(e) + 1);
    e.c.totales.cofres++;
  }
  // Resultado: MN.ok(id del objeto) o 'sin-cofres'
  function abreCofre(e, azar) {
    if (!cofres(e)) return MN.error('sin-cofres');
    e.r.objetos.cofre--;
    const o = MN.OBJETOS[Math.floor(azar() * MN.OBJETOS.length) % MN.OBJETOS.length];
    e.r.objetos[o.id] = (e.r.objetos[o.id] || 0) + 1;
    return MN.ok(o.id);
  }
  // Resultado: MN.ok(segundos que dura) o 'no-tienes' / 'desconocido'
  function usaObjeto(e, B, id) {
    if (!MN.OBJETOS.some(o => o.id === id)) return MN.error('desconocido', { id });
    if (!(e.r.objetos[id] > 0)) return MN.error('no-tienes');
    e.r.objetos[id]--;
    if (id === 'mechero') { e.r.dinamita = B.recargaDinamita; return MN.ok(0); }
    e.r.activos[id] = (e.r.activos[id] || 0) + AJ.cofre.duracion;
    return MN.ok(e.r.activos[id]);
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
  // tocar el correo en vuelo. Resultado: MN.ok({ oro, cofre }) o 'sin-correo'
  function abreCorreo(e, B, azar) {
    const k = e.c.correo;
    if (!(k.vuela > 0)) return MN.error('sin-correo');
    k.vuela = 0;
    e.c.totales.correos++;
    if (azar() < AJ.correo.cofre) { guardaCofre(e); return MN.ok({ oro: 0, cofre: 1 }); }
    const oro = premioOro(e, AJ.correo.premioSegundos) * B.correos;
    e.r.oro += oro;
    return MN.ok({ oro, cofre: 0 });
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
    if (!s.guardados) return MN.error('sin-paquetes');
    s.guardados--;
    const oro = premioOro(e, AJ.sindicato.premioSegundos);
    e.r.oro += oro;
    guardaCofre(e);
    return MN.ok({ oro, cofre: 1 });
  }

  // ---- horas extra: al volver tras s segundos fuera, se cobra el ritmo de oro a una parte, con tope de horas
  function horasExtra(e, B, s) {
    const segundos = Math.min(Math.max(0, s), AJ.horasExtra.topeHoras * 3600);
    const oro = Math.floor((e.r.ritmoOro || 0) * segundos * B.horasExtra);
    e.r.oro += oro;
    MN.trituradora.pasaEspera(e, s);
    avanzaSindicato(e, s);
    return MN.ok({ oro, segundos });
  }

  return { dinamitaLista, lanzaDinamita, cofres, guardaCofre, abreCofre, usaObjeto, gastaActivos, avanzaCorreo, abreCorreo,
    avanzaSindicato, abreSindicato, horasExtra };
})();
