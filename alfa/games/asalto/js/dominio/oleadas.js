// Fans of Asalto · DOMINIO · Las oleadas de una zona: de qué tipo es cada una (normal, de élite o la del jefe), qué enemigos trae, con
// cuánta fuerza (según la oleada y la dificultad elegida) y en qué tanda entra cada uno. En el modo sin fin la fuerza sigue subiendo y los jefes vuelven por turnos.
// El campo de batalla mide 540 x 420 (medidas de la batalla, no de la pantalla). Puro: el azar se le pasa.
'use strict';
AS.oleadas = (() => {
  // dónde espera la primera tanda (a la vista, a la derecha) y por dónde entran las siguientes
  const SITIOS = [[400, 120], [470, 180], [520, 110], [420, 250], [495, 300], [395, 360], [460, 395], [525, 240]];

  function tipo(datos, zona, n, sinFin) {
    const P = datos.partida;
    if (sinFin) return n % datos.sinFin.jefeCada === 0 ? 'jefe' : n % P.eliteCada === 0 ? 'elite' : 'normal';
    if (n >= datos.zonas[zona].oleadas) return 'jefe';
    return n % P.eliteCada === 0 ? 'elite' : 'normal';
  }
  // lo que multiplica la dificultad elegida (el modo sin fin va siempre en la primera)
  const dificultad = (datos, dif, sinFin) => (sinFin ? 1 : (datos.dificultades[dif] || datos.dificultades[0]).fuerza);
  function fuerza(datos, zona, n, sinFin, dif) {
    const Z = datos.zonas[zona];
    if (!sinFin) return Z.fuerza(n) * dificultad(datos, dif, sinFin);
    return Z.fuerza(Z.oleadas) * (1 + datos.sinFin.fuerzaPorOleada * n);
  }
  function jefeDe(datos, zona, n, sinFin) {
    if (!sinFin) return datos.zonas[zona].jefe;
    const J = datos.sinFin.jefes;
    return J[(Math.floor(n / datos.sinFin.jefeCada) - 1 + zona) % J.length];
  }
  // qué enemigos de la zona han salido ya a esta altura: uno nuevo cada 2 oleadas
  const conocidos = (Z, n, sinFin) => (sinFin ? Z.enemigos : Z.enemigos.slice(0, 1 + Math.floor((n - 1) / 2)));

  // reparte los tipos: los que corren, como mucho uno de cada cinco
  function reparto(datos, tipos, cuantos, azar) {
    const lista = [], topeCorre = Math.floor(cuantos / 5);
    let corren = 0;
    for (let i = 0; i < cuantos; i++) {
      let t = azar.elige(tipos);
      if (datos.enemigos[t].corre && ++corren > topeCorre) t = tipos[0];
      lista.push(t);
    }
    return lista;
  }
  function coloca(datos, lista, azar) {
    const porTanda = datos.partida.porTanda;
    return lista.map((e, i) => {
      const tanda = Math.floor(i / porTanda), s = SITIOS[(i % porTanda + tanda * 3) % SITIOS.length];
      return { ...e, tanda, x: s[0] + (tanda ? 170 : 0) + Math.round(azar.entre(-10, 10)), y: s[1] + Math.round(azar.entre(-10, 10)) };
    });
  }
  // la oleada n (desde 1) de la zona, en la dificultad dif (0, 1 o 2: multiplica la fuerza de todos, jefe incluido): { n, tipo, fuerza, jefe, enemigos: [{ tipo, fuerza, tanda, x, y, jefe, elite }] }
  function genera(datos, zona, n, azar, sinFin, dif) {
    const Z = datos.zonas[zona], t = tipo(datos, zona, n, sinFin), f = fuerza(datos, zona, n, sinFin, dif);
    const tipos = conocidos(Z, n, sinFin);
    let cuantos = sinFin ? Math.min(18, 8 + Math.floor(n / 3)) : Z.cuantos(n);
    if (t === 'jefe') cuantos = Math.ceil(cuantos / 3);
    if (t === 'elite') cuantos = Math.ceil(cuantos * 0.7);   // en la de élite vienen menos, pero con un campeón
    const lista = reparto(datos, tipos, cuantos, azar).map(tp => ({ tipo: tp, fuerza: f }));
    const jefe = t === 'jefe' ? jefeDe(datos, zona, n, sinFin) : null;
    if (t === 'elite') { const serios = tipos.filter(tp => !datos.enemigos[tp].corre); lista.unshift({ tipo: serios[serios.length - 1], fuerza: f * 2, elite: true }); }
    const enemigos = coloca(datos, lista, azar);
    if (jefe) enemigos.unshift({ tipo: jefe, fuerza: sinFin ? f / Z.fuerza(Z.oleadas) : dificultad(datos, dif, sinFin), jefe: true, tanda: 0, x: 470, y: 250 });
    return { n, tipo: t, fuerza: f, jefe, enemigos };
  }
  return { tipo, fuerza, genera };
})();
