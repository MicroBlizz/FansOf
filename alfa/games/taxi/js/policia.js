// Fans Of Taxi · POLICÍA: la de Microblizz. Tu nivel de búsqueda (0 a 3 en el prototipo) sube al chocar con una patrulla o al arrancar una
// huida; las patrullas dan vueltas como el tráfico y, si te ven con búsqueda (distancia y cono de visión), te persiguen. Los derribos:
// si empujas una patrulla contra un muro a velocidad, cae. Escapar: que nadie te vea durante el enfriamiento (más largo cuanto más nivel),
// o meterte en un escondite. Si te quedas casi parado con dos patrullas pegadas, te paran. Sin DOM ni three.
'use strict';
const POLICIA = (() => {
  const K = TAXI.policia;
  let patrullas = [], nivel = 0, visto = 0, enfriando = 0, paradoT = 0, azar = mulberry32(5), caidas = [];
  function crear(mundo) {
    patrullas = []; nivel = 0; visto = 0; enfriando = 0; paradoT = 0; caidas = []; azar = mulberry32((mundo.semilla || 0) + 5);
    for (let i = 0; i < K.patrullas; i++) patrullas.push(nueva());
  }
  function nueva(cerca) {
    let a;
    if (cerca) {   // aparece a unos cruces del jugador, fuera de su vista
      const n = CIUDAD.nodoCercano(cerca.x, cerca.z); const lejos = CIUDAD.nodos.filter(m => Math.abs(m.i - n.i) + Math.abs(m.j - n.j) === 2); a = (lejos.length ? lejos[(azar() * lejos.length) | 0] : n).id;
    } else a = (azar() * CIUDAD.nodos.length) | 0;
    const vec = CIUDAD.nodos[a].vecinos, b = vec[(azar() * vec.length) | 0];
    return CONDUCTOR.nuevo(a, b, 13, { tipo: 'policia', persigue: false, vida: K.vida, empujada: 0, replan: 0, sirena: 0 });
  }
  const teVe = (p, j) => {
    const dx = j.x - p.coche.x, dz = j.z - p.coche.z, d = Math.hypot(dx, dz); if (d > K.ver) return false;
    const f = COCHE.adelante(p.coche); const cos = (dx * f.x + dz * f.z) / (d || 1);
    return d < 12 || cos > Math.cos(K.cono);
  };
  const escondido = j => CIUDAD.escondites.some(e => Math.hypot(e.x - j.x, e.z - j.z) < e.radio);
  function subir(n) { nivel = clamp(Math.max(nivel, 0) + n, 0, K.porNivel.length - 1); visto = 1; }
  function poner(n) { nivel = clamp(n, 0, K.porNivel.length - 1); visto = n > 0 ? 1 : 0; if (n > 0) for (const p of patrullas) p.persigue = true; }

  // devuelve sucesos: 'visto', 'escapado', 'derribo', 'choque-policia', 'parado'
  function paso(dt, mundo, jugador, otros) {
    const sucesos = [];
    // cuántas persiguen según el nivel: se añaden o se retiran
    const deben = K.porNivel[nivel];
    let persiguen = patrullas.filter(p => p.persigue);
    while (persiguen.length < deben && nivel > 0) { const p = nueva(jugador); p.persigue = true; patrullas.push(p); persiguen.push(p); }
    const todos = patrullas.map(p => p.coche).concat(otros, [jugador]);
    let alguienVe = false;
    for (const p of patrullas) {
      const k = p.coche;
      const ve = teVe(p, jugador) && !escondido(jugador);
      if (ve && nivel > 0 && !p.persigue) { p.persigue = true; }
      if (ve && p.persigue) alguienVe = true;
      if (p.persigue) {
        p.vel = K.vel[nivel] || 24;
        // cada medio segundo, ruta hacia el cruce del jugador; cerca y a la vista, va directa
        p.replan -= dt;
        const d = Math.hypot(jugador.x - k.x, jugador.z - k.z);
        if (p.replan <= 0) { p.replan = 0.5; const mio = CIUDAD.nodoCercano(k.x, k.z).id, suyo = CIUDAD.nodoCercano(jugador.x, jugador.z).id; p.ruta = CIUDAD.camino(p.hasta, suyo); p.ruta_i = 0; if (p.ruta.length < 2 && mio !== suyo) p.ruta = null; }
        if (d < 28 && ve) {
          const px = jugador.x + Math.sin(jugador.ang) * jugador.v * 0.5, pz = jugador.z + Math.cos(jugador.ang) * jugador.v * 0.5;   // adonde va a estar
          const quiere = Math.atan2(px - k.x, pz - k.z); let dif = quiere - k.ang; while (dif > Math.PI) dif -= 2 * Math.PI; while (dif < -Math.PI) dif += 2 * Math.PI;
          COCHE.paso(k, { giro: clamp(dif * 2.5, -1, 1), gas: 1, freno: 0 }, dt, mundo, { vmax: K.vel[nivel] || 24, acel: 12 });
          const n = CIUDAD.nodoCercano(k.x, k.z); p.desde = p.hasta = n.id; p.objetivo = { x: n.x, z: n.z }; p.ruta = null;   // al volver al carril, desde el cruce más cercano
        } else CONDUCTOR.paso(p, dt, mundo, todos.filter(o => o !== jugador), azar, { vmax: K.vel[nivel] || 24, acel: 12 });
      } else { p.vel = 13; CONDUCTOR.paso(p, dt, mundo, todos, azar, { vmax: 13, acel: 8 }); }
      // golpes con el jugador: te sube la búsqueda; si la empujas fuerte, la dejas tocada
      const fuerza = COCHE.chocan(jugador, k);
      if (fuerza > 4) {
        if (nivel === 0) { subir(K.calorChoque); sucesos.push('visto'); }
        p.persigue = true; alguienVe = true;
        if (fuerza > 9) { p.empujada = K.empujon; p.vida -= 1; sucesos.push('choque-policia'); }
      }
      if (p.empujada > 0) p.empujada -= dt;
      // derribo: contra un muro rápido tras un empujón tuyo, o sin vida
      if ((k.golpe > K.derriboVel && p.empujada > 0) || p.vida <= 0) { caidas.push({ x: k.x, z: k.z, ang: k.ang, t: 2.5 }); p.muerta = true; sucesos.push('derribo'); }
    }
    patrullas = patrullas.filter(p => !p.muerta);
    for (let i = 0; i < patrullas.length; i++) for (let j = i + 1; j < patrullas.length; j++) COCHE.chocan(patrullas[i].coche, patrullas[j].coche);
    for (const c of caidas) c.t -= dt; caidas = caidas.filter(c => c.t > 0);
    // ¿te paran? casi quieto con dos patrullas pegadas
    if (nivel > 0) {
      const pegadas = patrullas.filter(p => p.persigue && Math.hypot(p.coche.x - jugador.x, p.coche.z - jugador.z) < K.pegados).length;
      if (pegadas >= 2 && COCHE.rapidez(jugador) < 3) { paradoT += dt; if (paradoT > K.parar) { sucesos.push('parado'); poner(0); for (const p of patrullas) p.persigue = false; paradoT = 0; } } else paradoT = Math.max(0, paradoT - dt);
      // escapar: nadie te ve durante el enfriamiento
      if (alguienVe) { enfriando = 0; if (visto === 0) sucesos.push('visto'); visto = 1; }
      else { enfriando += dt; if (enfriando > K.enfriar[nivel]) { poner(0); enfriando = 0; for (const p of patrullas) p.persigue = false; sucesos.push('escapado'); } }
    }
    return sucesos;
  }
  const estado = () => ({ nivel, enfriando, enfriar: K.enfriar[nivel], teVen: visto === 1 && enfriando < 0.5, paradoT });
  return { crear, paso, subir, poner, estado, get patrullas() { return patrullas; }, get caidas() { return caidas; }, get nivel() { return nivel; } };
})();
