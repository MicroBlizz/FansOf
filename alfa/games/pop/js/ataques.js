// Fans of Pop · ATAQUES DE LOS COMPAÑEROS, las cuentas (tarea #160, ADR 197). Dominio puro: sin reloj, azar, SAVE ni dibujo
// (el tiempo `u` y el azar `rnd` entran como parámetros). Dice por dónde vuela un compañero de su hueco a la burbuja según la
// vuelo propio del compañero (o la forma de su habilidad, de respaldo), cuánto se estira al despegar, cuántas cositas suelta la estela por segundo y en la
// ráfaga del golpe (intensidad FIESTA, la que eligió Pepins en el boceto) y qué forma, cositas y estilo ('hada' o 'acuarela',
// revisión cozy del 21-11-2026) tiene cada compañero. Un compañero sin fila en PP_ATAQUES.cositas usa la forma de su
// habilidad, una gotita de su color y el estilo que le toca por su id. Lo pinta js/ataques-fx.js con js/ataques-estilos.js.
'use strict';
const PP_ATAQUE = (() => {
  const f = o => Object.freeze(o);
  const lerp = (a, b, k) => a + (b - a) * k;
  const sube = k => 1 - Math.pow(1 - k, 3);        // sale rápido y frena
  const acelera = k => k * k;                       // sale despacio y llega rápido
  const acota = u => Math.max(0, Math.min(1, u));
  const recta = (a, b, e) => ({ x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e) });
  // bezier cuadrática de a a b con el punto de control q
  const curva = (a, q, b, e) => { const m = 1 - e; return { x: m * m * a.x + 2 * m * e * q.x + e * e * b.x, y: m * m * a.y + 2 * m * e * q.y + e * e * b.y }; };
  const con = (p, rot) => ({ x: p.x, y: p.y, rot });
  // cada ruta va de a (el hueco del equipo) a b (la burbuja) con u de 0 a 1: en u = 0 está en a y en u = 1 en b
  const RUTAS = f({
    // un brinco alto en parábola (el de siempre)
    salto: (a, b, u) => { const p = recta(a, b, u); return con({ x: p.x, y: p.y - 220 * 4 * u * (1 - u) }, Math.sin(u * Math.PI) * 0.5); },
    // derecho a la burbuja, acelerando
    recto: (a, b, u) => con(recta(a, b, acelera(u)), (Math.atan2(b.y - a.y, b.x - a.x) + Math.PI / 2) * 0.35),
    // un arco ancho por un lado del tablero
    arco: (a, b, u) => con(curva(a, { x: Math.min(a.x, b.x) - 200, y: Math.min(a.y, b.y) - 160 }, b, sube(u)), Math.sin(u * Math.PI * 2) * 0.25),
    // sube por encima de la burbuja y cae a plomo sobre ella
    lluvia: (a, b, u) => {
      const alto = { x: b.x, y: b.y - 300 };
      if (u < 0.6) return con(curva(a, { x: lerp(a.x, b.x, 0.3), y: alto.y }, alto, sube(u / 0.6)), Math.sin(u / 0.6 * Math.PI) * 0.3);
      return con(recta(alto, b, acelera((u - 0.6) / 0.4)), 0);
    },
    // sube derecho hacia arriba (al contador) y baja sobre la burbuja
    subida: (a, b, u) => { const e = sube(u), m = 1 - e, q1 = { x: a.x, y: a.y - 420 }, q2 = { x: b.x, y: b.y - 320 };
      return con({ x: m * m * m * a.x + 3 * m * m * e * q1.x + 3 * m * e * e * q2.x + e * e * e * b.x, y: m * m * m * a.y + 3 * m * m * e * q1.y + 3 * m * e * e * q2.y + e * e * e * b.y }, 0); },
    // un chorro muy alto que se mece, como una fuente de monedas
    fuente: (a, b, u) => { const p = recta(a, b, u); return con({ x: p.x + Math.sin(u * Math.PI * 4) * 30 * Math.sin(u * Math.PI), y: p.y - 340 * 4 * u * (1 - u) }, Math.sin(u * Math.PI * 4) * 0.3); },
    // da vueltas alrededor de la recta (el tiempo que se rebobina)
    espiral: (a, b, u) => { const p = recta(a, b, u), r = 90 * Math.sin(u * Math.PI), g = u * Math.PI * 4;
      return con({ x: p.x + Math.cos(g) * r - r, y: p.y + Math.sin(g) * r }, u * Math.PI * 4); },
    // en zigzag, como un rayo
    zigzag: (a, b, u) => { const p = recta(a, b, u), d = Math.hypot(b.x - a.x, b.y - a.y) || 1, n = { x: -(b.y - a.y) / d, y: (b.x - a.x) / d };
      const tri = 2 * Math.abs(2 * ((u * 3) % 1) - 1) - 1, o = 70 * tri * Math.sin(u * Math.PI);
      return con({ x: p.x + n.x * o, y: p.y + n.y * o }, tri * 0.3); },
    // tres botes que van menguando (revisión del 21-11-2026: un ataque propio por compañero)
    rebote: (a, b, u) => { const k = u * 3, i = Math.min(2, Math.floor(k)), e = k - i, p = recta(a, b, u);
      return con({ x: p.x, y: p.y - [150, 105, 70][i] * 4 * e * (1 - e) }, (e - 0.5) * 0.3); },
    // ondulando como una ola a lo largo de la recta
    ola: (a, b, u) => { const p = recta(a, b, u), d = Math.hypot(b.x - a.x, b.y - a.y) || 1, o = 60 * Math.sin(u * Math.PI * 3) * Math.sin(u * Math.PI);
      return con({ x: p.x - (b.y - a.y) / d * o, y: p.y + (b.x - a.x) / d * o }, Math.cos(u * Math.PI * 3) * 0.35); },
    // estrella fugaz: sube a un lado de la burbuja y baja en diagonal, deprisa
    fugaz: (a, b, u) => {
      const lado = b.x >= a.x ? 1 : -1, alto = { x: b.x + 220 * lado, y: Math.min(a.y, b.y) - 340 };
      if (u < 0.4) return con(curva(a, { x: a.x, y: alto.y }, alto, sube(u / 0.4)), 0);
      return con(recta(alto, b, acelera((u - 0.4) / 0.6)), -lado * 0.6);
    },
    // como una hoja: sube y baja meciéndose de lado a lado
    planeo: (a, b, u) => {
      const alto = { x: lerp(a.x, b.x, 0.5), y: Math.min(a.y, b.y) - 260 };
      if (u < 0.35) return con(curva(a, { x: a.x, y: alto.y }, alto, sube(u / 0.35)), 0);
      const e = (u - 0.35) / 0.65, vaiven = Math.sin(e * Math.PI * 3);
      return con({ x: lerp(alto.x, b.x, e) + vaiven * 70 * (1 - e), y: lerp(alto.y, b.y, e) }, vaiven * 0.5);
    },
    // cohete: sube rápido en zigzag por encima del tablero y cae en picado
    cohete: (a, b, u) => {
      const alto = { x: lerp(a.x, b.x, 0.5), y: Math.min(a.y, b.y) - 320 };
      if (u >= 0.7) return con(recta(alto, b, acelera((u - 0.7) / 0.3)), Math.atan2(b.y - alto.y, b.x - alto.x) - Math.PI / 2);
      const k = u / 0.7, p = recta(a, alto, sube(k)), tri = 2 * Math.abs(2 * ((k * 4) % 1) - 1) - 1;
      return con({ x: p.x + 45 * tri * Math.sin(k * Math.PI), y: p.y }, tri * 0.4);
    },
  });
  // dónde está el compañero en el vuelo `vuelo` (una de RUTAS; si no existe, el salto) en u ∈ [0, 1]
  const ruta = (vuelo, a, b, u) => (RUTAS[vuelo] || RUTAS.salto)(a, b, acota(u));
  // aplastar y estirar al despegar: se achata, sale estirado hacia arriba y vuela así; devuelve [sx, sy]
  function estira(u) {
    const k = acota(u);
    if (k < 0.15) { const e = k / 0.15; return [1.2 - 0.32 * e, 0.8 + 0.36 * e]; }
    return [0.88, 1.16];
  }
  // las intensidades del boceto (en píxeles del juego, 540 de ancho); Pop usa FIESTA: el doble de cositas que NORMAL,
  // golpe grande con doble onda y el tablero tiembla
  const INTENSIDAD = f({
    normal: f({ porSegundo: 21, rafaga: 10, gotitas: 5, ondas: f([f({ retraso: 0, k: 1 })]), golpe: 1, temblor: 0, tam: 13, estela: 1 }),
    // temblor 0.3: el tablero se mece unos 2 px (pintar.js lo multiplica por 7), un vaivén suave y no un golpe (Pepins, 21-11-2026)
    fiesta: f({ porSegundo: 45, rafaga: 20, gotitas: 10, ondas: f([f({ retraso: 0, k: 1 }), f({ retraso: 0.12, k: 1.3 })]), golpe: 1.45, temblor: 0.3, tam: 15, estela: 1.35 }),
  });
  const E = 1.7;   // píxeles del juego (540 de ancho) por píxel del boceto cozy (320): las velocidades del boceto, a escala
  // el confeti pastel de la ráfaga y de las manchas del golpe en acuarela
  const CONFETI = f(['#ffb8d9', '#ffe08a', '#b8ecc0', '#bcdcff', '#e0c8ff', '#ffd0b0']);
  const FIESTA = INTENSIDAD.fiesta;
  // cuántas cositas suelta la estela en un paso de dt segundos: `acc` es lo que sobró del paso anterior (fracción)
  function emite(acc, dt, porSegundo = FIESTA.porSegundo) { const total = acc + porSegundo * dt, n = Math.floor(total); return f({ n, acc: total - n }); }
  // lo que añade cada golpe a sus ondas (los cozy de Pepins), siempre con las cositas del compañero: una flor de burbujitas,
  // un destello de escarcha, un brillo, una onda más y, desde la revisión del 21-11-2026, una ola de agua con perlita, fuegos
  // artificiales pastel, pompas de jabón, una mancha de tinta pastel, un chaparrón de cositas y un corro de cositas que gira
  const EXTRA = f({ estallido: 'flor', zarpazo: 'escarcha', pellizco: 'escarcha', rayo: 'escarcha', chispa: 'chispa', destello: 'chispa', tintineo: 'chispa', onda: 'anillo', remolino: 'anillo',
    ola: 'ola', fuegos: 'fuegos', pompas: 'pompas', tinta: 'tinta', chaparron: 'chaparron', carrusel: 'carrusel' });
  // el golpe al llegar: sus ondas, su dibujo extra, cuántas cositas y gotitas salen y cuánto tiembla (`grande`: el del CEO)
  function golpe(golpeId, grande = false, I = FIESTA) {
    const m = grande ? 1.4 : 1, k = I.golpe * m;
    const ondas = I.ondas.map(o => f({ retraso: o.retraso, k: o.k * k }));
    const extra = EXTRA[golpeId] || null;
    if (extra === 'anillo') ondas.push(f({ retraso: 0.24, k: 1.6 * k }));
    return f({ ondas: f(ondas), extra, k, rafaga: Math.round(I.rafaga * m), gotitas: Math.round(I.gotitas * m), vel: 130 * E * k, temblor: I.temblor * (grande ? 1.3 : 1) });
  }
  // el estilo de un compañero sin fila (uno nuevo): siempre el mismo para el mismo id, por la suma de sus letras
  function estiloPorId(id, estilos = PP_ATAQUES.estilos) {
    let suma = 0;
    for (const letra of String(id)) suma += letra.codePointAt(0);
    return estilos[suma % estilos.length];
  }
  // qué ataque tiene un compañero: el suyo propio (su fila de PP_ATAQUES.cositas: vuelo, golpe, cositas, color y estilo); la
  // habilidad `hab` (PP_COMP.INFO[id].hab) pone el sonido y, a quien no tenga fila, la forma de respaldo con una gotita de `color`
  function de(id, hab, color, datos = PP_ATAQUES) {
    const formaId = datos.porHabilidad[hab] || 'salto', forma = datos.formas[formaId], co = datos.cositas[id];
    if (!co) return f({ id, formaId, vuelo: forma.vuelo, golpe: forma.golpe, sonido: forma.sonido, color, piezas: f(['gotita']), estilo: estiloPorId(id, datos.estilos) });
    return f({ id, formaId, vuelo: co.vuelo, golpe: co.golpe, sonido: forma.sonido, color: co.color, piezas: co.piezas, estilo: co.estilo });
  }
  const elige = (lista, rnd) => lista[Math.min(lista.length - 1, Math.floor(rnd() * lista.length))];
  const entre = (a, b, rnd) => a + rnd() * (b - a);
  // una cosita de la estela en (x, y): una de las piezas del `ataque` (de su color, para el repuesto) o, a veces, un
  // corazoncito; flota un poco y se apaga despacio (los tiempos del boceto cozy)
  function cosita(x, y, ataque, rnd, tam = FIESTA.tam) {
    const vida = entre(0.8, 1.3, rnd), pieza = rnd() < 0.18 ? 'corazon' : elige(ataque.piezas, rnd);
    return { x: x + entre(-10, 10, rnd) * E, y: y + entre(-10, 10, rnd) * E, vx: entre(-22, 22, rnd) * E, vy: entre(0, 20, rnd) * E, g: 40 * E, vida, max: vida,
      s: tam * entre(0.85, 1.2, rnd), rot: entre(-0.4, 0.4, rnd), vr: entre(-1.5, 1.5, rnd), fase: entre(0, Math.PI * 2, rnd), pieza, color: ataque.color, estilo: ataque.estilo };
  }
  // el polvo de hada (en acuarela, gotitas y algún brillito): motas pequeñas que suben despacio y titilan
  function polvo(x, y, ataque, rnd, tam = FIESTA.tam) {
    const vida = entre(0.9, 1.7, rnd);
    return { x: x + entre(-12, 12, rnd) * E, y: y + entre(-12, 12, rnd) * E, vx: entre(-14, 14, rnd) * E, vy: entre(-28, -6, rnd) * E, g: -4 * E, vida, max: vida,
      s: tam * entre(0.3, 0.52, rnd), rot: 0, vr: 0, fase: entre(0, Math.PI * 2, rnd), pieza: 'polvo', color: ataque.color, estilo: ataque.estilo };
  }
  // la ráfaga del golpe: g.rafaga cositas en corona (una de cada cinco, un corazoncito) y, por cada gotita de la intensidad,
  // un confeti pastel y una mota de polvo, todo hacia fuera y cayendo despacio
  function rafaga(x, y, g, ataque, rnd, tam = FIESTA.tam) {
    const { piezas, color, estilo } = ataque, out = [];
    for (let i = 0; i < g.rafaga; i++) {
      const a = Math.PI * 2 * i / g.rafaga + entre(-0.3, 0.3, rnd), v = g.vel * entre(0.55, 1.1, rnd), vida = entre(0.9, 1.4, rnd);
      out.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40 * E, g: 130 * E, vida, max: vida, s: tam * 1.1 * entre(0.85, 1.15, rnd), rot: entre(-0.4, 0.4, rnd),
        vr: entre(-1.5, 1.5, rnd), fase: entre(0, Math.PI * 2, rnd), pieza: i % 5 === 0 ? 'corazon' : elige(piezas, rnd), color, estilo });
    }
    for (let i = 0; i < g.gotitas; i++) out.push(confeti(x, y, g, ataque, rnd, tam, CONFETI[i % CONFETI.length]));
    for (let i = 0; i < g.gotitas; i++) out.push(polvo(x, y, ataque, rnd, tam));
    return out;
  }
  function confeti(x, y, g, ataque, rnd, tam, color) {
    const a = entre(0, Math.PI * 2, rnd), v = g.vel * entre(0.35, 0.9, rnd), vida = entre(1, 1.6, rnd);
    return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 50 * E, g: 70 * E, vida, max: vida, s: tam * 0.65, rot: entre(-0.4, 0.4, rnd), vr: entre(-3, 3, rnd),
      fase: entre(0, Math.PI * 2, rnd), pieza: 'confeti', color, estilo: ataque.estilo };
  }
  // un paso de las cositas: se mueven, caen (o suben, el polvo), frenan de lado, giran y se gastan; devuelve las vivas
  function avanzaCositas(parts, dt) {
    const roce = Math.exp(-dt * 1.2);
    for (const p of parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt; p.vx *= roce; p.rot += p.vr * dt; p.vida -= dt; }
    return parts.filter(p => p.vida > 0);
  }
  return f({ RUTAS, ruta, estira, INTENSIDAD, FIESTA, CONFETI, emite, EXTRA, golpe, estiloPorId, de, cosita, polvo, rafaga, avanzaCositas });
})();
