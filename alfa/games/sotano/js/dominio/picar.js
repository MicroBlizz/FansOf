// Fans Of Sótano · dominio · PICAR: lo que pasa al golpear y romper bloques. Un golpe puede ser crítico; un bloque roto suelta material
// (más en plantas dorada o arcoíris y en bloques triples), la Recicladora lo convierte en piezas, una parte se vende por oro, se gana
// experiencia, cuenta para el expediente del material y llena el medidor de cofres. Al limpiar la planta se baja a la siguiente.
// Cada función recibe e (la partida), B (SO.bonos.calcula(e)), el azar (función 0 a 1) y una lista de sucesos donde apunta lo que pasa.
'use strict';
SO.picar = (() => {
  const AJ = SO.AJ, C = SO.curvas;

  // el daño de un golpe de d de base: normal, crítico o súper crítico
  function tiraGolpe(B, d, azar) {
    if (azar() >= B.crit) return { d, tipo: 'normal' };
    if (azar() < B.superCrit) return { d: d * AJ.pico.critMulti * AJ.pico.superMulti, tipo: 'super' };
    return { d: d * AJ.pico.critMulti, tipo: 'crit' };
  }
  function botinDe(e, B, m, azar) {
    const rango = C.rangoExpediente(e.c.expedientes[m] || 0);
    const roca = azar() < B.multiRoca ? AJ.especiales.multiRocaMulti : 1;
    return Math.max(1, Math.round(SO.planta.multiPlanta(e.r.planta) * roca * B.botin * AJ.expediente.premio[rango]));
  }
  // la Recicladora: los materiales de m que llegan a una receta pasan a piezas; una parte (r.venta) se vende al momento
  function recicla(e, B, m, azar, sucesos) {
    const r = e.r, receta = Math.max(1, Math.round(C.receta(m) * B.coste));
    const lotes = Math.floor(r.materiales[m] / receta);
    if (!lotes) return;
    r.materiales[m] -= lotes * receta;
    const t = azar(), multi = t < B.x3 ? 3 : t < B.x3 + B.x2 ? 2 : 1;
    const piezas = lotes * multi, vendidas = Math.floor(piezas * r.venta);
    const oro = Math.round(vendidas * C.valorPieza(m) * B.precio);
    r.piezas[m] += piezas - vendidas;
    r.oro += oro;
    e.c.totales.oro += oro;
    if (multi > 1) sucesos.push({ t: 'reciclado', m, multi });
  }
  function ganaXp(e, B, m, sucesos) {
    const r = e.r, tope = C.topeNivel(e.c.trituradora.nivel);
    r.xp += (m + 1) * B.xp;
    while (r.nivel < tope && r.xp >= C.xpParaSubir(r.nivel)) {
      r.xp -= C.xpParaSubir(r.nivel);
      r.nivel++;
      e.c.nivelMax = Math.max(e.c.nivelMax, r.nivel);
      sucesos.push({ t: 'nivel', n: r.nivel });
    }
    if (r.nivel >= tope) r.xp = Math.min(r.xp, C.xpParaSubir(r.nivel));
  }
  function llenaMedidor(e, B, sucesos) {
    const r = e.r;
    r.medidor += B.medidor;
    if (r.medidor < AJ.cofre.medidor) return;
    r.medidor -= AJ.cofre.medidor;
    SO.extras.guardaCofre(e);
    sucesos.push({ t: 'cofre' });
  }
  function rompe(e, B, m, i, azar, sucesos) {
    const n = botinDe(e, B, m, azar);
    e.r.materiales[m] += n;
    e.r.rotos++;
    e.c.expedientes[m] = (e.c.expedientes[m] || 0) + 1;
    e.c.totales.bloques++;
    const antes = C.rangoExpediente(e.c.expedientes[m] - 1);
    if (C.rangoExpediente(e.c.expedientes[m]) > antes) sucesos.push({ t: 'expediente', m, rango: antes + 1 });
    sucesos.push({ t: 'roto', i, m, n });
    recicla(e, B, m, azar, sucesos);
    ganaXp(e, B, m, sucesos);
    llenaMedidor(e, B, sucesos);
  }
  function bajaPlanta(e, B, azar, sucesos) {
    const r = e.r, n = r.planta.n + 1;
    r.planta = SO.planta.crea(n, azar, B, e.c.expedientes);
    r.plantaMax = Math.max(r.plantaMax, n);
    e.c.plantaMax = Math.max(e.c.plantaMax, n);
    sucesos.push({ t: 'planta', n, especial: r.planta.especial, zona: C.zonaDe(n) });
  }
  // golpea el bloque i con d de base (ya con críticos tirados fuera si hace falta). Devuelve true si el bloque se rompe
  function golpea(e, B, i, d, azar, sucesos) {
    const res = SO.planta.golpea(e.r.planta, i, d);
    if (!res.ok) return false;
    if (!res.valor.roto) return false;
    rompe(e, B, res.valor.m, i, azar, sucesos);
    if (SO.planta.limpia(e.r.planta)) bajaPlanta(e, B, azar, sucesos);
    return true;
  }
  // un golpe del pico (o de un toque) con su tirada de críticos, al bloque i; y, con suerte de radio, a un vecino
  function golpeDePico(e, B, i, base, azar, sucesos) {
    const g = tiraGolpe(B, base, azar), planta = e.r.planta;
    sucesos.push({ t: 'golpe', i, d: g.d, tipo: g.tipo });
    const vecino = (i + 1) % SO.AJ.planta.columnas ? i + 1 : i - 1;   // el de la derecha; al final de la fila, el de la izquierda
    const conRadio = azar() < B.radio && vecino < planta.bloques.length && planta.bloques[vecino] && planta.bloques[vecino].vida > 0;
    golpea(e, B, i, g.d, azar, sucesos);
    if (conRadio && planta === e.r.planta) golpea(e, B, vecino, g.d, azar, sucesos);
  }

  return { tiraGolpe, golpea, golpeDePico, recicla };
})();
