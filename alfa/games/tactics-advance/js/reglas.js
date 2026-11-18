// Fans of Tactics Advance (prototipo) · REGLAS: los personajes y sus cifras, las técnicas, los caminos por casillas, el acierto
// y el daño, y lo que decide Microblizz en su turno. Todo el balance está aquí.
'use strict';

const TIPOS_U = {
  conejo:    { nombre: 'CrazyBunny', clase: 'ANIMALES LOCOS', vida: 182, caos: 40, caos0: 24, atk: 44, def: 10, mov: 4, salto: 2, alcance: 1, tec: ['saltoCaos'] },
  campeon:   { nombre: 'EpicChampion', clase: 'HEROES', vida: 220, caos: 40, caos0: 20, atk: 38, def: 16, mov: 3, salto: 1, alcance: 1, tec: ['tajoEpico'] },
  esqueleto: { nombre: 'Esqueleto en paro', clase: 'NO-MUERTOS', vida: 120, atk: 32, def: 6, mov: 3, salto: 2, alcance: 1 },
  becario:   { nombre: 'Becario sin sueldo', clase: 'MICROBLIZZ', vida: 110, atk: 30, def: 6, mov: 3, salto: 1, alcance: 1 },
  starbot:   { nombre: 'StarBot', clase: 'MICROBLIZZ', vida: 95, atk: 28, def: 4, mov: 3, salto: 1, alcance: 3 },
};
const TECNICAS = {
  saltoCaos: { nombre: 'Salto caótico', coste: 12, alcance: 3, mult: 1.9, acierto: 100, alturaLibre: true },
  tajoEpico: { nombre: 'Tajo épico', coste: 10, alcance: 1, mult: 1.7, acierto: 95 },
};
const AJUSTES = { caosTurno: 6, caosGolpe: 4, aciertoBase: 85, aciertoAltura: 7, danoAltura: 0.1, defensa: 0.6 };
// dónde empieza cada uno; los enemigos dependen del escenario
const SALIDA = {
  aliados: [['conejo', 3, 3], ['campeon', 2, 5]],
  tutorial: { aliados: [['conejo', 3, 3]], enemigos: [['esqueleto', 5, 3]] },
  cementerio: [['esqueleto', 5, 4], ['esqueleto', 7, 5], ['esqueleto', 6, 2], ['esqueleto', 8, 3]],
  oficinas: [['becario', 5, 4], ['starbot', 7, 5], ['becario', 6, 2], ['starbot', 8, 3]],
};
// lo que dicen al caer
const ADIOS = { esqueleto: ['¡Otra vez', 'al paro!'], becario: ['¡Por fin', 'vacaciones!'], starbot: ['Error 404:', 'sueldo'] };

function nuevaUnidad(tipo, gx, gy, eq) {
  const T = TIPOS_U[tipo];
  return { tipo, eq, gx, gy, fx: gx, fy: gy, fh: altura(gx, gy), arco: 0, dx: 0, dy: 0, giro: eq === 'a' ? 1 : -1, pose: 'quieto',
    vida: T.vida, vidaMax: T.vida, vidaVista: T.vida, caos: T.caos0 || 0, caosMax: T.caos || 0, vivo: true, hecho: false, movido: false, golpeado: false, flash: 0, alfa: 1 };
}
const vivos = eq => J.unidades.filter(u => u.vivo && (!eq || u.eq === eq));
const unidadEn = (gx, gy) => J.unidades.find(u => u.vivo && u.gx === gx && u.gy === gy);
const libre = (gx, gy) => gx >= 0 && gy >= 0 && gx < N && gy < N && !esAgua(gx, gy) && !ESC.props.some(q => q[0] === gx && q[1] === gy);
const distancia = (a, b) => Math.abs(a.gx - b.gx) + Math.abs(a.gy - b.gy);

