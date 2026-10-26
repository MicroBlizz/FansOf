// Fans Of Taxi · CIUDAD: el mundo entero montado: las tres ciudades (MANZANAS), las carreteras de fuera y el río (CARRETERAS), todo en
// un solo grafo de cruces (nodos con altura) por el que van el tráfico, los rivales y la policía. De aquí salen la altura del suelo en
// cualquier punto (el terreno natural aplanado bajo las carreteras; el río hunde; los túneles solo cuentan para quien va dentro), qué
// suelo pisas (asfalto, acera, hierba, tierra, nieve, agua), los obstáculos cercanos (edificios, árboles, rocas, pretiles), el camino
// más corto, y los datos por trozo con los que la pantalla monta cada parte del mundo. Sin DOM ni three: se prueba con Node.
'use strict';
const CIUDAD = (() => {
  const M = TAXI.mundo, MO = M.montaña, azar = mulberry32(M.semilla);
  const suave = TERRENO.suave;
  // --- el grafo
  const nodos = [], aristas = [], compartidos = {};
  const g = {
    nodo: (x, z, extra = {}) => { const n = { id: nodos.length, x, z, y: TERRENO.natural(x, z) + (extra.bajo || 0), vecinos: [], ...extra }; nodos.push(n); return n; },
    une: (a, b, ancho, tipo) => { a.vecinos.push(b.id); b.vecinos.push(a.id); aristas.push({ a: a.id, b: b.id, ancho, tipo, largo: Math.hypot(a.x - b.x, a.z - b.z) }); },
    compartido: (k, n) => { if (n) compartidos[k] = n; return compartidos[k]; },
  };
  // --- las ciudades
  const ciudades = TERRENO.ciudades.map((c, indice) => {
    const r = MANZANAS.generar({ ...c, indice }, azar, g);
    const anillo = nodos.filter(n => n.ciudad === indice && n.tipo === 'anillo');
    const esquinas = [[0, 0], [r.NX - 1, 0], [0, r.NZ - 1], [r.NX - 1, r.NZ - 1]].map(([i, j]) => r.nodos[i][j]).filter(Boolean);
    return { ...c, indice, ...r, anillo, esquinas, nodo: (i, j) => r.nodos[i] && r.nodos[i][j] };
  });
  const celdas = ciudades.flatMap(c => c.celdas);
  // --- lo de fuera
  const rio = CARRETERAS.rio();
  const enlaces = CARRETERAS.enlaces(ciudades, g);
  const monte = CARRETERAS.montaña(ciudades, g);
  const miradores = monte.miradores;

  // --- índices por celdas de 64 m: nodos, aristas (con su banda de influencia) y obstáculos
  const CEL = 64, NCX = Math.ceil(M.ancho / CEL) + 1, NCZ = Math.ceil(M.largo / CEL) + 1;
  const celda = (x, z) => clamp(Math.floor(x / CEL), 0, NCX - 1) * NCZ + clamp(Math.floor(z / CEL), 0, NCZ - 1);
  const iNodos = new Array(NCX * NCZ), iAristas = new Array(NCX * NCZ), iObst = new Array(NCX * NCZ);
  const mete = (indice, x0, z0, x1, z1, cosa) => { for (let i = clamp(Math.floor(x0 / CEL), 0, NCX - 1); i <= clamp(Math.floor(x1 / CEL), 0, NCX - 1); i++) for (let j = clamp(Math.floor(z0 / CEL), 0, NCZ - 1); j <= clamp(Math.floor(z1 / CEL), 0, NCZ - 1); j++) (indice[i * NCZ + j] || (indice[i * NCZ + j] = [])).push(cosa); };
  for (const n of nodos) mete(iNodos, n.x, n.z, n.x, n.z, n);
  const BANDA = { calle: [0, 30], avenida: [0, 30], callejon: [0, 20], anillo: [0, 30], enlace: [M.margen, M.fundido], montaña: [M.margen, M.fundido], cima: [M.margen, M.fundido], mirador: [0, 10], rampa: [0, 4], tunel: [0, 0] };
  for (const e of aristas) {
    const a = nodos[e.a], b = nodos[e.b], [mg, fu] = BANDA[e.tipo]; e.margen = mg; e.fundido = fu; e.alcance = e.ancho / 2 + mg + fu;
    mete(iAristas, Math.min(a.x, b.x) - e.alcance, Math.min(a.z, b.z) - e.alcance, Math.max(a.x, b.x) + e.alcance, Math.max(a.z, b.z) + e.alcance, e);
  }
  // distancia de (x, z) a una arista y la altura de la carretera en ese punto
  function sobreArista(e, x, z) {
    const a = nodos[e.a], b = nodos[e.b], dx = b.x - a.x, dz = b.z - a.z, L2 = dx * dx + dz * dz || 1;
    const t = clamp(((x - a.x) * dx + (z - a.z) * dz) / L2, 0, 1);
    return { d: Math.hypot(x - a.x - dx * t, z - a.z - dz * t), y: lerp(a.y, b.y, t), t };
  }
  // la carretera que manda en un punto: la más cercana dentro de su alcance; con `yRef` (un coche), la de altura parecida (túneles)
  function carreteraEn(x, z, yRef, sinTuneles) {
    const lista = iAristas[celda(x, z)]; if (!lista) return null;
    let mejor = null, mejorD = Infinity;
    for (const e of lista) {
      if (sinTuneles && e.tipo === 'tunel') continue;
      const s = sobreArista(e, x, z); if (s.d > e.alcance) continue;
      const penal = yRef !== undefined ? Math.min(60, Math.abs(s.y - yRef) * 4) : (e.tipo === 'tunel' ? 1000 : 0);
      if (s.d + penal < mejorD) { mejorD = s.d + penal; mejor = { e, ...s }; }
    }
    return mejor;
  }
  const distCarretera = (x, z) => { const c = carreteraEn(x, z, undefined, true); return c ? c.d : Infinity; };
  const enRio = (x, z) => { const r = CARRETERAS.cauce(rio, x, z); return r.d < r.ancho / 2; };
  // altura para un coche (las carreteras y los puentes mandan; los túneles, para quien va dentro)
  function altura(x, z, yRef) {
    const c = carreteraEn(x, z, yRef, false);
    const nat = natural(x, z);
    if (!c) return nat;
    const w = 1 - suave(c.e.ancho / 2 + c.e.margen, c.e.alcance, c.d);
    if (c.e.tipo === 'tunel') return w > 0.99 ? c.y : lerp(nat, c.y, w);
    return lerp(nat, c.y, w);
  }
  // altura del terreno natural con el mar y el río (sin carreteras)
  function natural(x, z) {
    let h = TERRENO.natural(x, z);
    const t = TERRENO.tierra(x, z); if (t < 1) h = lerp(M.nivelMar - 2 - (1 - t) * 6, h, t);
    const r = CARRETERAS.cauce(rio, x, z);
    if (r.d < r.ancho / 2 + 22) { const w = 1 - suave(r.ancho / 2 - 4, r.ancho / 2 + 22, r.d); h = lerp(h, Math.min(h, r.y), w); }
    return h;
  }
  // altura para pintar el suelo: como la de un coche sin túneles, pero el río gana a la carretera (ahí hay un puente encima)
  function alturaSuelo(x, z) {
    const r = CARRETERAS.cauce(rio, x, z);
    if (r.d < r.ancho / 2) return natural(x, z);
    return altura(x, z, undefined);
  }
  // qué suelo hay: asfalto, acera, hierba, tierra, nieve, agua
  function suelo(x, z, yRef) {
    const c = carreteraEn(x, z, yRef, false);
    if (c && c.d <= c.e.ancho / 2) return c.e.tipo === 'tunel' || c.e.tipo === 'rampa' ? 'tunel' : 'asfalto';
    if (enRio(x, z) || TERRENO.tierra(x, z) < 0.5) return 'agua';
    if (c && c.d <= c.e.ancho / 2 + c.e.margen) return 'tierra';
    const m = manzanaEn(x, z);
    if (m) return m.parque ? 'hierba' : m.barrio === 'aeropuerto' ? 'asfalto' : 'acera';
    const h = TERRENO.natural(x, z);
    return h > M.nieve ? 'nieve' : h > M.roca ? 'tierra' : 'hierba';
  }
  // --- las celdas de las ciudades
  function manzanaEn(x, z) {
    const c = TERRENO.ciudadEn(x, z); if (!c) return null;
    const C = ciudades[TERRENO.ciudades.indexOf(c)];
    let i = -1; while (i + 1 < C.lx.length && C.lx[i + 1].pos + c.x0 <= x) i++;
    let j = -1; while (j + 1 < C.lz.length && C.lz[j + 1].pos + c.z0 <= z) j++;
    if (i < 0 || j < 0 || i >= C.lx.length - 1 || j >= C.lz.length - 1) return null;
    const m = C.celdas.find(q => q.i === i && q.j === j);
    return m && x >= m.x0 && x <= m.x1 && z >= m.z0 && z <= m.z1 ? m : null;
  }
  const aristaDe = new Map(); for (const e of aristas) { aristaDe.set(e.a + ',' + e.b, e); aristaDe.set(e.b + ',' + e.a, e); }
  // --- obstáculos: edificios (cajas), árboles y rocas (círculos), pretiles de puentes y paredes de túneles (cajas con altura)
  const obstaculos = [];
  const caja = (x0, z0, x1, z1, extra) => { const o = { x0, z0, x1, z1, ...extra }; obstaculos.push(o); mete(iObst, x0 - 3, z0 - 3, x1 + 3, z1 + 3, o); };
  const circulo = (x, z, radio, extra) => { const o = { x, z, radio, ...extra }; obstaculos.push(o); mete(iObst, x - radio - 3, z - radio - 3, x + radio + 3, z + radio + 3, o); };
  for (const m of celdas) { for (const e of m.edificios) caja(e.x - e.w / 2, e.z - e.d / 2, e.x + e.w / 2, e.z + e.d / 2, { edificio: true }); for (const a of m.arboles) circulo(a.x, a.z, a.radio * 0.6); }
  const campo = CARRETERAS.campo(azar, distCarretera, enRio);
  for (const o of campo) circulo(o.x, o.z, o.tipo === 'roca' ? o.radio * 0.9 : o.radio * 0.5);
  // paredes de los túneles y de las rampas, a los lados de cada tramo (solo cuentan a su altura). En un cruce (con otro túnel o con la
  // circunvalación) la pared se recorta para no cortar el paso
  const paredes = [];
  const recorte = (n, e) => { let r = 0; for (const v of n.vecinos) { const o = aristaDe.get(n.id + ',' + v); if (o && o !== e && !(o.tipo === e.tipo && n.vecinos.length === 2)) r = Math.max(r, o.ancho / 2 + 1.5); } return r; };
  for (const e of aristas) if (e.tipo === 'tunel' || e.tipo === 'rampa') {
    const a = nodos[e.a], b = nodos[e.b], dx = b.x - a.x, dz = b.z - a.z, L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, nx = -uz, nz = ux, y = Math.min(a.y, b.y);
    const ra = recorte(a, e), rb = recorte(b, e); if (ra + rb >= L - 1) continue;
    e.recorte = [ra, rb];
    const ax = a.x + ux * ra, az = a.z + uz * ra, bx = b.x - ux * rb, bz = b.z - uz * rb;
    for (const lado of [-1, 1]) {
      const ox = nx * lado * (e.ancho / 2 + 0.6), oz = nz * lado * (e.ancho / 2 + 0.6);
      const x0 = ax + ox, x1 = bx + ox, z0 = az + oz, z1 = bz + oz;
      const p = { x0: Math.min(x0, x1) - 0.6, z0: Math.min(z0, z1) - 0.6, x1: Math.max(x0, x1) + 0.6, z1: Math.max(z0, z1) + 0.6, y0: y - 2, y1: Math.max(a.y, b.y) + 7, pared: true };
      obstaculos.push(p); mete(iObst, p.x0 - 3, p.z0 - 3, p.x1 + 3, p.z1 + 3, p); paredes.push({ ...p, arista: e });
    }
  }
  // --- los puentes: donde una carretera de superficie cruza el río
  const puentes = [];
  for (const e of aristas) {
    if (e.tipo === 'tunel' || e.tipo === 'rampa') continue;
    const a = nodos[e.a], b = nodos[e.b];
    for (let i = 0; i < rio.length - 1; i++) {
      const p = rio[i], q = rio[i + 1];
      const d = (b.x - a.x) * (q.z - p.z) - (b.z - a.z) * (q.x - p.x); if (Math.abs(d) < 1e-6) continue;
      const t = ((p.x - a.x) * (q.z - p.z) - (p.z - a.z) * (q.x - p.x)) / d, u = ((p.x - a.x) * (b.z - a.z) - (p.z - a.z) * (b.x - a.x)) / d;
      if (t < 0 || t > 1 || u < 0 || u > 1) continue;
      const x = lerp(a.x, b.x, t), z = lerp(a.z, b.z, t), ancho = lerp(p.ancho, q.ancho, u), ang = Math.atan2(b.x - a.x, b.z - a.z);
      const pu = { x, z, y: lerp(a.y, b.y, t), ang, largo: ancho + 36, ancho: e.ancho, arista: e };
      puentes.push(pu);
      // pretiles a los lados
      const s = Math.sin(ang), co = Math.cos(ang), nx = co, nz = -s;
      for (const lado of [-1, 1]) { const cx = x + nx * lado * (e.ancho / 2 + 0.5), cz = z + nz * lado * (e.ancho / 2 + 0.5), hx = Math.abs(s) * pu.largo / 2 + Math.abs(co) * 0.5, hz = Math.abs(co) * pu.largo / 2 + Math.abs(s) * 0.5; caja(cx - hx, cz - hz, cx + hx, cz + hz, { y0: pu.y - 2, y1: pu.y + 2, pretil: true }); }
    }
  }
  const cerca = (x, z) => iObst[celda(x, z)] || [];
  const libre = (x, z, y) => !cerca(x, z).some(o => o.x0 !== undefined && x > o.x0 && x < o.x1 && z > o.z0 && z < o.z1 && (o.y0 === undefined || (y > o.y0 && y < o.y1)));
  // --- consultas del grafo
  function nodosEn(x, z, rMin, rMax) {
    const lista = [], c = Math.ceil(rMax / CEL);
    const ci = clamp(Math.floor(x / CEL), 0, NCX - 1), cj = clamp(Math.floor(z / CEL), 0, NCZ - 1);
    for (let i = Math.max(0, ci - c); i <= Math.min(NCX - 1, ci + c); i++) for (let j = Math.max(0, cj - c); j <= Math.min(NCZ - 1, cj + c); j++) { const l = iNodos[i * NCZ + j]; if (l) for (const n of l) { const d = Math.hypot(n.x - x, n.z - z); if (d >= rMin && d <= rMax) lista.push(n); } }
    return lista;
  }
  function nodoCercano(x, z, yRef) {
    for (let r = 64; r <= 2048; r *= 2) {
      const l = nodosEn(x, z, 0, r); if (!l.length) continue;
      let mejor = null, mejorD = Infinity;
      for (const n of l) { const d = Math.hypot(n.x - x, n.z - z) + (yRef !== undefined ? Math.min(80, Math.abs(n.y - yRef) * 6) : (n.tipo === 'tunel' ? 40 : 0)); if (d < mejorD) { mejorD = d; mejor = n; } }
      return mejor;
    }
    return nodos[0];
  }
  // camino más corto (Dijkstra con una cola sencilla: el grafo es pequeño)
  function camino(desde, hasta) {
    if (desde === hasta) return [desde];
    const dist = new Map([[desde, 0]]), prev = new Map(), abierta = [desde], cerrada = new Set();
    while (abierta.length) {
      let k = 0; for (let i = 1; i < abierta.length; i++) if (dist.get(abierta[i]) < dist.get(abierta[k])) k = i;
      const n = abierta.splice(k, 1)[0]; if (n === hasta) break; cerrada.add(n);
      for (const v of nodos[n].vecinos) { if (cerrada.has(v)) continue; const d = dist.get(n) + aristaDe.get(n + ',' + v).largo; if (!dist.has(v) || d < dist.get(v)) { dist.set(v, d); prev.set(v, n); if (!abierta.includes(v)) abierta.push(v); } }
    }
    if (!prev.has(hasta)) return [desde];
    const c = [hasta]; let k = hasta; while ((k = prev.get(k)) !== undefined) c.unshift(k); return c;
  }
  // el carril derecho yendo de un cruce a otro: separación según el ancho de esa calle
  function carril(a, b, lado = 1) {
    const e = aristaDe.get(a.id + ',' + b.id), sep = e ? clamp(e.ancho * 0.24, 1.6, 5.5) : M.carril;
    const dx = b.x - a.x, dz = b.z - a.z, L = Math.hypot(dx, dz) || 1;
    return { ox: -dz / L * sep * lado, oz: dx / L * sep * lado };
  }
  // un punto de acera de una celda con calle, cerca de un sitio si se pide
  function puntoAcera(azarFn = Math.random, cercaDe = null, radio = 400) {
    let lista = celdas.filter(m => !m.torre && (m.lados.izq || m.lados.der || m.lados.arriba || m.lados.abajo));
    if (cercaDe) { const l2 = lista.filter(m => Math.hypot((m.x0 + m.x1) / 2 - cercaDe.x, (m.z0 + m.z1) / 2 - cercaDe.z) < radio); if (l2.length) lista = l2; }
    const m = lista[(azarFn() * lista.length) | 0];
    const lados = ['izq', 'der', 'arriba', 'abajo'].filter(l => m.lados[l]); const lado = lados[(azarFn() * lados.length) | 0];
    const t = 0.15 + azarFn() * 0.7, s = M.acera * 0.45;
    const x = lado === 'izq' ? m.x0 + s : lado === 'der' ? m.x1 - s : lerp(m.x0, m.x1, t);
    const z = lado === 'arriba' ? m.z0 + s : lado === 'abajo' ? m.z1 - s : lerp(m.z0, m.z1, t);
    const mira = lado === 'izq' ? -Math.PI / 2 : lado === 'der' ? Math.PI / 2 : lado === 'arriba' ? Math.PI : 0;
    return { x, z, y: altura(x, z), mira, manzana: m };
  }
  // en qué zona estás (para el letrero al entrar)
  function zona(x, z) {
    for (const m of miradores) if (Math.hypot(m.x - x, m.z - z) < m.radio + 6) return m.nombre;
    const c = TERRENO.ciudadEn(x, z); if (c) return c.nombre;
    if (Math.hypot(x - MO.x, z - MO.z) < MO.radio) return 'La Montaña';
    return null;
  }
  // --- rampas de salto (en la primera ciudad) y escondites (parques)
  const rampas = [];
  for (const e of aristas) { if (rampas.length >= 3) break; const a = nodos[e.a], b = nodos[e.b]; if (a.ciudad !== 0 || e.tipo !== 'calle' || e.largo < 40 || rampas.some(r => Math.hypot(r.x - a.x, r.z - a.z) < 150)) continue; const of = carril(a, b); rampas.push({ x: (a.x + b.x) / 2 + of.ox, z: (a.z + b.z) / 2 + of.oz, ang: Math.atan2(b.x - a.x, b.z - a.z), largo: 7, ancho: 4 }); }
  const escondites = ciudades.flatMap(c => c.celdas.filter(m => m.parque).slice(0, 3).map(m => ({ x: (m.x0 + m.x1) / 2, z: (m.z0 + m.z1) / 2, radio: Math.min(12, (m.x1 - m.x0) / 2) })));
  // --- los trozos: qué hay en cada uno (para montar la pantalla por partes)
  const TR = M.trozo, NTX = Math.ceil(M.ancho / TR), NTZ = Math.ceil(M.largo / TR);
  const trozos = [];
  for (let i = 0; i < NTX; i++) for (let j = 0; j < NTZ; j++) {
    const x0 = i * TR, z0 = j * TR, x1 = x0 + TR, z1 = z0 + TR, dentro = (x, z, m = 0) => x >= x0 - m && x < x1 + m && z >= z0 - m && z < z1 + m;
    const t = { i, j, x0, z0, x1, z1, celdas: celdas.filter(m => m.x1 > x0 && m.x0 < x1 && m.z1 > z0 && m.z0 < z1), aristas: [], campo: campo.filter(o => dentro(o.x, o.z)), puentes: puentes.filter(p => dentro(p.x, p.z)), rampas: rampas.filter(r => dentro(r.x, r.z)), escondites: escondites.filter(e => dentro(e.x, e.z)), miradores: miradores.filter(m => dentro(m.x, m.z)), rio: rio.filter(p => dentro(p.x, p.z, 80)) };
    for (const e of aristas) { const a = nodos[e.a], b = nodos[e.b]; if (Math.max(a.x, b.x) + e.alcance > x0 && Math.min(a.x, b.x) - e.alcance < x1 && Math.max(a.z, b.z) + e.alcance > z0 && Math.min(a.z, b.z) - e.alcance < z1) t.aristas.push(e); }
    trozos.push(t);
  }
  const trozoEn = (x, z) => trozos[clamp(Math.floor(x / TR), 0, NTX - 1) * NTZ + clamp(Math.floor(z / TR), 0, NTZ - 1)];
  return { ancho: M.ancho, largo: M.largo, ciudades, celdas, nodos, aristas, aristaDe, rio, enlaces, monte, miradores, puentes, paredes, campo, rampas, escondites, trozos, trozoEn, NTX, NTZ,
    altura, alturaSuelo, natural, suelo, manzanaEn, carreteraEn, distCarretera, enRio, cerca, libre, nodosEn, nodoCercano, camino, carril, puntoAcera, zona, BARRIOS: MANZANAS.BARRIOS, cauce: (x, z) => CARRETERAS.cauce(rio, x, z) };
})();
