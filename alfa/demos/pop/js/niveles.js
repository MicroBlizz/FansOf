// Fans of Pop · NIVELES: los MUNDOS (fase 1 de la propuesta, 30-10-2026) y el GENERADOR de sus niveles. Cada nivel sale siempre
// igual (semilla = mundo y nivel), con una forma de tablero kawaii, sus burbujas dobles (mundo 2) y su límite de toques, que
// se calcula SOLO: se juega el nivel por dentro muchas veces como lo haría una jugadora normal y se deja el margen justo
// para que lo pase con la probabilidad que marca la curva de dificultad (dientes de sierra: uno difícil cada 5, luego respiro).
// También el «óptimo»: el mínimo de toques posible (las 3 estrellas), buscado de verdad, no adivinado.
// MUNDOS 3 A 6 (fase 5, 30-10-2026, «que la dificultad vaya en aumento tipo Candy Crush»): cada mundo trae una burbuja nueva y
// mantiene las de antes (dobles con nata, de HIELO que solo revientan si las tocas a ellas, CONCHAS que al tocarlas solo
// revientan ellas y TRIPLES con cereza), los tableros crecen hasta 6x6 y el margen de toques sobre el mínimo se va comiendo:
// en los primeros mundos sobran 2 o 3 toques; en los últimos hay que encontrar la solución perfecta o casi (`ppMargen`).
// MODO DIFÍCIL (Daniel, 30-10-2026): al ganar al jefe de un mundo se abre ese mundo en difícil: otros 20 niveles con tableros
// más grandes desde el principio, menos toques de sobra, más nata (en los mundos que la tienen) y el fondo de noche (`dif`).
'use strict';
// --- los mundos: nombre, fondo, novedad y en qué niveles hay un amigo atrapado ---
// `lado`: tamaño del tablero al empezar y al acabar el mundo · `esp`: qué parte de las burbujas es de cada tipo especial, al
// empezar y al acabar el mundo (doble = con nata, 2 golpes; triple = con cereza, 3 golpes; hielo y concha, ver ppEfecto)
const PP_MUNDOS = [
  { nombre: 'Jardín', fondo: 'fondo-jardin', niveles: 20, amigos: [3, 9, 15], lado: [3, 5], esp: {} },
  { nombre: 'Pastelería', fondo: 'fondo-pasteleria', niveles: 20, amigos: [4, 12], lado: [4, 6], esp: { doble: [0.15, 0.4] } },
  { nombre: 'Heladería', fondo: 'fondo-heladeria', niveles: 20, amigos: [7], lado: [5, 6], esp: { hielo: [0.12, 0.3], doble: [0.1, 0.15] }, nueva: 'hielo' },
  { nombre: 'Playa', fondo: 'fondo-playa', niveles: 20, amigos: [7], lado: [5, 6], esp: { concha: [0.12, 0.3], hielo: [0.05, 0.12], doble: [0.1, 0.15] }, nueva: 'concha' },
  { nombre: 'Feria', fondo: 'fondo-feria', niveles: 20, amigos: [7], lado: [5, 6], esp: { triple: [0.08, 0.2], doble: [0.15, 0.2], hielo: [0.05, 0.1], concha: [0.05, 0.1] }, nueva: 'triple' },
  { nombre: 'Reino de las nubes', fondo: 'fondo-nubes', niveles: 20, amigos: [7], lado: [6, 6], esp: { triple: [0.12, 0.2], doble: [0.15, 0.2], hielo: [0.1, 0.15], concha: [0.1, 0.15] } },
  // mundos 7 a 10 (31-10-2026): cada uno con su burbuja nueva de efecto grande (cohete = su fila, burbujeante = un 3x3, pétalo = su
  // columna) y algo de las de antes; el Espacio, todo mezclado y con el CEO espacial de jefe
  { nombre: 'Bosque de hadas', fondo: 'fondo-bosque', niveles: 20, amigos: [7], lado: [5, 6], esp: { cohete: [0.06, 0.12], doble: [0.15, 0.25], hielo: [0.08, 0.14] }, nueva: 'cohete' },
  { nombre: 'Fondo del mar', fondo: 'fondo-mar', niveles: 20, amigos: [7], lado: [5, 6], esp: { burbujas: [0.06, 0.12], triple: [0.08, 0.15], concha: [0.1, 0.16] }, nueva: 'burbujas' },
  { nombre: 'Jardín de cerezos', fondo: 'fondo-sakura', niveles: 20, amigos: [7], lado: [6, 6], esp: { petalo: [0.06, 0.12], cohete: [0.04, 0.08], doble: [0.15, 0.22], hielo: [0.1, 0.16] }, nueva: 'petalo' },
  { nombre: 'Espacio', fondo: 'fondo-espacio', niveles: 20, amigos: [7], lado: [6, 6], esp: { cohete: [0.04, 0.07], burbujas: [0.04, 0.07], petalo: [0.04, 0.07], triple: [0.12, 0.2], hielo: [0.12, 0.18], concha: [0.1, 0.15] } },
];
// qué revienta un toque en t: ella y sus 4 vecinas, salvo las de HIELO (solo se revientan tocándolas a ellas) y salvo que t sea
// una CONCHA (al tocarla solo se revienta ella). `esp`: 0 normal, 1 hielo, 2 concha (sin `esp`, el pop-it puro de siempre)
// 3 cohete (su fila entera), 4 burbujeante (un cuadrado de 3x3) y 5 pétalo (su columna entera), mundos 7 a 10. Las de hielo solo las
// revienta un toque suyo, también con estos.
const PP_ESP = { hielo: 1, concha: 2, cohete: 3, burbujas: 4, petalo: 5 };
function ppEfecto(n, mask, esp, t) {
  if (esp && esp[t] === 2) return [t];
  let v;
  if (esp && esp[t] >= 3) {
    const x0 = t % n, y0 = (t - x0) / n, e = esp[t]; v = [];
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const dentro = e === 3 ? y === y0 : e === 5 ? x === x0 : Math.abs(x - x0) <= 1 && Math.abs(y - y0) <= 1;
      if (dentro && mask[y * n + x]) v.push(y * n + x);
    }
  } else v = ppCruz(n, mask, t);
  return esp ? v.filter(j => j === t || esp[j] !== 1) : v;
}
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
  6: [['######', '######', '######', '######', '######', '######'],
      ['.####.', '######', '######', '######', '######', '.####.'],   // cojín
      ['.##.##', '######', '######', '.####.', '..##..', '..##..'],   // corazón grande
      ['..##..', '.####.', '######', '######', '.####.', '..##..'],   // diamante grande
      ['##..##', '######', '.####.', '.####.', '######', '##..##'],   // lazo
      ['######', '#....#', '#.##.#', '#.##.#', '#....#', '######'],   // marco con centro
      ['.#..#.', '######', '######', '######', '.####.', '..##..']],  // gatito
};
// LAS FORMAS DE CADA MUNDO (Daniel, 30-10-2026, con el pop-it de concha de su hija: «en la playa conchas, peces, pelotas… y así con
// cada mundo»): salen en la mayoría de sus niveles del mismo tamaño, y la primera es la del jefe. La bandeja sigue el borde (bandeja.js).
const PP_FORMAS_MUNDO = [
  { 5: [['.#.#.', '#####', '#####', '.###.', '..#..'],          // corazón
        ['##.##', '#####', '.###.', '#####', '##.##'],          // mariposa
        ['#.#.#', '#####', '#####', '.###.', '..#..'],          // tulipán
        ['.###.', '#####', '#####', '#####', '.###.']] },       // flor
  { 6: [['..##..', '.####.', '######', '######', '.####.', '.####.'],   // magdalena
        ['.####.', '######', '##..##', '##..##', '######', '.####.'],   // donut
        ['..##..', '######', '######', '######', '######', '######'],   // tarta con vela
        ['.#..#.', '######', '######', '######', '.####.', '..##..']] }, // galleta de gatito
  { 5: [['.###.', '#####', '.###.', '..#..', '..#..'],          // cucurucho pequeño
        ['.###.', '.###.', '.###.', '.###.', '..#..']],         // polo
    6: [['.####.', '######', '######', '.####.', '..##..', '..##..'],   // cucurucho de helado
        ['.####.', '.####.', '.####.', '.####.', '..##..', '..##..'],   // polo
        ['######', '######', '.####.', '..##..', '..##..', '.####.'],   // copa de helado
        ['..##..', '.####.', '######', '######', '######', '.####.']] }, // bola de helado
  { 5: [['.###.', '#####', '#####', '.###.', '.###.'],          // concha pequeña
        ['#.##.', '#####', '.####', '#####', '#.##.']],         // pez pequeño
    6: [['.####.', '######', '######', '######', '.####.', '.####.'],   // concha (como el pop-it de la hija de Daniel)
        ['#.###.', '######', '.#####', '.#####', '######', '#.###.'],   // pez
        ['.####.', '######', '######', '######', '######', '.####.'],   // pelota de playa
        ['..##..', '..##..', '######', '.####.', '.####.', '##..##']] }, // estrella de mar
  { 5: [['.###.', '#####', '#####', '.###.', '..#..']],         // globo pequeño
    6: [['.####.', '######', '######', '.####.', '..##..', '...#..'],   // globo
        ['######', '######', '.####.', '..##..', '..##..', '..##..'],   // algodón de azúcar
        ['#.##.#', '######', '######', '######', '######', '.####.'],   // corona del carrusel
        ['.####.', '######', '#.##.#', '######', '#.##.#', '######']] }, // noria
  { 6: [['.##...', '#####.', '######', '######', '######', '.####.'],   // nube
        ['.####.', '######', '##..##', '##..##', '##..##', '##..##'],   // arcoíris
        ['..##..', '..##..', '######', '.####.', '.####.', '##..##'],   // estrella
        ['.###..', '##....', '##....', '##....', '###...', '.####.']] }, // luna,
  { 5: [['.###.', '#####', '#####', '..#..', '.###.']],         // seta pequeña
    6: [['.####.', '######', '######', '..##..', '..##..', '.####.'],   // seta
        ['..##..', '.####.', '######', '######', '.####.', '..##..'],   // hoja
        ['#.##.#', '######', '.####.', '..##..', '.####.', '.#..#.'],   // hada
        ['..##..', '.####.', '######', '######', '..##..', '..##..']] }, // árbol
  { 5: [['#...#', '##.##', '#####', '.###.', '..#..']],         // cola de sirena
    6: [['.####.', '######', '######', '######', '#.##.#', '#.##.#'],   // pulpo
        ['..####', '.#####', '######', '######', '.#####', '..####'],   // ballena
        ['..##..', '######', '..##..', '..##..', '#.##.#', '######'],   // ancla
        ['.####.', '######', '######', '.####.', '.#..#.', '.#..#.']] }, // medusa
  { 5: [['.#.#.', '#####', '.###.', '#####', '.#.#.']],         // flor de cerezo pequeña
    6: [['.#..#.', '######', '.####.', '######', '######', '.#..#.'],   // flor de cerezo
        ['..##..', '######', '######', '######', '######', '..##..'],   // farolillo
        ['######', '######', '.####.', '.####.', '..##..', '..##..'],   // abanico
        ['#....#', '##..##', '######', '######', '######', '.####.']] }, // gatito de la suerte
  { 6: [['..##..', '.####.', '######', '######', '.####.', '..##..'],   // planeta
        ['..##..', '.####.', '.####.', '.####.', '######', '#.##.#'],   // cohete
        ['.###..', '####..', '###...', '###...', '####..', '.####.'],   // luna
        ['#.....', '##..##', '.#####', '..####', '..####', '...##.']] }, // estrella fugaz
];
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
function ppOptimo(n, mask, need, tope = 80000, esp = null) {
  const N = n * n, efecto = [], cruces = [];   // efecto[t]: lo que revienta tocar t · cruces[j]: los toques que alcanzan a j
  for (let i = 0; i < N; i++) { efecto[i] = mask[i] ? ppEfecto(n, mask, esp, i) : []; cruces[i] = []; }
  for (let t = 0; t < N; t++) for (const j of efecto[t]) cruces[j].push(t);
  const falta = need.slice(), camino = [];
  let nodos = 0;
  function busca(prof) {   // undefined = no hay solución con esa profundidad; null = búsqueda demasiado larga
    if (++nodos > tope) return null;
    let peor = -1, op = 99, total = 0;
    for (let i = 0; i < N; i++) if (falta[i] > 0) { total += falta[i]; if (cruces[i].length < op) { op = cruces[i].length; peor = i; } }
    if (peor < 0) return camino.slice();
    if (prof === 0 || Math.ceil(total / 5) > prof) return undefined;   // un toque baja como mucho 5 golpes
    for (const t of cruces[peor]) {   // los toques que alcanzan a esa burbuja son los de su propia cruz
      const bajo = [];
      for (const j of efecto[t]) if (falta[j] > 0) { falta[j]--; bajo.push(j); }
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
    if (r === null) return ppVoraz(n, mask, need, () => 0.5, 0, esp).toques;   // demasiado grande: el voraz como cota (no pasa en estos tamaños)
  }
  return [];
}
// cómo juega una jugadora normal: toca donde más revienta (a veces se despista y toca otra que también revienta algo)
function ppVoraz(n, mask, need, azar, despiste = 0, esp = null) {
  const falta = need.slice(), toques = [], N = n * n;
  for (let g = 0; g < 200; g++) {
    let mejor = 0, cands = [];
    const buenas = [];
    for (let t = 0; t < N; t++) {
      if (!mask[t]) continue;
      let v = 0; for (const j of ppEfecto(n, mask, esp, t)) if (falta[j] > 0) v++;
      if (v > 0) buenas.push(t);
      if (v > mejor) { mejor = v; cands = [t]; } else if (v === mejor && v > 0) cands.push(t);
    }
    if (!mejor) break;
    const lista = azar() < despiste ? buenas : cands;
    const t = lista[Math.floor(azar() * lista.length)];
    for (const j of ppEfecto(n, mask, esp, t)) if (falta[j] > 0) falta[j]--;
    toques.push(t);
  }
  return { toques };
}
// --- la curva: con qué probabilidad debe pasar el nivel una jugadora normal ---
function ppObjetivo(g, dif = false) {
  const [m, l] = ppMundoDe(g), M = PP_MUNDOS[m];
  if (l <= 2 && !dif) return 1;                                // tutorial
  let o;
  if (ppEsJefe(g)) o = Math.max(0.2, 0.35 - 0.03 * m);
  else if (ppEsDificil(g)) o = Math.max(0.22, 0.4 - 0.035 * m);
  else {
    const base = Math.max(0.3, 0.88 - 0.3 * (l / M.niveles) - 0.08 * m);   // baja a lo largo del mundo y de un mundo a otro
    o = ((l - 1) % 5 === 0) ? Math.min(0.95, base + 0.15) : base;   // el de después de un difícil, de respiro
  }
  return dif ? Math.max(0.3, o * 0.65) : o;                   // en difícil, bastante menos margen
}
// cuántos toques de sobra sobre el mínimo, como mucho (además de la curva): el «tipo Candy Crush» de Daniel. Una persona que piensa
// ve la solución de un tablero pequeño enseguida; para que cueste, al avanzar sobran cada vez menos toques. Niveles difíciles y
// jefes, uno menos; en el modo difícil, ninguno desde el mundo 2.
function ppMargen(g, dif) {
  const [m, l] = ppMundoDe(g), M = PP_MUNDOS[m];
  let k = Math.round(3 - 0.6 * m - 1.5 * (l / M.niveles));
  if (ppEsDificil(g) || ppEsJefe(g)) k--;
  if (dif) k = m === 0 ? Math.min(k, 1) : 0;
  return Math.max(0, k);
}
// --- el nivel g: forma, burbujas especiales, óptimo y límite de toques ---
// Se prueban varias formas y repartos de dobles (6, salvo en el tutorial) y se queda la que más se acerca a la curva.
const PP_CACHE_NIVEL = {};
function ppConstruye(g, intento, dif = false) {
  const [m, l] = ppMundoDe(g), M = PP_MUNDOS[m], az = ppAzar(1000 * (m + 1) + l * 37 + 11 + intento * 7919 + (dif ? 500009 : 0));
  // el tamaño crece a lo largo del mundo, de M.lado[0] a M.lado[1] (en difícil, el grande casi desde el principio)
  const [l0, l1] = M.lado, lado = dif ? (l <= 6 ? Math.max(4, l1 - 1) : l1) : Math.min(l1, l0 + Math.floor((l - 1) * (l1 - l0 + 1) / (M.niveles * 0.75)));
  let mask;
  if (dif) { const f = ppEsJefe(g) ? [PP_FORMAS[lado][lado === 5 ? (m === 0 ? 3 : 5) : 5]] : PP_FORMAS[lado]; mask = f[Math.floor(az() * f.length)]; }   // jefe difícil: estrella o marco
  else if (m === 0 && l === 1) mask = PP_FORMAS[3][1];                         // la cruz: se revienta entera de un toque
  else if (m === 0 && l === 2) mask = PP_FORMAS[3][0];
  else if (ppEsJefe(g)) mask = (PP_FORMAS_MUNDO[m][lado] || PP_FORMAS[lado])[0];   // jefe: la forma estrella del mundo
  else if (PP_FORMAS_MUNDO[m][lado] && az() < 0.7) { const f = PP_FORMAS_MUNDO[m][lado]; mask = f[Math.floor(az() * f.length)]; }   // las formas del mundo (conchas y peces en la Playa…)
  else { const f = PP_FORMAS[lado]; mask = f[Math.floor(az() * f.length)]; }
  const n = lado, N = n * n, mk = new Uint8Array(N), need = new Array(N).fill(0), esp = new Uint8Array(N);
  mask.forEach((fila, y) => [...fila].forEach((ch, x) => { if (ch === '#') { mk[y * n + x] = 1; need[y * n + x] = 1; } }));
  // las burbujas especiales del mundo: cada vez más a lo largo del mundo. En el primer nivel del mundo solo dos de la NUEVA, para aprender
  const total = mk.reduce((a, b) => a + b, 0), sitios = [...Array(N).keys()].filter(i => mk[i]).sort(() => az() - 0.5);
  let k = 0;
  const pon = (tipo, cuantas) => { for (let c = 0; c < cuantas && k < sitios.length; c++, k++) { const i = sitios[k]; if (tipo === 'doble') need[i] = 2; else if (tipo === 'triple') need[i] = 3; else esp[i] = PP_ESP[tipo]; } };
  const extra = dif ? 0.1 : 0;
  if (l === 1 && !dif && M.nueva) pon(M.nueva, 2);
  else if (l === 1 && !dif && m === 1) pon('doble', 2);
  else for (const [tipo, [d0, d1]] of Object.entries(M.esp)) pon(tipo, Math.round(total * (d0 + extra + (d1 - d0) * (l / M.niveles))));
  const hayEsp = esp.some(v => v);
  const espArg = hayEsp ? esp : null;
  const opt = ppOptimo(n, mk, need, 80000, espArg);
  // el límite: el menor que deja pasar a la jugadora normal con la probabilidad de la curva (40 partidas simuladas)…
  const tiradas = [];
  for (let k2 = 0; k2 < 40; k2++) tiradas.push(ppVoraz(n, mk, need, az, 0.25, espArg).toques.length);
  tiradas.sort((a, b) => a - b);
  const obj = ppObjetivo(g, dif);
  let limite = tiradas[Math.min(tiradas.length - 1, Math.ceil(obj * tiradas.length) - 1)];
  // …y nunca con más margen sobre el mínimo del que marca ppMargen (salvo el tutorial)
  const tuto = l <= 2 && m === 0 && !dif;
  if (!tuto) limite = Math.min(limite, opt.length + ppMargen(g, dif));
  limite = Math.max(limite, opt.length + (tuto ? 2 : 0));
  // pero sin muros: si casi nadie lo pasaría, un toque más hasta llegar al suelo (más bajo en los difíciles y los jefes)
  const suelo = ppEsDificil(g) || ppEsJefe(g) || dif ? 0.15 : 0.25, pasaCon = lim => tiradas.filter(t => t <= lim).length / tiradas.length;
  while (pasaCon(limite) < suelo && limite < opt.length + 4) limite++;
  const pasa = pasaCon(limite);
  return { g, dif, mundo: m, l, lado: n, mask: mk, need, esp: espArg, opt, limite, pasa, amigos: !dif && M.amigos.includes(l) ? 1 : 0,
    jefe: ppEsJefe(g), dificil: ppEsDificil(g), tutorial: !dif && ((m === 0 && l <= 2) || (m > 0 && l === 1)) };
}
// NIVELES DUELO (Daniel, 30-10-2026: «es demasiado fácil incluso en difícil», y eligió la mezcla): los niveles difíciles (uno de
// cada cinco) y los jefes son un DUELO NIM contra el rival del mundo, en la forma de tablero del nivel: por turnos, cada uno
// revienta las que quiera de UNA fila y pierde quien revienta la última (js/nimnivel.js). El rival juega perfecto salvo cuando
// se despista (`fallo`), cada vez menos de un mundo a otro; el jefe es el CEO. Las burbujas son todas normales.
const PP_RIVALES = ['bunny', 'becario', 'lola', 'cofre', 'becario', 'ceo', 'bunny', 'lola', 'cofre', 'ceo'];
const ppEsNim = g => ppEsDificil(g) || ppEsJefe(g);
function ppNivelNim(g, dif) {
  const [m, l] = ppMundoDe(g), M = PP_MUNDOS[m], az = ppAzar(7000 * (m + 1) + l * 53 + (dif ? 900001 * dif : 0)), jefe = ppEsJefe(g);
  const lado = Math.min(6, Math.max(4, M.lado[1] - (jefe ? 0 : 1) + (dif ? 1 : 0)));   // el difícil, un poco más pequeño que el jefe
  const f = (PP_FORMAS_MUNDO[m][lado] || PP_FORMAS[lado]);
  const mask = jefe ? f[0] : f[Math.floor(az() * f.length)];
  const n = lado, N = n * n, mk = new Uint8Array(N), need = new Array(N).fill(0);
  mask.forEach((fila, y) => [...fila].forEach((ch, x) => { if (ch === '#') { mk[y * n + x] = 1; need[y * n + x] = 1; } }));
  // Daniel (31-10-2026: «son muy difíciles»): al principio el rival falla casi siempre y endurece mundo a mundo hasta el CEO
  let fallo = jefe ? Math.max(0.05, 0.6 - 0.11 * m) : Math.max(0.1, 0.8 - 0.13 * m);
  if (dif === 2) fallo = 0.02;   // pesadilla: el rival casi nunca se equivoca
  else if (dif) fallo = Math.max(0.02, fallo * 0.5);
  return { g, dif, mundo: m, l, lado: n, mask: mk, need, esp: null, opt: [], limite: 99, pasa: 1, amigos: 0, jefe, dificil: !jefe, tutorial: false,
    nim: { rival: jefe ? (m === PP_MUNDOS.length - 1 ? 'ceoespacial' : 'ceo') : PP_RIVALES[m], fallo } };   // el jefe del último mundo: el CEO espacial
}
// MODO PESADILLA (Daniel, 31-10-2026: «muy difícil, con fondo rojo, con el modo de juego del primer boceto»): se abre al ganar el
// difícil de un mundo. Es el «Lights Out» del primer prototipo: tocar una burbuja le da la vuelta a ella y a sus cuatro vecinas (las
// levantadas se hunden y LAS HUNDIDAS VUELVEN A SUBIR); hay que dejarlas todas hundidas. Sin burbujas especiales. El tablero se
// desordena desde el resuelto con `k` toques distintos, así que siempre tiene solución con esos k (las 3 estrellas) y el límite deja
// uno de margen (dos en el primero de cada cinco). Los difíciles y el jefe siguen siendo duelos, con el rival casi perfecto.
// `dif`: 0 fácil, 1 difícil, 2 pesadilla. La clave del nivel lleva delante 'd' (difícil) o 'p' (pesadilla).
const ppPrefijo = dif => (dif === 2 ? 'p' : dif ? 'd' : '');
function ppNivelPesadilla(g) {
  const [m, l] = ppMundoDe(g), M = PP_MUNDOS[m], az = ppAzar(31000 * (m + 1) + l * 101 + 7), jefe = ppEsJefe(g);
  const lado = Math.min(6, Math.max(4, M.lado[1] - (l <= 7 ? 1 : 0)));
  const f = PP_FORMAS_MUNDO[m][lado] || PP_FORMAS[lado];
  const mask = f[Math.floor(az() * f.length)];
  const n = lado, N = n * n, mk = new Uint8Array(N), up = new Array(N).fill(0);
  mask.forEach((fila, y) => [...fila].forEach((ch, x) => { if (ch === '#') mk[y * n + x] = 1; }));
  const celdas = [...Array(N).keys()].filter(i => mk[i]).sort(() => az() - 0.5);
  const k = Math.min(Math.floor(celdas.length / 2), 3 + Math.floor(l / 3) + m);   // cuántos toques hacen falta: crece con el nivel y el mundo
  const opt = celdas.slice(0, k);
  for (const t of opt) for (const j of ppCruz(n, mk, t)) up[j] ^= 1;
  if (!up.some(v => v)) { const t = celdas[k]; opt.push(t); for (const j of ppCruz(n, mk, t)) up[j] ^= 1; }
  const limite = opt.length + (l % 5 === 1 ? 2 : 1);
  return { g, dif: 2, mundo: m, l, lado: n, mask: mk, need: up, esp: null, opt, limite, pasa: 1, amigos: 0, jefe, dificil: ppEsDificil(g), tutorial: false, lo: true };
}
// la solución de un tablero «Lights Out» desde cualquier estado (para la pista y los amigos tras un martillo o una bomba): eliminación
// de Gauss con XOR sobre las burbujas de la forma. null si ese estado ya no tiene solución.
function ppResuelveLO(n, mask, up) {
  const vars = [...Array(n * n).keys()].filter(i => mask[i]), idx = new Map(vars.map((v, k) => [v, k])), V = vars.length;
  const filas = vars.map(i => { const r = new Uint8Array(V + 1); for (const t of ppCruz(n, mask, i)) r[idx.get(t)] = 1; r[V] = up[i] ? 1 : 0; return r; });
  let fila = 0; const piv = [];
  for (let c = 0; c < V && fila < V; c++) {
    let p = fila; while (p < V && !filas[p][c]) p++;
    if (p === V) continue;
    [filas[fila], filas[p]] = [filas[p], filas[fila]];
    for (let r = 0; r < V; r++) if (r !== fila && filas[r][c]) for (let k = c; k <= V; k++) filas[r][k] ^= filas[fila][k];
    piv.push(c); fila++;
  }
  for (let r = fila; r < V; r++) if (filas[r][V]) return null;
  const sol = [];
  piv.forEach((c, r) => { if (filas[r][V]) sol.push(vars[c]); });
  return sol;
}
function ppNivel(g, dif = false) {
  const clave = ppPrefijo(dif) + g;
  if (PP_CACHE_NIVEL[clave]) return PP_CACHE_NIVEL[clave];
  if (ppEsNim(g)) return (PP_CACHE_NIVEL[clave] = ppNivelNim(g, dif));
  if (dif === 2) return (PP_CACHE_NIVEL[clave] = ppNivelPesadilla(g));
  const obj = ppObjetivo(g, dif), intentos = obj >= 1 ? 1 : 6;
  let mejor = null;
  for (let k = 0; k < intentos; k++) { const d = ppConstruye(g, k, dif); if (!mejor || Math.abs(d.pasa - obj) < Math.abs(mejor.pasa - obj)) mejor = d; }
  PP_CACHE_NIVEL[clave] = mejor;
  return mejor;
}
// el primer nivel global de un mundo
function ppInicioMundo(m) { let g = 0; for (let k = 0; k < m; k++) g += PP_MUNDOS[k].niveles; return g; }
