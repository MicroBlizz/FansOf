// Fans Of Karts · dominio · OBJETOS (tercera tanda, ADR 048 opción B): las reglas de los objetos que no son dibujo, sonido ni red: a quién le toca cada uno,
// qué sale de la caja de botín, cuándo conviene usarlos y qué monedas atrae el imán. Funciones puras sobre karts y números (la distancia de vía
// y lo que mide la pista llegan como argumentos). Los avisos, chispas y mensajes de red siguen en objetos.js y objetos-2.js, que las llaman.
'use strict';
KD.objetos = Object.freeze({
  // la caja de botín según el azar r (0 a 1): casi siempre un spray gris, a veces un Hotfix y rara vez un Pase de batalla
  premioDelBotin(r) { return r < 0.55 ? 'comun' : r < 0.85 ? 'hotfix' : 'pase'; },
  // a quien le toca el rival que la máquina o el jugador deja detrás: el primero, o el segundo si el primero eres tú
  rivalDelPuesto(orden, k) { return orden[0] === k ? orden[1] : orden[0]; },
  // el que va delante más cerca (como mucho a `max` unidades; pasoVia = lo que mide un tramo de vía)
  delanteDe(k, karts, max, pasoVia) {
    let mejor = null, d0 = max / pasoVia;
    for (const o of karts) { if (o === k || o.fin || o.estado === 'cae') continue; const d = o.avance - k.avance; if (d > 0 && d < d0) { d0 = d; mejor = o; } }
    return mejor;
  },
  // los que están a menos de `max` unidades
  cercaDe(k, karts, max) { return karts.filter(o => o !== k && !o.fin && Math.hypot(o.x - k.x, o.y - k.y) < max); },
  // los que van por delante en la carrera (sin contar a los que ya han acabado)
  porDelante(k, karts) { return karts.filter(o => o !== k && !o.fin && o.avance > k.avance); },
  // el kart que tiene delante un Nerf (el más cercano a menos de 9 casillas, sin contar a su autor ni a los que caen); N = casillas de la vía
  objetivoDelNerf(o, karts, N, difVia) {
    let obj = null, cerca = 9;
    for (const k of karts) {
      if (k === o.autor || k.estado === 'cae') continue;
      const d = difVia(k.idx - (((o.idx % N) + N) % N), N);
      if (d > -0.6 && d < cerca) { cerca = d; obj = k; }
    }
    return obj;
  },
  // las monedas que el imán se lleva: las que están listas y a menos de `radio`
  monedasAlAlcance(k, monedas, radio) { return monedas.filter(m => m.t <= 0 && Math.hypot(m.x - k.x, m.y - k.y) < radio); },
  // ¿hay un kart que cumpla cond(d, o), con d = su distancia de vía (positiva si va delante)?
  hayKartA(k, karts, cond, difVia, N) { return karts.some(o => o !== k && cond(difVia(o.idx - k.idx, N), o)); },
  // cuándo la máquina usa cada objeto: solo con alguien delante y cerca (Nerf) o si le pisan los talones (Parche)
  iaNerf(d, o, k) { return d > 1 && d < 16 && Math.abs(o.lat - k.lat) < 30; },
  iaParche(d) { return -d > 1 && -d < 9; },
  // los turbos, en recta: la curvatura de más adelante es casi nula
  iaEnRecta(curvaAdelante) { return curvaAdelante < 0.006; },
  // lo mismo que un objeto con delante cercano: hay alguien a menos de `max` y casi en su carril
  iaDelante(o, k) { return !!o && Math.abs(o.lat - k.lat) < 30; },
  // al menos n karts delante a menos de `max` unidades de avance
  iaVarios(k, karts, n, max, pasoVia) { return KD.objetos.porDelante(k, karts).filter(o => (o.avance - k.avance) * pasoVia < max).length >= n; },
});
