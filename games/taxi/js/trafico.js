// Fans Of Taxi · TRÁFICO: los coches de la ciudad y el «conductor» que siguen también los rivales y la policía: va de cruce en cruce por
// su carril, frena si tiene algo delante y elige el siguiente cruce al azar o siguiendo una ruta. Aquí se cuentan también los «casi»
// (pasar rozando un coche sin tocarlo, que da propina) y los golpes con el tráfico. Sin DOM ni three.
'use strict';
const CONDUCTOR = (() => {
  // un conductor: su coche, el cruce del que viene y al que va, y una ruta opcional (lista de cruces)
  function nuevo(nodoDesde, nodoHasta, vel, extra = {}) {
    const a = CIUDAD.nodos[nodoDesde], b = CIUDAD.nodos[nodoHasta], of = CIUDAD.carril(a, b);
    const coche = COCHE.nuevo(a.x + of.ox, a.z + of.oz, Math.atan2(b.x - a.x, b.z - a.z), { radio: 1.5, masa: 1 });
    const c = { coche, desde: nodoDesde, hasta: nodoHasta, vel, ruta: null, ruta_i: 0, parado: 0, atasco: 0, lado: 1, ...extra };
    c.objetivo = punto(nodoDesde, nodoHasta, c.lado); c.prox = elige(c, nodoDesde, nodoHasta, Math.random); return c;
  }
  const punto = (desde, hasta, lado = 1) => { const a = CIUDAD.nodos[desde], b = CIUDAD.nodos[hasta], of = CIUDAD.carril(a, b, lado); return { x: b.x + of.ox, z: b.z + of.oz }; };
  // el siguiente cruce: el de la ruta, o uno al azar que no sea volver (salvo en un callejón sin salida). Se decide también el de
  // después (`prox`) para frenar antes de las curvas
  function elige(c, desde, hasta, azar) {
    if (c.ruta) { const k = c.ruta.indexOf(hasta); return k >= 0 && k < c.ruta.length - 1 ? c.ruta[k + 1] : null; }
    const op = CIUDAD.nodos[hasta].vecinos.filter(v => v !== desde); return op.length ? op[(azar() * op.length) | 0] : desde;
  }
  function siguiente(c, azar) {
    let prox;
    if (c.ruta && c.ruta_i < c.ruta.length - 1) prox = c.ruta[++c.ruta_i];
    else if (c.ruta) prox = c.prox !== undefined && c.prox !== null ? c.prox : c.hasta;
    else prox = c.prox !== undefined && c.prox !== null ? c.prox : elige(c, c.desde, c.hasta, azar);
    c.desde = c.hasta; c.hasta = prox; c.objetivo = punto(c.desde, c.hasta, c.lado); c.prox = elige(c, c.desde, c.hasta, azar);
  }
  // tras perderse (marcha atrás), volver a la ruta por el cruce más cercano
  function resincroniza(c, k) {
    const n = CIUDAD.nodoCercano(k.x, k.z, k.y);
    if (c.ruta) { let mejor = 0, mejorD = Infinity; for (let i = 0; i < c.ruta.length; i++) { const m = CIUDAD.nodos[c.ruta[i]]; const d = Math.hypot(m.x - k.x, m.z - k.z) + Math.abs(m.y - k.y) * 4; if (d < mejorD) { mejorD = d; mejor = i; } } c.ruta_i = mejor; c.desde = c.hasta = c.ruta[mejor]; }
    else c.desde = c.hasta = n.id;
    const m = CIUDAD.nodos[c.hasta]; c.objetivo = { x: m.x, z: m.z }; c.prox = elige(c, c.desde, c.hasta, () => 0); c.atasco = 0;
  }
  // hacia dónde mira el conductor: su objetivo, y si lo que sigue es una curva suave de tramos cortos (las eses de los túneles), al
  // acercarse mira cada vez más al siguiente. Sin esto el objetivo salta de lado a lado cada pocos metros y el coche culebrea.
  // En las curvas cerradas (horquillas, esquinas) no: ahí atajar lo llevaría contra el muro de dentro.
  const MIRA_ANTES = 9, GIRO_SUAVE = 0.6;
  function apunta(c, d) {
    if (d >= MIRA_ANTES || c.prox === undefined || c.prox === null || c.prox === c.desde) return c.objetivo;
    const a = CIUDAD.nodos[c.desde], h = CIUDAD.nodos[c.hasta], p = CIUDAD.nodos[c.prox];
    if (Math.hypot(p.x - h.x, p.z - h.z) > MIRA_ANTES * 2 || Math.abs(giro(a, h, p)) > GIRO_SUAVE) return c.objetivo;
    const luego = punto(c.hasta, c.prox, c.lado), t = 1 - d / MIRA_ANTES;
    return { x: lerp(c.objetivo.x, luego.x, t), z: lerp(c.objetivo.z, luego.z, t) };
  }
  // cuánto tuerce el camino a → h → p (radianes, de -π a π)
  function giro(a, h, p) {
    let g = Math.atan2(p.x - h.x, p.z - h.z) - Math.atan2(h.x - a.x, h.z - a.z);
    while (g > Math.PI) g -= 2 * Math.PI; while (g < -Math.PI) g += 2 * Math.PI;
    return g;
  }
  // un paso: apunta al objetivo, frena en las curvas y ante obstáculos; `obstaculos` son coches a esquivar (frena si están delante)
  function paso(c, dt, mundo, obstaculos, azar, limites) {
    const k = c.coche;
    if (c.parado > 0) { c.parado -= dt; COCHE.paso(k, { giro: 0, gas: 0, freno: 1 }, dt, mundo, limites); return; }
    const d = Math.hypot(c.objetivo.x - k.x, c.objetivo.z - k.z), mira = apunta(c, d), dx = mira.x - k.x, dz = mira.z - k.z;
    // encajado contra un muro (quieto y tocándolo): marcha atrás un momento girando al otro lado, y a por el cruce más cercano
    if (c.retro > 0) { c.retro -= dt; COCHE.paso(k, { giro: -c.retroGiro, gas: 0, freno: 1 }, dt, mundo, limites); if (c.retro <= 0) resincroniza(c, k); return; }
    if (Math.abs(k.v) < 1.5 && k.golpe > 0) { c.pared = (c.pared || 0) + dt; if (c.pared > 1) { c.pared = 0; c.retro = 1.3; c.retroGiro = Math.sign(Math.sin(Math.atan2(dx, dz) - k.ang) || 1); } } else c.pared = 0;
    if (d < 3.5) siguiente(c, azar);
    const quiere = Math.atan2(dx, dz); let dif = quiere - k.ang;
    while (dif > Math.PI) dif -= 2 * Math.PI; while (dif < -Math.PI) dif += 2 * Math.PI;
    const giro = clamp(dif * 2.2, -1, 1);
    // velocidad: menos en las curvas (y antes de llegar a una), y si hay algo delante
    let vObj = c.vel * (Math.abs(dif) > 0.9 ? 0.45 : Math.abs(dif) > 0.4 ? 0.7 : 1);
    if (c.prox !== undefined && c.prox !== null && d < 34) {
      const h = CIUDAD.nodos[c.hasta], p = CIUDAD.nodos[c.prox];
      let curva = Math.atan2(p.x - h.x, p.z - h.z) - Math.atan2(dx, dz); while (curva > Math.PI) curva -= 2 * Math.PI; while (curva < -Math.PI) curva += 2 * Math.PI;
      const vCurva = lerp(c.vel, 7, clamp((Math.abs(curva) - 0.3) / 1.2, 0, 1));
      if (vCurva < vObj) vObj = Math.max(vCurva, lerp(vCurva, c.vel, clamp((d - 8) / 26, 0, 1)));
    }
    const f = COCHE.adelante(k);
    // frena si tiene algo delante; si lleva un rato atascado (varios parados mirándose en un cruce), pasa de los demás un momento
    c.atasco = k.v < 1.5 ? c.atasco + dt : 0;
    if (c.atasco < 2.5) for (const o of obstaculos) {
      if (o === k) continue;
      const ox = o.x - k.x, oz = o.z - k.z, delante = ox * f.x + oz * f.z, lado = Math.abs(ox * f.z - oz * f.x);
      if (delante > 0 && delante < TAXI.trafico.frenaA && lado < 3.2) vObj = Math.min(vObj, Math.max(0, (delante - 5) / TAXI.trafico.frenaA) * c.vel);
    } else if (c.atasco > 4.5) c.atasco = 0;
    const gas = k.v < vObj ? 1 : 0, freno = k.v > vObj + 2 ? 1 : 0;
    COCHE.paso(k, { giro, gas, freno }, dt, mundo, limites);
  }
  return { nuevo, paso, siguiente, punto, resincroniza };
})();