// casillas a las que llega u: mapa 'x,y' → { d, desde } (para rehacer el camino); se puede pasar por aliados, no pararse en ellos
function alcanceMover(u) {
  const T = TIPOS_U[u.tipo], res = new Map([[u.gx + ',' + u.gy, { d: 0, desde: null }]]), cola = [[u.gx, u.gy]];
  while (cola.length) {
    const [x, y] = cola.shift(), d = res.get(x + ',' + y).d;
    if (d >= T.mov) continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
      if (res.has(k) || !libre(nx, ny) || Math.abs(altura(nx, ny) - altura(x, y)) > T.salto) continue;
      const otro = unidadEn(nx, ny);
      if (otro && otro.eq !== u.eq) continue;
      res.set(k, { d: d + 1, desde: x + ',' + y }); cola.push([nx, ny]);
    }
  }
  // por donde hay un aliado se pasa, pero no se puede acabar ahí (se marca, no se borra: puede ser parte de otro camino)
  for (const [k, v] of res) { const [x, y] = k.split(',').map(Number); const o = unidadEn(x, y); if (o && o !== u) v.ocupada = true; }
  return res;
}
function caminoA(mapa, gx, gy) {
  const out = []; let k = gx + ',' + gy;
  while (k) { out.unshift(k.split(',').map(Number)); k = mapa.get(k).desde; }
  return out;
}
// enemigos (o aliados, para Microblizz) a los que u puede dar desde donde está, con su ataque normal o con una técnica
function objetivosDe(u, tec) {
  const al = tec ? TECNICAS[tec].alcance : TIPOS_U[u.tipo].alcance, libreAltura = tec ? TECNICAS[tec].alturaLibre : al > 1;
  return J.unidades.filter(o => o.vivo && o.eq !== u.eq && distancia(u, o) <= al && (libreAltura || Math.abs(altura(o.gx, o.gy) - altura(u.gx, u.gy)) <= 2));
}
function aciertoDe(u, o, tec) {
  if (tec || (TUT && u.eq === 'a')) return tec ? TECNICAS[tec].acierto : 100;   // en el tutorial, los tuyos no fallan
  const dh = altura(u.gx, u.gy) - altura(o.gx, o.gy);
  return Math.max(40, Math.min(100, AJUSTES.aciertoBase + AJUSTES.aciertoAltura * dh));
}
function danoDe(u, o, tec, azar = 1) {
  const dh = Math.max(-2, Math.min(2, altura(u.gx, u.gy) - altura(o.gx, o.gy)));
  const bruto = TIPOS_U[u.tipo].atk * (tec ? TECNICAS[tec].mult : 1) * (1 + AJUSTES.danoAltura * dh) - TIPOS_U[o.tipo].def * AJUSTES.defensa;
  return Math.max(1, Math.round(bruto * azar));
}

/* ---------- lo que hace cada enemigo en su turno ---------- */
// devuelve { camino, objetivo }: a dónde va y a quién pega (si llega a alguien)
function decideEnemigo(u) {
  const mapa = alcanceMover(u), aliados = vivos('a'), al = TIPOS_U[u.tipo].alcance;
  let mejor = null;
  for (const [k, v] of mapa) {
    if (v.ocupada) continue;
    const [x, y] = k.split(',').map(Number);
    for (const o of aliados) {
      const d = Math.abs(x - o.gx) + Math.abs(y - o.gy);
      if (d > al || (al === 1 && Math.abs(altura(x, y) - altura(o.gx, o.gy)) > 2)) continue;
      const nota = -o.vida + altura(x, y) * 8 - v.d + (al > 1 ? d * 5 : 0);
      if (!mejor || nota > mejor.nota) mejor = { nota, x, y, o };
    }
  }
  if (mejor) return { camino: caminoA(mapa, mejor.x, mejor.y), objetivo: mejor.o };
  // nadie a tiro: se acerca al aliado más cercano
  let cerca = null;
  for (const [k, v] of mapa) {
    if (v.ocupada) continue;
    const [x, y] = k.split(',').map(Number);
    const d = Math.min(...aliados.map(o => Math.abs(x - o.gx) + Math.abs(y - o.gy)));
    if (!cerca || d < cerca.d) cerca = { d, x, y };
  }
  return { camino: cerca ? caminoA(mapa, cerca.x, cerca.y) : [[u.gx, u.gy]], objetivo: null };
}
