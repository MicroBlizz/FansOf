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
    return { ...c, indice, ...r, anillo, nodo: (i, j) => r.nodos[i] && r.nodos[i][j] };
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
  // --- el perfil de cada carretera: los cruces son PLANOS. Cerca de un cruce (tres calles o más) la calzada va a la altura del nudo,
  // y la cuesta queda en el medio del tramo. Si cada calle llegase con su pendiente, el cruce sería una silla de montar torcida y se
  // doblaría en pliegues (reportes 9 y 10 de Arkioner, 27-10-2026). Las curvas de dos tramos (horquillas del monte) siguen en cuesta.
  const LLANO_ANTES = 4;        // metros llanos más allá del borde del cruce
  const CUESTA_MINIMA = 0.4;    // la cuesta ocupa al menos esta parte del tramo
  const esCruce = n => n.vecinos.length >= 3;
  function llanoEn(n, e) {
    if (!esCruce(n)) return 0;
    let mitad = 0;
    for (const o of aristas) if (o !== e && (o.a === n.id || o.b === n.id)) mitad = Math.max(mitad, o.ancho / 2);
    return mitad + LLANO_ANTES;
  }
  for (const e of aristas) {
    let la = llanoEn(nodos[e.a], e), lb = llanoEn(nodos[e.b], e);
    const sobra = la + lb - e.largo * (1 - CUESTA_MINIMA);
    if (sobra > 0) { const k = (la + lb - sobra) / (la + lb); la *= k; lb *= k; }
    e.llano = [la, lb];
  }
  // la altura de la calzada a una fracción t (0 en a, 1 en b) del tramo
  function alturaArista(e, t) {
    const a = nodos[e.a], b = nodos[e.b], [la, lb] = e.llano || [0, 0];
    const cuesta = clamp((t * e.largo - la) / (e.largo - la - lb), 0, 1);
    return lerp(a.y, b.y, cuesta);
  }
  // distancia de (x, z) a una arista y la altura de la carretera en ese punto
  function sobreArista(e, x, z) {
    const a = nodos[e.a], b = nodos[e.b], dx = b.x - a.x, dz = b.z - a.z, L2 = dx * dx + dz * dz || 1;
    const t = clamp(((x - a.x) * dx + (z - a.z) * dz) / L2, 0, 1);
    return { d: Math.hypot(x - a.x - dx * t, z - a.z - dz * t), y: alturaArista(e, t), t };
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
    // sobre una trinchera no hay terreno: el único suelo es su calzada (si no, se pisaría un suelo invisible por encima del hueco)
    const trinchera = trincheraEn(x, z);
    if (trinchera) return trinchera.y;
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
  // La altura del terreno que se dibuja: el natural con las carreteras de superficie encima. Túneles y trincheras no cuentan: tienen
  // su propia malla (CINTAS) y el terreno sigue por encima (sobre la trinchera se recorta, ver enTrinchera). Bajo la calzada queda
  // un poco hundido para que nunca asome a través de la cinta de asfalto.
  const BAJO_CALZADA = 0.15;
  function alturaSuelo(x, z) {
    const nat = natural(x, z);
    if (enRio(x, z)) return nat;
    const c = carreteraDeSuperficie(x, z);
    if (!c) return nat;
    const y = lerp(nat, c.y, 1 - suave(c.e.ancho / 2 + c.e.margen, c.e.alcance, c.d));
    return c.d < c.e.ancho / 2 + 0.3 ? y - BAJO_CALZADA : y;
  }
  // la carretera de superficie más cercana dentro de su alcance (ni túneles ni trincheras)
  function carreteraDeSuperficie(x, z) {
    let mejor = null;
    for (const e of iAristas[celda(x, z)] || []) {
      if (e.tipo === 'tunel' || e.tipo === 'rampa') continue;
      const s = sobreArista(e, x, z);
      if (s.d <= e.alcance && (!mejor || s.d < mejor.d)) mejor = { e, ...s };
    }
    return mejor;
  }
  // ¿está el punto sobre una trinchera (entre sus muros, sin contar más allá de sus extremos)? Ahí el terreno no se dibuja
  const ANCHO_EXTRA_TRINCHERA = 1.3;   // de la calzada a la cara de fuera del muro
  function trincheraEn(x, z) {
    for (const e of iAristas[celda(x, z)] || []) {
      if (e.tipo !== 'rampa') continue;
      const s = sobreArista(e, x, z);
      if (s.t > 0 && s.t < 1 && s.d <= e.ancho / 2 + ANCHO_EXTRA_TRINCHERA) return { e, ...s };
    }
    return null;
  }
  const enTrinchera = (x, z) => trincheraEn(x, z) !== null;
  // un punto de una rampa que ya está dentro de la boca (más allá del portal)
  function bajoPortal(c) {
    if (c.e.tipo !== 'rampa' || !c.e.recorte) return false;
    const a = nodos[c.e.a], b = nodos[c.e.b], [ra, rb] = c.e.recorte;
    return (b.boca && (1 - c.t) * c.e.largo <= rb) || (a.boca && c.t * c.e.largo <= ra);
  }
  // qué suelo hay: asfalto, acera, hierba, tierra, nieve, agua
  function suelo(x, z, yRef) {
    let c = carreteraEn(x, z, yRef, yRef === undefined);   // sin coche (pintar el suelo), lo de encima de los túneles
    if (c && yRef === undefined && bajoPortal(c)) c = null;
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
  // --- obstáculos: edificios (cajas), árboles y rocas (círculos), y tramos (un segmento con grosor y altura: pretiles de puentes,
  // paredes de túneles y trincheras, quitamiedos). Los tramos van orientados: valen para carreteras en diagonal
  const obstaculos = [];
  const caja = (x0, z0, x1, z1, extra) => { const o = { x0, z0, x1, z1, ...extra }; obstaculos.push(o); mete(iObst, x0 - 3, z0 - 3, x1 + 3, z1 + 3, o); };
  const tramo = (ax, az, bx, bz, radio, y0, y1, extra) => { const o = { ax, az, bx, bz, radio, y0, y1, ...extra }; obstaculos.push(o); mete(iObst, Math.min(ax, bx) - radio - 3, Math.min(az, bz) - radio - 3, Math.max(ax, bx) + radio + 3, Math.max(az, bz) + radio + 3, o); return o; };
  const circulo = (x, z, radio, extra) => { const o = { x, z, radio, ...extra }; obstaculos.push(o); mete(iObst, x - radio - 3, z - radio - 3, x + radio + 3, z + radio + 3, o); };
  // edificios y árboles: desde un poco por debajo del suelo hacia arriba (los túneles pasan por debajo sin chocar)
  const pie = (...p) => Math.min(...p.map(([x, z]) => natural(x, z))) - 4;
  for (const m of celdas) {
    for (const e of m.edificios) { const x0 = e.x - e.w / 2, z0 = e.z - e.d / 2, x1 = e.x + e.w / 2, z1 = e.z + e.d / 2; caja(x0, z0, x1, z1, { edificio: true, y0: pie([x0, z0], [x1, z0], [x0, z1], [x1, z1], [e.x, e.z]), y1: 1e4 }); }
    for (const a of m.arboles) circulo(a.x, a.z, a.radio * 0.6, { y0: pie([a.x, a.z]), y1: 1e4 });
  }
  const campo = CARRETERAS.campo(azar, distCarretera, enRio);
  for (const o of campo) circulo(o.x, o.z, o.tipo === 'roca' ? o.radio * 0.9 : o.radio * 0.5);
  // paredes de los túneles y de las rampas, a los lados de cada tramo (solo cuentan a su altura). En un cruce (con otro túnel o con la
  // circunvalación) la pared se recorta para no cortar el paso
  const paredes = [];
  const subt = t => t === 'tunel' || t === 'rampa';
  const giroEn = (n, e, o) => { const a = nodos[e.a === n.id ? e.b : e.a], b = nodos[o.a === n.id ? o.b : o.a]; return Math.abs(Math.PI - Math.abs(Math.atan2(a.x - n.x, a.z - n.z) - Math.atan2(b.x - n.x, b.z - n.z))) % (Math.PI * 2); };   // cuánto dobla la carretera en n
  // dónde se corta la pared de e en el nudo n: en un cruce o un giro cerrado, en el borde de los otros; si solo sigue otro tramo y
  // gira poco, la pared sigue (igual que las cintas, ver CINTAS.geometria)
  const recorte = (n, e) => {
    if (n.vecinos.length === 2) { const o = aristaDe.get(n.id + ',' + n.vecinos.find(v => v !== (e.a === n.id ? e.b : e.a))); if (o && giroEn(n, e, o) < 1.2) return 0; }
    let r = 0;
    for (const v of n.vecinos) { const o = aristaDe.get(n.id + ',' + v); if (o && o !== e) r = Math.max(r, o.ancho / 2 + 0.5); }
    return r;
  };
  for (const e of aristas) if (e.tipo === 'tunel' || e.tipo === 'rampa') {
    const a = nodos[e.a], b = nodos[e.b], dx = b.x - a.x, dz = b.z - a.z, L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, nx = -uz, nz = ux, y = Math.min(a.y, b.y);
    const ra = recorte(a, e), rb = recorte(b, e); if (ra + rb >= L - 1) continue;
    e.recorte = [ra, rb];
    const ax = a.x + ux * ra, az = a.z + uz * ra, bx = b.x - ux * rb, bz = b.z - uz * rb;
    for (const lado of [-1, 1]) {
      const ox = nx * lado * (e.ancho / 2 + 0.6), oz = nz * lado * (e.ancho / 2 + 0.6);
      // la pared de una trinchera (rampa) llega hasta la superficie; la de un túnel nunca asoma a la calle de encima
      const y1 = e.tipo === 'rampa' ? Math.max(natural(a.x, a.z), natural(b.x, b.z)) + 2 : Math.min(Math.max(a.y, b.y) + 6, Math.min(natural(a.x, a.z), natural(b.x, b.z)) - 2);
      paredes.push({ ...tramo(ax + ox, az + oz, bx + ox, bz + oz, 0.6, y - 2, y1, { pared: true }), arista: e });
    }
  }
  // --- quitamiedos: a los dos lados de las carreteras de fuera (tras el margen de tierra) y por fuera de la circunvalación. Así el
  // mapa queda cerrado: de la carretera solo se sale al margen. Cada carretera es una cadena de nodos: el quitamiedos es su polilínea
  // desplazada (en las curvas se desplaza por la bisectriz, así nunca cruza la calzada), recortada donde sale otra carretera o hay puente
  const quitamiedos = [];
  const anchoDe = (a, b) => aristaDe.get(a.id + ',' + b.id);
  function vallaCadena(cadena, lados, cerrada) {
    const n = cadena.length; if (n < 2) return;
    const e0 = anchoDe(cadena[0], cadena[1]); if (!e0) return;
    const sep = e0.ancho / 2 + e0.margen + (e0.tipo === 'anillo' ? 4 : 1);   // en la circunvalación queda un arcén de 4 m
    for (const lado of lados) {
      const puntos = [];
      for (let k = 0; k < n; k++) {
        const p = cadena[k], a = cerrada ? cadena[(k - 1 + n) % n] : cadena[Math.max(0, k - 1)], b = cerrada ? cadena[(k + 1) % n] : cadena[Math.min(n - 1, k + 1)];
        let dx = b.x - a.x, dz = b.z - a.z; const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;   // la tangente en p (bisectriz)
        const d1x = p.x - a.x, d1z = p.z - a.z, d2x = b.x - p.x, d2z = b.z - p.z, l1 = Math.hypot(d1x, d1z) || 1, l2 = Math.hypot(d2x, d2z) || 1;
        const cosMed = Math.max(0.5, Math.abs((d1x * d2x + d1z * d2z) / (l1 * l2) + 1) / 2);   // cuanto más cerrada la curva, más lejos queda la esquina del desplazamiento
        puntos.push({ x: p.x - dz * lado * sep / Math.sqrt(cosMed), z: p.z + dx * lado * sep / Math.sqrt(cosMed), nodo: p });
      }
      const m = cerrada ? n : n - 1;
      for (let k = 0; k < m; k++) {
        const A = puntos[k], B = puntos[(k + 1) % n], e = anchoDe(A.nodo, B.nodo); if (!e) continue;
        if (rio.length && CARRETERAS.cauce(rio, (A.x + B.x) / 2, (A.z + B.z) / 2).d < 40) continue;   // en el puente ya hay pretil
        // recortar alrededor de los cruces de este lado: donde sale otra carretera por aquí no hay valla
        let tramos = [[0, 1]];
        for (const P of [A.nodo, B.nodo]) for (const v of P.vecinos) {
          const o = nodos[v], oe = aristaDe.get(P.id + ',' + v); if (!oe || o === A.nodo || o === B.nodo || cadena.includes(o)) continue;
          const sx = -(B.z - A.z), sz = B.x - A.x; if ((o.x - P.x) * sx + (o.z - P.z) * sz < 0) continue;   // sale por el otro lado
          const r = sep + oe.ancho / 2 + oe.margen + 3, dx = B.x - A.x, dz = B.z - A.z, L2 = dx * dx + dz * dz || 1;   // la valla va a `sep` de su eje: el hueco cuenta desde ahí
          const t0 = ((P.x - A.x) * dx + (P.z - A.z) * dz) / L2, h = Math.hypot(P.x - A.x - dx * t0, P.z - A.z - dz * t0);
          if (h >= r) continue; const w = Math.sqrt(r * r - h * h) / Math.sqrt(L2), ta = t0 - w, tb = t0 + w;
          tramos = tramos.flatMap(([u0, u1]) => u1 <= ta || u0 >= tb ? [[u0, u1]] : [[u0, Math.min(u1, ta)], [Math.max(u0, tb), u1]].filter(([q0, q1]) => q1 - q0 > 0.02));
        }
        for (const [u0, u1] of tramos) {
          const q = { ax: lerp(A.x, B.x, u0), az: lerp(A.z, B.z, u0), bx: lerp(A.x, B.x, u1), bz: lerp(A.z, B.z, u1), ya: lerp(A.nodo.y, B.nodo.y, u0), yb: lerp(A.nodo.y, B.nodo.y, u1), arista: e };
          tramo(q.ax, q.az, q.bx, q.bz, 0.3, Math.min(A.nodo.y, B.nodo.y) - 3, Math.max(A.nodo.y, B.nodo.y) + 3, { quitamiedos: true }); quitamiedos.push(q);
        }
      }
    }
  }
  for (const en of enlaces) vallaCadena(en, [-1, 1], false);
  for (const su of monte.subidas) vallaCadena(su, [-1, 1], false);
  vallaCadena(monte.vuelta, [-1, 1], true);
  for (const c of ciudades) {   // la circunvalación en orden, y solo el lado de fuera
    const inicio = c.anillo[0], orden = [inicio]; let prev = null, cur = inicio;
    for (let k = 0; k < c.anillo.length; k++) { const sig = cur.vecinos.map(v => nodos[v]).find(o => o !== prev && o.tipo === 'anillo' && o.ciudad === c.indice && o !== inicio); if (!sig) break; orden.push(sig); prev = cur; cur = sig; }
    const m = orden[1], lado = Math.sign(-(m.z - inicio.z) * (inicio.x - c.cx) + (m.x - inicio.x) * (inicio.z - c.cz)) || 1;
    vallaCadena(orden, [lado], true);
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
      const pu = { x, z, y: alturaArista(e, t), ang, largo: ancho + 36, ancho: e.ancho, arista: e };
      puentes.push(pu);
      // pretiles a los lados
      const s = Math.sin(ang), co = Math.cos(ang), nx = co, nz = -s;
      for (const lado of [-1, 1]) { const cx = x + nx * lado * (e.ancho / 2 + 0.5), cz = z + nz * lado * (e.ancho / 2 + 0.5); tramo(cx - s * pu.largo / 2, cz - co * pu.largo / 2, cx + s * pu.largo / 2, cz + co * pu.largo / 2, 0.4, pu.y - 2, pu.y + 2, { pretil: true }); }
    }
  }
  const cerca = (x, z) => iObst[celda(x, z)] || [];
  const libre = (x, z, y) => !cerca(x, z).some(o => (o.y0 === undefined || (y > o.y0 && y < o.y1)) && (o.x0 !== undefined ? x > o.x0 && x < o.x1 && z > o.z0 && z < o.z1 : o.ax !== undefined && distTramo(o, x, z) < o.radio + 1));
  function distTramo(o, x, z) { const dx = o.bx - o.ax, dz = o.bz - o.az, L2 = dx * dx + dz * dz || 1, t = clamp(((x - o.ax) * dx + (z - o.az) * dz) / L2, 0, 1); return Math.hypot(x - o.ax - dx * t, z - o.az - dz * t); }
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
  for (const e of aristas) { if (rampas.length >= 6) break; const a = nodos[e.a], b = nodos[e.b]; if (a.ciudad !== 0 || e.tipo !== 'calle' || e.largo < 40 || rampas.some(r => Math.hypot(r.x - a.x, r.z - a.z) < 150)) continue; for (const lado of [1, -1]) { const of = carril(a, b, lado), ang = Math.atan2(b.x - a.x, b.z - a.z) + (lado < 0 ? Math.PI : 0); rampas.push({ x: (a.x + b.x) / 2 + of.ox, z: (a.z + b.z) / 2 + of.oz, ang, largo: 7, ancho: 4 }); } }   // una en cada carril: se salta en los dos sentidos
  const escondites = ciudades.flatMap(c => c.celdas.filter(m => m.parque).slice(0, 3).map(m => ({ x: (m.x0 + m.x1) / 2, z: (m.z0 + m.z1) / 2, radio: Math.min(12, (m.x1 - m.x0) / 2) })));
  // --- los trozos: qué hay en cada uno (para montar la pantalla por partes)
  const TR = M.trozo, NTX = Math.ceil(M.ancho / TR), NTZ = Math.ceil(M.largo / TR);
  const trozos = [];
  for (let i = 0; i < NTX; i++) for (let j = 0; j < NTZ; j++) {
    const x0 = i * TR, z0 = j * TR, x1 = x0 + TR, z1 = z0 + TR, dentro = (x, z, m = 0) => x >= x0 - m && x < x1 + m && z >= z0 - m && z < z1 + m;
    const t = { i, j, x0, z0, x1, z1, celdas: celdas.filter(m => m.x1 > x0 && m.x0 < x1 && m.z1 > z0 && m.z0 < z1), aristas: [], campo: campo.filter(o => dentro(o.x, o.z)), puentes: puentes.filter(p => dentro(p.x, p.z)), quitamiedos: quitamiedos.filter(q => dentro(q.ax, q.az)), rampas: rampas.filter(r => dentro(r.x, r.z)), escondites: escondites.filter(e => dentro(e.x, e.z)), miradores: miradores.filter(m => dentro(m.x, m.z)), rio: rio.filter(p => dentro(p.x, p.z, 80)) };
    for (const e of aristas) { const a = nodos[e.a], b = nodos[e.b]; if (Math.max(a.x, b.x) + e.alcance > x0 && Math.min(a.x, b.x) - e.alcance < x1 && Math.max(a.z, b.z) + e.alcance > z0 && Math.min(a.z, b.z) - e.alcance < z1) t.aristas.push(e); }
    trozos.push(t);
  }
  const trozoEn = (x, z) => trozos[clamp(Math.floor(x / TR), 0, NTX - 1) * NTZ + clamp(Math.floor(z / TR), 0, NTZ - 1)];
  return { ancho: M.ancho, largo: M.largo, ciudades, celdas, nodos, aristas, aristaDe, rio, enlaces, monte, miradores, puentes, paredes, quitamiedos, campo, rampas, escondites, trozos, trozoEn, NTX, NTZ,
    altura, alturaArista, alturaSuelo, natural, suelo, enTrinchera, manzanaEn, carreteraEn, distCarretera, enRio, cerca, libre, nodosEn, nodoCercano, camino, carril, puntoAcera, zona, BARRIOS: MANZANAS.BARRIOS, cauce: (x, z) => CARRETERAS.cauce(rio, x, z) };
})();