const TRAFICO = (() => {
  const T = TAXI.trafico;
  let coches = [];
  let azar = mulberry32(99);
  const COLORES = [0xff7a1a, 0x4fc3d9, 0xff9fd0, 0xfff6ea, 0x8a6fe0, 0x7ee04a, 0xffcb3d];
  // un cruce al azar cerca de un sitio (entre cercaMin y cercaMax), que no sea túnel
  function cruceCerca(sitio) {
    const l = CIUDAD.nodosEn(sitio.x, sitio.z, T.cercaMin, T.cercaMax).filter(n => n.tipo !== 'tunel' && n.tipo !== 'rampa' && n.vecinos.length);
    return l.length ? l[(azar() * l.length) | 0] : CIUDAD.nodoCercano(sitio.x, sitio.z);
  }
  function nuevo(sitio) {
    const n = cruceCerca(sitio), b = n.vecinos[(azar() * n.vecinos.length) | 0];
    const c = CONDUCTOR.nuevo(n.id, b, lerp(T.vel[0], T.vel[1], azar()), { color: COLORES[(azar() * COLORES.length) | 0], rozado: 0, tipo: 'trafico' });
    c.coche.y = n.y; return c;
  }
  function crear(mundo, jugador) {
    coches = []; azar = mulberry32(mundo.semilla || 99);
    for (let i = 0; i < T.coches; i++) coches.push(nuevo(jugador));
  }
  // devuelve los sucesos que le pasan al jugador: 'roce' (casi), 'choque-trafico'
  function paso(dt, mundo, jugador, otros) {
    const sucesos = [];
    const todos = coches.map(c => c.coche).concat(otros, [jugador]);
    for (let i = 0; i < coches.length; i++) {
      let c = coches[i];
      if (Math.hypot(c.coche.x - jugador.x, c.coche.z - jugador.z) > T.lejos) { c = coches[i] = nuevo(jugador); }   // se recicla lejos del jugador
      CONDUCTOR.paso(c, dt, mundo, todos, azar, { vmax: c.vel, acel: 8 });
      const k = c.coche;
      if (k.suelo === 'agua') COCHE.rescata(k, mundo);
      // golpes con el jugador
      const fuerza = COCHE.chocan(jugador, k);
      if (fuerza > 5) { c.parado = T.tumbado; c.rozado = 1; if (fuerza > TAXI.coche.choqueFuerte * 0.7) sucesos.push('choque-trafico'); }
      // el «casi»: pasar al lado sin tocar, rápido
      const d = Math.hypot(k.x - jugador.x, k.z - jugador.z), min = k.radio + jugador.radio;
      if (c.rozado > 0) c.rozado -= dt;
      else if (d > min && d < min + T.roce && Math.abs(jugador.v) - Math.abs(k.v) > T.roceVel * 0.6 && COCHE.rapidez(jugador) > T.roceVel) { c.rozado = 2; sucesos.push('roce'); }
    }
    // choques entre ellos (solo separar)
    for (let i = 0; i < coches.length; i++) for (let j = i + 1; j < coches.length; j++) {
      const a = coches[i].coche, b = coches[j].coche;
      if (Math.abs(a.x - b.x) < 4 && Math.abs(a.z - b.z) < 4) COCHE.chocan(a, b);
    }
    return sucesos;
  }
  return { crear, paso, get coches() { return coches; } };
})();
