// Fans of Pop · NIVELES: los MUNDOS (fase 1 de la propuesta, 30-10-2026) y el GENERADOR de sus niveles. Cada nivel sale siempre
// igual (semilla = mundo y nivel), con una forma de tablero kawaii, sus burbujas dobles (mundo 2) y su límite de toques, que
// se calcula SOLO: se juega el nivel por dentro muchas veces como lo haría una jugadora normal y se deja el margen justo
// para que lo pase con la probabilidad que marca la curva de dificultad (dientes de sierra: uno difícil cada 5, luego respiro).
// También el «óptimo»: el mínimo de toques posible (las 3 estrellas), buscado de verdad, no adivinado.
// MODO DIFÍCIL (Daniel, 30-10-2026): al ganar al jefe de un mundo se abre ese mundo en difícil: otros 20 niveles con tableros
// más grandes desde el principio, menos toques de sobra, más nata (en los mundos que la tienen) y el fondo de noche (`dif`).
'use strict';
// --- los mundos: nombre, fondo, novedad y en qué niveles hay un amigo atrapado ---
const PP_MUNDOS = [
  { nombre: 'Jardín', fondo: 'fondo-jardin', niveles: 20, amigos: [3, 9, 15], dobles: [0, 0] },
  { nombre: 'Pastelería', fondo: 'fondo-pasteleria', niveles: 20, amigos: [4, 12], dobles: [0.15, 0.4] },
];
const PP_TOTAL_NIVELES = PP_MUNDOS.reduce((a, m) => a + m.niveles, 0);
// nivel global (0, 1, 2…) → [mundo, nivel dentro del mundo empezando en 1]
function ppMundoDe(g) { let m = 0; while (m < PP_MUNDOS.length - 1 && g >= PP_MUNDOS[m].niveles) { g -= PP_MUNDOS[m].niveles; m++; } return [m, g + 1]; }
const ppEsJefe = g => { const [m, l] = ppMundoDe(g); return l === PP_MUNDOS[m].niveles; };
const ppEsDificil = g => { const [, l] = ppMundoDe(g); return l % 5 === 0 && !ppEsJefe(g); };

