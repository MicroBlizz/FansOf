// Fans Of Taxi · MANZANAS: genera una ciudad: sus líneas de calle (de anchuras distintas: circunvalación, avenidas, calles y callejones,
// a distancias irregulares), qué tramos existen (los que faltan unen celdas en manzanas de formas distintas), los cruces como nodos
// del grafo, y por cada celda su barrio, sus edificios o su parque. La circunvalación tiene las esquinas curvas (la celda de la esquina
// es un parque). También los túneles bajo las dos avenidas: cada boca es una trinchera en su propia celda, junto a la circunvalación,
// al lado de la avenida (nunca en medio de una calle). No sabe de alturas ni de three: CIUDAD le da nodo() y une(). Se prueba con Node.
'use strict';
const MANZANAS = (() => {
  const M = TAXI.mundo;
  const ANCHO = { anillo: 16, avenida: 22, calle: 12, callejon: 7 };
  // los barrios: colores, alturas, parques y cómo se reparten los edificios en una celda
  const BARRIOS = {
    madriguera: { nombre: 'La Madriguera', colores: [0x7ee04a, 0xffb347, 0xff9fd0, 0xffe58a, 0x9be7ff], altura: [4, 9], parque: 0.4, suelo: '#5e5a6c', celda: 22 },
    centro: { nombre: 'Centro', colores: [0x5a7fd6, 0x8a6fe0, 0x4fc3d9, 0x6a5a86, 0x3e6fb0, 0xc46ba8], altura: [12, 40], parque: 0.08, suelo: '#5b5668', celda: 20 },
    industrial: { nombre: 'Zona industrial', colores: [0xff7a1a, 0x9a8f9e, 0xb0532a, 0x7c7788, 0xd9a441], altura: [7, 13], parque: 0.04, suelo: '#4f4a5a', celda: 60 },
    puerto: { nombre: 'Puerto de Phony', colores: [0xff4b5c, 0x2e8bff, 0xffcb3d, 0x7ee04a, 0xff7a1a, 0xfff6ea], altura: [2.6, 8], parque: 0, suelo: '#44405a', celda: 9, contenedores: true },
    tecnologica: { nombre: 'Ciudad IAhorro', colores: [0x4fc3d9, 0xfff6ea, 0x9be7ff, 0xcdb9ea, 0x2e8bff], altura: [18, 60], parque: 0.12, suelo: '#6a6680', celda: 26 },
    aeropuerto: { nombre: 'Aeropuerto de drones', colores: [0xcdb9ea, 0xfff6ea], altura: [9, 12], parque: 0, suelo: '#3a3648', celda: 0 },
  };
  const barrioDe = (c, fx, fz) => c.id === 'bahia' ? (fx < 0.3 ? 'madriguera' : 'centro') : c.id === 'puerto' ? (fx > 0.68 ? 'puerto' : 'industrial') : (fz < 0.3 ? 'aeropuerto' : 'tecnologica');

  const BORDE = 100;   // el primer y el último tramo miden esto: ahí caben la trinchera del túnel y la curva de la esquina
  // las líneas de un eje: desde la circunvalación hasta la otra, a saltos irregulares; dos avenidas; algún callejón
  function lineas(largo, azar) {
    const l = [{ pos: ANCHO.anillo / 2, tipo: 'anillo' }];
    let pos = ANCHO.anillo / 2 + BORDE;
    const saltos = [36, 40, 46, 52, 58, 66, 78];
    const fin = largo - ANCHO.anillo / 2 - BORDE;
    while (pos < fin - 30) { l.push({ pos, tipo: azar() < 0.2 ? 'callejon' : 'calle' }); pos += saltos[(azar() * saltos.length) | 0]; }
    l.push({ pos: fin, tipo: 'calle' });
    l.push({ pos: largo - ANCHO.anillo / 2, tipo: 'anillo' });
    for (const f of [0.36, 0.68]) {   // la línea más cercana a cada tercio es avenida
      let mejor = null; for (const q of l) if (q.tipo !== 'anillo' && (!mejor || Math.abs(q.pos - largo * f) < Math.abs(mejor.pos - largo * f))) mejor = q;
      if (mejor) mejor.tipo = 'avenida';
    }
    for (const q of l) q.ancho = ANCHO[q.tipo];
    return l;
  }

  // genera una ciudad en su rectángulo: `g` da nodo(x, z, extra) y une(a, b, ancho, tipo)
  function generar(c, azar, g) {
    const lx = lineas(c.x1 - c.x0, azar), lz = lineas(c.z1 - c.z0, azar);
    const NX = lx.length, NZ = lz.length;
    // tramos abiertos: por filas (entre columnas i e i+1 en la fila j) y por columnas
    const abierto = t => t === 'anillo' || t === 'avenida' || azar() < (t === 'calle' ? 0.84 : 0.45);
    const filas = [], cols = [];   // filas[j][i]: tramo de la línea z=j entre x=i y x=i+1; cols[i][j]: tramo de la línea x=i entre z=j y z=j+1
    for (let j = 0; j < NZ; j++) { filas[j] = []; for (let i = 0; i < NX - 1; i++) filas[j][i] = abierto(lz[j].tipo); }
    for (let i = 0; i < NX; i++) { cols[i] = []; for (let j = 0; j < NZ - 1; j++) cols[i][j] = abierto(lx[i].tipo); }
    const avX = lx.findIndex(q => q.tipo === 'avenida'), avZ = lz.findIndex(q => q.tipo === 'avenida');
    // las esquinas de la circunvalación son curvas: el cruce de la esquina no existe (luego se traza el arco)
    filas[0][0] = filas[0][NX - 2] = filas[NZ - 1][0] = filas[NZ - 1][NX - 2] = false;
    cols[0][0] = cols[0][NZ - 2] = cols[NX - 1][0] = cols[NX - 1][NZ - 2] = false;
    // nodos: los cruces con algún tramo; que todos se alcancen desde la circunvalación (si no, se abren tramos)
    const grado = (i, j) => (i > 0 && filas[j][i - 1]) + (i < NX - 1 && filas[j][i]) + (j > 0 && cols[i][j - 1]) + (j < NZ - 1 && cols[i][j]);
    for (let pasada = 0; pasada < 6; pasada++) {
      const visto = new Set(), cola = ['1,0']; visto.add('1,0');
      while (cola.length) {
        const [i, j] = cola.shift().split(',').map(Number);
        const vec = []; if (i > 0 && filas[j][i - 1]) vec.push([i - 1, j]); if (i < NX - 1 && filas[j][i]) vec.push([i + 1, j]); if (j > 0 && cols[i][j - 1]) vec.push([i, j - 1]); if (j < NZ - 1 && cols[i][j]) vec.push([i, j + 1]);
        for (const [a, b] of vec) { const k = a + ',' + b; if (!visto.has(k)) { visto.add(k); cola.push(k); } }
      }
      let arreglado = 0;
      for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) if (grado(i, j) > 0 && !visto.has(i + ',' + j)) {
        if (i > 0 && visto.has((i - 1) + ',' + j)) filas[j][i - 1] = true; else if (i < NX - 1 && visto.has((i + 1) + ',' + j)) filas[j][i] = true;
        else if (j > 0 && visto.has(i + ',' + (j - 1))) cols[i][j - 1] = true; else if (j < NZ - 1 && visto.has(i + ',' + (j + 1))) cols[i][j] = true;
        arreglado++;
      }
      if (!arreglado) break;
    }
    const nodos = [];
    for (let i = 0; i < NX; i++) { nodos[i] = []; for (let j = 0; j < NZ; j++) nodos[i][j] = grado(i, j) > 0 ? g.nodo(c.x0 + lx[i].pos, c.z0 + lz[j].pos, { ciudad: c.indice, i, j, tipo: lx[i].tipo === 'anillo' || lz[j].tipo === 'anillo' ? 'anillo' : 'calle' }) : null; }
    for (let j = 0; j < NZ; j++) for (let i = 0; i < NX - 1; i++) if (filas[j][i]) g.une(nodos[i][j], nodos[i + 1][j], lz[j].ancho, lz[j].tipo);
    for (let i = 0; i < NX; i++) for (let j = 0; j < NZ - 1; j++) if (cols[i][j]) g.une(nodos[i][j], nodos[i][j + 1], lx[i].ancho, lx[i].tipo);
    // las esquinas: un cuarto de círculo de radio BORDE entre los dos cruces vecinos de la esquina; la del medio es «la esquina» para los enlaces
    const esquinas = [];
    for (const [ci, cj] of [[0, 0], [NX - 1, 0], [0, NZ - 1], [NX - 1, NZ - 1]]) {
      const sx = ci === 0 ? -1 : 1, sz = cj === 0 ? -1 : 1, ii = ci === 0 ? 1 : NX - 2, jj = cj === 0 ? 1 : NZ - 2;
      const A = nodos[ii][cj], B = nodos[ci][jj]; if (!A || !B) continue;
      const cx = c.x0 + lx[ii].pos, cz = c.z0 + lz[jj].pos, R = BORDE;
      let prev = A; const arco = [];
      for (let k = 1; k < 5; k++) { const th = Math.PI / 2 * k / 5; const n = g.nodo(cx + sx * R * Math.sin(th), cz + sz * R * Math.cos(th), { ciudad: c.indice, tipo: 'anillo', esquina: true }); g.une(prev, n, ANCHO.anillo, 'anillo'); arco.push(n); prev = n; }
      g.une(prev, B, ANCHO.anillo, 'anillo');
      esquinas.push(arco[1]);
    }
    // las celdas: entre líneas; qué lados dan a calle; su barrio y sus edificios
    const celdas = [], A = M.acera;
    for (let i = 0; i < NX - 1; i++) for (let j = 0; j < NZ - 1; j++) {
      const x0 = c.x0 + lx[i].pos + lx[i].ancho / 2, x1 = c.x0 + lx[i + 1].pos - lx[i + 1].ancho / 2, z0 = c.z0 + lz[j].pos + lz[j].ancho / 2, z1 = c.z0 + lz[j + 1].pos - lz[j + 1].ancho / 2;
      const lados = { izq: cols[i][j], der: cols[i + 1][j], arriba: filas[j][i], abajo: filas[j + 1][i] };   // ¿da a calle?
      const fx = ((x0 + x1) / 2 - c.x0) / (c.x1 - c.x0), fz = ((z0 + z1) / 2 - c.z0) / (c.z1 - c.z0);
      const b = barrioDe(c, fx, fz), B = BARRIOS[b];
      const torre = c.id === 'bahia' && Math.abs(fx - 0.5) < 0.07 && Math.abs(fz - 0.5) < 0.07 && !celdas.some(q => q.torre);
      const esquina = (i === 0 || i === NX - 2) && (j === 0 || j === NZ - 2);   // la celda de una esquina curva: parque dentro del arco
      const boca = (avZ >= 0 && j === avZ && (i === 0 || i === NX - 2)) || (avX >= 0 && i === avX && (j === 0 || j === NZ - 2));   // ahí va la trinchera del túnel
      const m = { ciudad: c.indice, i, j, x0, z0, x1, z1, lados, barrio: b, parque: esquina || (!torre && !boca && azar() < B.parque), edificios: [], arboles: [], torre, esquina, boca };
      m.muro = { x0: x0 + (lados.izq ? A : 0), z0: z0 + (lados.arriba ? A : 0), x1: x1 - (lados.der ? A : 0), z1: z1 - (lados.abajo ? A : 0) };   // dentro de la acera
      const w = m.muro.x1 - m.muro.x0, d = m.muro.z1 - m.muro.z0, cx = (m.muro.x0 + m.muro.x1) / 2, cz = (m.muro.z0 + m.muro.z1) / 2;
      if (w < 6 || d < 6 || boca) { celdas.push(m); continue; }
      if (esquina) { const ex = c.x0 + lx[i === 0 ? 1 : NX - 2].pos, ez = c.z0 + lz[j === 0 ? 1 : NZ - 2].pos; for (let k = 0; k < 14; k++) { const x = lerp(m.muro.x0 + 2, m.muro.x1 - 2, azar()), z = lerp(m.muro.z0 + 2, m.muro.z1 - 2, azar()); if (Math.hypot(x - ex, z - ez) < BORDE - 12) m.arboles.push({ x, z, radio: lerp(1.6, 2.6, azar()), alto: lerp(4, 7, azar()) }); } }
      else if (m.torre) { m.edificios.push({ x: cx, z: cz, w: 26, d: 26, h: 90, color: 0x1d3f8a }, { x: cx, z: cz, w: Math.min(w, 40), d: Math.min(d, 40), h: 8, color: 0x2e8bff }); }
      else if (m.parque) { const n = Math.max(3, (w * d / 260) | 0); for (let k = 0; k < n; k++) m.arboles.push({ x: lerp(m.muro.x0 + 2, m.muro.x1 - 2, azar()), z: lerp(m.muro.z0 + 2, m.muro.z1 - 2, azar()), radio: lerp(1.6, 2.6, azar()), alto: lerp(4, 7, azar()) }); }
      else if (B.celda === 0) { if (azar() < 0.4) m.edificios.push({ x: cx, z: cz, w: w * 0.45, d: d * 0.6, h: lerp(B.altura[0], B.altura[1], azar()), color: pick(B.colores) }); }   // el aeropuerto: pista abierta y algún hangar
      else {
        // una rejilla de edificios según el tamaño de la celda; en el centro, a veces, un patio
        const na = Math.max(1, Math.round(w / B.celda)), nc = Math.max(1, Math.round(d / B.celda)), la = w / na, lc = d / nc;
        for (let a = 0; a < na; a++) for (let q = 0; q < nc; q++) {
          if (na > 2 && nc > 2 && a > 0 && a < na - 1 && q > 0 && q < nc - 1 && azar() < 0.7) continue;
          if (B.contenedores && azar() < 0.3) continue;
          const ew = la * lerp(0.7, 0.95, azar()), ed = lc * lerp(0.7, 0.95, azar());
          m.edificios.push({ x: m.muro.x0 + la * (a + 0.5), z: m.muro.z0 + lc * (q + 0.5), w: ew, d: ed, h: lerp(B.altura[0], B.altura[1], azar()), color: pick(B.colores) });
        }
      }
      celdas.push(m);
    }
    // los túneles: bajo cada avenida, desde la primera calle hasta la última (la superficie queda entera); se cruzan en el centro.
    // Cada boca es una trinchera en la celda de al lado, junto a la circunvalación: del cruce con la circunvalación sale un ramal corto
    // a la trinchera, que baja a lo largo de la celda (paralela a la avenida) y al fondo entra bajo tierra y vuelve al eje de la avenida
    const tuneles = [], bajo = () => -10;   // profundidad del túnel bajo la calle
    const lado = ANCHO.avenida / 2 + M.acera + 8;   // la trinchera va a este lado del eje de la avenida
    function tunel(horizontal, idx) {
      const L = horizontal ? lx : lz, pos = (horizontal ? lz : lx)[idx].pos;
      // el fondo de cada trinchera queda dentro de su celda (antes de la primera calle); el eje del túnel empieza a 45° de ahí
      const sB0 = L[1].pos - L[1].ancho / 2 - 4, sB1 = L[L.length - 2].pos + L[L.length - 2].ancho / 2 + 4;
      const s0 = sB0 + lado, s1 = sB1 - lado, puntos = [s0];
      for (let s = s0 + 60; s < s1 - 30; s += 60) puntos.push(s);
      puntos.push(s1);
      const otra = L.findIndex(q => q.tipo === 'avenida');   // el cruce con el otro túnel: bajo la avenida de este eje
      const cruce = otra >= 0 ? L[otra].pos : -1;
      if (cruce > s0 && cruce < s1) { const k = puntos.findIndex(p => p > cruce); puntos.splice(k, 0, cruce); for (let q = puntos.length - 1; q > 0; q--) if (puntos[q] - puntos[q - 1] < 14 && puntos[q] !== cruce) puntos.splice(q, 1); else if (puntos[q] - puntos[q - 1] < 14) puntos.splice(q - 1, 1); }
      const punto = (s, t) => horizontal ? [c.x0 + s, c.z0 + pos + t] : [c.x0 + pos + t, c.z0 + s];
      let prev = null; const cadena = [];
      for (const s of puntos) {
        const [x, z] = punto(s, 0); let n;
        if (s === cruce) n = g.compartido('cruce-' + c.indice) || g.compartido('cruce-' + c.indice, g.nodo(x, z, { ciudad: c.indice, tipo: 'tunel', bajo: bajo() }));
        else n = g.nodo(x, z, { ciudad: c.indice, tipo: 'tunel', bajo: bajo() });
        if (prev) g.une(prev, n, 12, 'tunel');
        cadena.push(n); prev = n;
      }
      // las bocas: una trinchera por extremo, a un lado de la avenida, que sube hasta la circunvalación
      for (const [u, dir] of [[cadena[0], -1], [cadena[cadena.length - 1], 1]]) {
        const P = horizontal ? nodos[dir < 0 ? 0 : NX - 1][idx] : nodos[idx][dir < 0 ? 0 : NZ - 1];   // el cruce de la avenida con la circunvalación
        const sP = L[dir < 0 ? 0 : L.length - 1].pos, sU = dir < 0 ? s0 : s1, linea = L[dir < 0 ? 1 : L.length - 2];   // sB queda a 45° de u (lado 22 = 22 a lo largo)
        const sT = sP - dir * (ANCHO.anillo / 2 + 16), sB = sU + dir * lado;   // de la boca (arriba) al fondo (abajo), hacia dentro de la ciudad
        const [tx, tz] = punto(sT, lado), T = g.nodo(tx, tz, { ciudad: c.indice, tipo: 'rampa', bajo: 0 });
        g.une(P, T, ANCHO.calle, 'calle');   // el ramal del cruce a la boca
        let q = T; const n = 3, tramo = [T];
        for (let k = 1; k <= n; k++) { const [x, z] = punto(lerp(sT, sB, k / n), lado); const m = g.nodo(x, z, { ciudad: c.indice, tipo: 'rampa', bajo: bajo() * k / n, boca: k === n }); g.une(q, m, 12, 'rampa'); q = m; tramo.push(m); }
        g.une(q, u, 12, 'tunel');
        if (dir < 0) cadena.unshift(...tramo); else cadena.push(...tramo.reverse());
      }
      tuneles.push(cadena);
    }
    if (avZ >= 0 && nodos[0][avZ] && nodos[NX - 1][avZ]) tunel(true, avZ);
    if (avX >= 0 && nodos[avX][0] && nodos[avX][NZ - 1]) tunel(false, avX);
    return { lx, lz, nodos, celdas, tuneles, esquinas, NX, NZ };
  }
  return { generar, BARRIOS, ANCHO };
})();
