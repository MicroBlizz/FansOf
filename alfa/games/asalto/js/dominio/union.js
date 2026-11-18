// Fans of Asalto · DOMINIO · La vista previa de unir dos héroes: qué quedaría si el de `hasta` absorbe al de `desde`, sin cambiar nada.
// Dice cómo es ahora el que se queda y cómo sería después (nivel, vida, daño, rareza, huecos e improntas), qué pasa con la clase del
// que se une (su impronta) y qué clases del campo bajarían al quedar un héroe menos. Las cuentas son las mismas que hace la partida
// al unir de verdad (AS.equipo.absorbe y AS.poder.deHeroe), así que lo que enseña la ventana es lo que luego ocurre. Puro.
'use strict';
AS.union = (() => {
  // cómo se ve un héroe en un equipo dado: sus cifras ya hechas con las clases activas de ese campo
  function foto(datos, equipo, h, ctx) {
    const c = AS.poder.deHeroe(datos, h, { ...ctx, nivel: AS.equipo.sinergias(datos, equipo).nivel });
    return Object.freeze({ nivel: h.nivel, rareza: h.rareza, dorado: h.dorado, vida: c.vida, dano: Math.round(c.dano), huecos: AS.heroe.huecos(datos, h),
      improntas: Object.freeze(AS.heroe.improntas(datos, h)), herencias: Object.freeze(AS.heroe.herencias(datos, h)), puedeAscender: AS.heroe.puedeAscender(datos, h) });
  }
  // qué pasa con la clase del que se une: 'nueva' (se graba en un hueco libre), 'sube' (su efecto crece), 'suma' (una marca más, aún
  // sin efecto nuevo) o 'guardada' (no hay hueco: espera a que se abra otro)
  function impronta(clase, antes, despues) {
    if (!despues.improntas.includes(clase)) return 'guardada';
    if (!antes.improntas.includes(clase)) return 'nueva';
    return (despues.herencias[clase] || 0) > (antes.herencias[clase] || 0) ? 'sube' : 'suma';
  }
  // las clases del campo que perderían nivel con la unión: [{ clase, de, a }]
  function bajan(datos, e0, e1) {
    const a = AS.equipo.sinergias(datos, e0).nivel, b = AS.equipo.sinergias(datos, e1).nivel;
    return Object.keys(a).filter(k => b[k] < a[k]).map(k => ({ clase: k, de: a[k], a: b[k] }));
  }
  // ctx: { equipo: los % del equipo puesto, reliquias: [...], objetos: [...] } (lo mismo que usa la partida al salir a luchar)
  function vista(datos, e, desde, hasta, ctx) {
    const r = AS.equipo.absorbe(datos, e, desde, hasta);
    if (!r.ok) return r;
    const se = AS.equipo.leer(e, desde), queda = AS.equipo.leer(e, hasta), c = ctx || {};
    const antes = foto(datos, e, queda, c), despues = foto(datos, r.valor.equipo, r.valor.heroe, c);
    const clase = AS.heroe.clases(datos, se)[0];
    return AS.ok(Object.freeze({ desde, hasta, seUne: se, queda, antes, despues, clase, impronta: impronta(clase, antes, despues), bajan: Object.freeze(bajan(datos, e, r.valor.equipo)) }));
  }
  return { vista };
})();