// --- formas de tablero ('#' = burbuja, '.' = hueco) ---
const PP_FORMAS = {
  3: [['###', '###', '###'], ['.#.', '###', '.#.'], ['#.#', '###', '#.#'], ['##.', '###', '.##']],
  4: [['####', '####', '####', '####'], ['.##.', '####', '####', '.##.'], ['#..#', '####', '####', '#..#'], ['##.#', '####', '####', '#.##'], ['.##.', '####', '.##.', '.##.']],
  5: [['.#.#.', '#####', '#####', '.###.', '..#..'],   // corazón
      ['..#..', '.###.', '#####', '.###.', '..#..'],   // diamante
      ['.###.', '#####', '#####', '#####', '.###.'],   // flor
      ['..#..', '#####', '.###.', '##.##', '#...#'],   // estrella
      ['#####', '#####', '#####', '#####', '#####'],
      ['#####', '#...#', '#.#.#', '#...#', '#####']],  // marco con centro
};
// --- semilla: cada nivel sale siempre igual ---
function ppAzar(semilla) { let s = semilla >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// --- el pop-it puro: tocar i revienta (o resquebraja, si es doble) i y sus vecinas que sigan arriba ---
function ppCruz(n, mask, i) {
  const x = i % n, y = (i - x) / n, v = [i];
  if (x > 0) v.push(i - 1); if (x < n - 1) v.push(i + 1); if (y > 0) v.push(i - n); if (y < n - 1) v.push(i + n);
  return v.filter(j => mask[j]);
}
// el mínimo de toques para dejar a 0 todas las burbujas (`need` = cuántos golpes le faltan a cada una). Búsqueda en profundidad
// creciente: se elige la burbuja con menos formas de alcanzarla y se prueba cada toque que la alcanza. Devuelve la lista de toques.
function ppOptimo(n, mask, need, tope = 80000) {
  const N = n * n, cruces = [];
  for (let i = 0; i < N; i++) cruces[i] = mask[i] ? ppCruz(n, mask, i) : [];
  const falta = need.slice(), camino = [];
  let nodos = 0;
  function busca(prof) {   // undefined = no hay solución con esa profundidad; null = búsqueda demasiado larga
    if (++nodos > tope) return null;
    let peor = -1, op = 99, total = 0;
    for (let i = 0; i < N; i++) if (falta[i] > 0) { total += falta[i]; if (cruces[i].length < op) { op = cruces[i].length; peor = i; } }
    if (peor < 0) return camino.slice();
    if (prof === 0 || Math.ceil(total / 5) > prof) return undefined;
    for (const t of cruces[peor]) {   // los toques que alcanzan a esa burbuja son los de su propia cruz
      const bajo = [];
      for (const j of cruces[t]) if (falta[j] > 0) { falta[j]--; bajo.push(j); }
      camino.push(t);
      const r = busca(prof - 1);
      camino.pop();
      for (const j of bajo) falta[j]++;
      if (r !== undefined) return r;
    }
    return undefined;
  }
  for (let prof = 0; prof <= N * 2; prof++) {
    const r = busca(prof);
    if (r) return r;
    if (r === null) return ppVoraz(n, mask, need, () => 0.5).toques;   // demasiado grande: el voraz como cota (no pasa en estos tamaños)
  }
  return [];
}
// cómo juega una jugadora normal: toca donde más revienta (a veces se despista y toca otra que también revienta algo)
function ppVoraz(n, mask, need, azar, despiste = 0) {
  const falta = need.slice(), toques = [], N = n * n;
  for (let g = 0; g < 200; g++) {
    let mejor = 0, cands = [];
    const buenas = [];
    for (let t = 0; t < N; t++) {
      if (!mask[t]) continue;
      let v = 0; for (const j of ppCruz(n, mask, t)) if (falta[j] > 0) v++;
      if (v > 0) buenas.push(t);
      if (v > mejor) { mejor = v; cands = [t]; } else if (v === mejor && v > 0) cands.push(t);
    }
    if (!mejor) break;
    const lista = azar() < despiste ? buenas : cands;
    const t = lista[Math.floor(azar() * lista.length)];
    for (const j of ppCruz(n, mask, t)) if (falta[j] > 0) falta[j]--;
    toques.push(t);
  }
  return { toques };
}
// --- la curva: con qué probabilidad debe pasar el nivel una jugadora normal ---
function ppObjetivo(g, dif = false) {
  const [m, l] = ppMundoDe(g), M = PP_MUNDOS[m];
  if (l <= 2 && !dif) return 1;                                // tutorial
  let o;
  if (ppEsJefe(g)) o = 0.35;
  else if (ppEsDificil(g)) o = 0.4;
  else {
    const base = 0.92 - 0.3 * (l / M.niveles) - 0.05 * m;      // baja poco a poco a lo largo del mundo
    o = ((l - 1) % 5 === 0) ? Math.min(0.95, base + 0.15) : base;   // el de después de un difícil, de respiro
  }
  return dif ? Math.max(0.3, o * 0.65) : o;                   // en difícil, bastante menos margen
}
// --- el nivel g: forma, burbujas dobles, óptimo y límite de toques ---
// Se prueban varias formas y repartos de dobles (6, salvo en el tutorial) y se queda la que más se acerca a la curva.
const PP_CACHE_NIVEL = {};
function ppConstruye(g, intento, dif = false) {
  const [m, l] = ppMundoDe(g), M = PP_MUNDOS[m], az = ppAzar(1000 * (m + 1) + l * 37 + 11 + intento * 7919 + (dif ? 500009 : 0));
  const lado = dif ? (l <= 6 ? 4 : 5) : m === 0 ? (l <= 4 ? 3 : l <= 11 ? 4 : 5) : (l <= 8 ? 4 : 5);   // crece a lo largo del mundo; el 2 empieza en 4x4
  let mask;
  if (dif) { const f = ppEsJefe(g) ? [PP_FORMAS[5][m === 0 ? 3 : 5]] : PP_FORMAS[lado]; mask = f[Math.floor(az() * f.length)]; }   // jefe difícil: estrella y marco
  else if (m === 0 && l === 1) mask = PP_FORMAS[3][1];                         // la cruz: se revienta entera de un toque
  else if (m === 0 && l === 2) mask = PP_FORMAS[3][0];
  else if (ppEsJefe(g)) mask = PP_FORMAS[5][m === 0 ? 0 : 2];             // jefe: corazón y flor
  else { const f = PP_FORMAS[lado]; mask = f[Math.floor(az() * f.length)]; }
  const n = lado, N = n * n, mk = new Uint8Array(N), need = new Array(N).fill(0);
  mask.forEach((fila, y) => [...fila].forEach((ch, x) => { if (ch === '#') { mk[y * n + x] = 1; need[y * n + x] = 1; } }));
  // las dobles (mundo 2): cada vez más, y en el primer nivel del mundo solo dos, para aprender
  const [d0, d1] = dif && M.dobles[1] > 0 ? [M.dobles[0] + 0.15, M.dobles[1] + 0.15] : M.dobles;
  if (d1 > 0) {
    const cuantas = l === 1 && !dif ? 2 : Math.round(mk.reduce((a, b) => a + b, 0) * (d0 + (d1 - d0) * (l / M.niveles)));
    const sitios = [...Array(N).keys()].filter(i => mk[i]).sort(() => az() - 0.5);
    for (let k = 0; k < cuantas && k < sitios.length; k++) need[sitios[k]] = 2;
  }
  const opt = ppOptimo(n, mk, need);
  // el límite: el menor que deja pasar a la jugadora normal con la probabilidad de la curva (40 partidas simuladas)
  const tiradas = [];
  for (let k = 0; k < 40; k++) tiradas.push(ppVoraz(n, mk, need, az, 0.25).toques.length);
  tiradas.sort((a, b) => a - b);
  const obj = ppObjetivo(g, dif);
  let limite = tiradas[Math.min(tiradas.length - 1, Math.ceil(obj * tiradas.length) - 1)];
  limite = Math.max(limite, opt.length + (l <= 2 && m === 0 && !dif ? 2 : 0));
  const pasa = tiradas.filter(t => t <= limite).length / tiradas.length;
  return { g, dif, mundo: m, l, lado: n, mask: mk, need, opt, limite, pasa, amigos: !dif && M.amigos.includes(l) ? 1 : 0,
    jefe: ppEsJefe(g), dificil: ppEsDificil(g), tutorial: !dif && ((m === 0 && l <= 2) || (m > 0 && l === 1)) };
}
function ppNivel(g, dif = false) {
  const clave = (dif ? 'd' : '') + g;
  if (PP_CACHE_NIVEL[clave]) return PP_CACHE_NIVEL[clave];
  const obj = ppObjetivo(g, dif), intentos = obj >= 1 ? 1 : 6;
  let mejor = null;
  for (let k = 0; k < intentos; k++) { const d = ppConstruye(g, k, dif); if (!mejor || Math.abs(d.pasa - obj) < Math.abs(mejor.pasa - obj)) mejor = d; }
  PP_CACHE_NIVEL[clave] = mejor;
  return mejor;
}
// el primer nivel global de un mundo
function ppInicioMundo(m) { let g = 0; for (let k = 0; k < m; k++) g += PP_MUNDOS[k].niveles; return g; }
