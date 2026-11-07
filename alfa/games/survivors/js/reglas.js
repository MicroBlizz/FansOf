// Fans of Survivors · Reglas de las mecánicas nuevas (dominio, sin pantalla): qué arma puede evolucionar, cuándo llega la siguiente
// oleada de choque, cuánto escala un jefe, a quién apuntan las armas, quién puede curar a quién y qué sitio del mapa sale.
// No usa reloj, azar, SAVE ni DOM: el azar se le pasa como función. Los datos, en js/datos-mecanicas.js. Tests: tests/survivors/.
'use strict';

const SVR = (() => {
  // la mejora pareja de un arma (por su id o, si es de otra facción, por su tipo de disparo); null si no tiene
  function pareja(idArma, arma, parejas, porTipo) {
    return parejas[idArma] || (arma && porTipo[arma.tipo]) || null;
  }
  // las armas que ya pueden evolucionar: nivel máximo + su pareja cogida + no evolucionada aún
  function evolucionesListas(armas, pasivas, evolucionadas, nivelMax, parejaDe) {
    const L = [];
    for (const k in armas) {
      if (armas[k] < nivelMax || evolucionadas[k]) continue;
      const p = parejaDe(k);
      if (p && (pasivas[p] || 0) > 0) L.push(k);
    }
    return L;
  }
  // las cifras de un arma evolucionada a partir de las de nivel máximo (no cambia el objeto que recibe)
  function aplicarEvolucion(v, E) {
    const r = Object.assign({}, v);
    if (typeof r.dano === 'number') r.dano *= E.dano;
    if (typeof r.n === 'number') r.n += E.n;
    if (typeof r.r === 'number') r.r *= E.r;
    if (typeof r.cd === 'number') r.cd *= E.cd;
    return r;
  }
  // segundos hasta la siguiente oleada de choque (entre cadaMin y cadaMax)
  const esperaChoque = (C, azar) => C.cadaMin + (C.cadaMax - C.cadaMin) * azar();
  // cuántos enemigos trae una oleada de choque en el minuto `min`
  const tamChoque = (C, min) => C.grupo + C.porMinuto * min;
  // lo que se multiplican la vida y el daño de un jefe que sale en el segundo t
  const escalaJefe = (J, t) => 1 + t / J.escalaCada;
  // lo rápido que salen los enemigos normales (1 = normal); con un jefe vivo, más despacio
  const ritmoOleada = (J, hayJefe) => (hayJefe ? J.ritmoConJefe : 1);
  // lo «cerca» que parece un enemigo al apuntar: los curanderos y los que tienen poca vida parecen más cerca (se eligen antes)
  function distanciaApuntar(d2, esCurandero, fraccionVida, C) {
    const vida = 1 - C.pesoVidaBaja + C.pesoVidaBaja * Math.max(0, Math.min(1, fraccionVida));
    return d2 * (esCurandero ? C.prioridad : 1) * vida;
  }
  // ¿puede este curandero curar a ese enemigo? Ni a sí mismo ni a otro curandero (así no se vuelven inmortales en grupo)
  const puedeCurar = (curador, objetivo) => curador !== objetivo && !objetivo.esCurandero && objetivo.vida < objetivo.vidaMax;
  // ¿puede salir otro curandero?
  const caben = (vivos, C) => vivos < C.maxVivos;
  // qué sitio del mapa sale (según los pesos) y dónde: a una distancia entre distMin y distMax del jugador
  function sorteaSitio(S, x, y, azar) {
    let tot = 0; for (const k in S.pesos) tot += S.pesos[k];
    let r = azar() * tot, tipo = Object.keys(S.pesos)[0];
    for (const k in S.pesos) { r -= S.pesos[k]; if (r <= 0) { tipo = k; break; } }
    const a = azar() * Math.PI * 2, d = S.distMin + (S.distMax - S.distMin) * azar();
    return { tipo, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d };
  }
  // el poder que da un altar (uno de los de S.altar.poderes, al azar)
  function sorteaPoder(A, azar) {
    const L = Object.keys(A.poderes);
    return L[Math.min(L.length - 1, Math.floor(azar() * L.length))];
  }
  // la cura de una fuente en dt segundos, sin pasar de lo que le queda; devuelve { cura, queda }
  function bebeFuente(F, vidaMax, queda, dt) {
    const cura = Math.min(queda, F.curaPorSeg * vidaMax * dt);
    return { cura, queda: queda - cura };
  }
  // el progreso de abrir un cofre con candado: sube si estás al lado y baja (despacio) si te vas; abierto al llegar a 1
  function progresoCandado(K, antes, cerca, dt) {
    const p = cerca ? antes + dt / K.abrir : antes - K.olvida * dt / K.abrir;
    return Math.max(0, Math.min(1, p));
  }
  return Object.freeze({ pareja, evolucionesListas, aplicarEvolucion, esperaChoque, tamChoque, escalaJefe, ritmoOleada,
    distanciaApuntar, puedeCurar, caben, sorteaSitio, sorteaPoder, bebeFuente, progresoCandado });
})();
