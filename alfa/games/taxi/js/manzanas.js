// Fans Of Taxi · MANZANAS: genera una ciudad: sus líneas de calle (de anchuras distintas: circunvalación, avenidas, calles y callejones,
// a distancias irregulares), qué tramos existen (los que faltan unen celdas en manzanas de formas distintas), los cruces como nodos
// del grafo, y por cada celda su barrio, sus edificios o su parque. También los túneles bajo las dos avenidas, con su rampa desde la
// circunvalación. No sabe de alturas ni de three: CIUDAD le da las funciones para crear nodos y aristas. Se prueba con Node.
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

  // las líneas de un eje: desde la circunvalación hasta la otra, a saltos irregulares; dos avenidas; algún callejón
  function lineas(largo, azar) {
    const l = [{ pos: ANCHO.anillo / 2, tipo: 'anillo' }];
    let pos = ANCHO.anillo / 2 + 76;   // el primer tramo es largo: ahí baja la rampa del túnel
    const saltos = [36, 40, 46, 52, 58, 66, 78];
    while (pos < largo - ANCHO.anillo / 2 - 76) { l.push({ pos, tipo: azar() < 0.2 ? 'callejon' : 'calle' }); pos += saltos[(azar() * saltos.length) | 0]; }
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
    // los túneles van bajo las avenidas: en la superficie se cierra su primer y último tramo (ahí está la rampa)
    const avX = lx.findIndex(q => q.tipo === 'avenida'), avZ = lz.findIndex(q => q.tipo === 'avenida');
    if (avZ >= 0) { filas[avZ][0] = false; filas[avZ][NX - 2] = false; }
    if (avX >= 0) { cols[avX][0] = false; cols[avX][NZ - 2] = false; }
    // nodos: los cruces con algún tramo; que todos se alcancen desde la circunvalación (si no, se abren tramos)
    const grado = (i, j) => (i > 0 && filas[j][i - 1]) + (i < NX - 1 && filas[j][i]) + (j > 0 && cols[i][j - 1]) + (j < NZ - 1 && cols[i][j]);
    for (let pasada = 0; pasada < 6; pasada++) {
      const visto = new Set(), cola = ['0,0']; visto.add('0,0');
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
    // las celdas: entre líneas; qué lados dan a calle; su barrio y sus edificios
    const celdas = [], A = M.acera;
    for (let i = 0; i < NX - 1; i++) for (let j = 0; j < NZ - 1; j++) {
      const x0 = c.x0 + lx[i].pos + lx[i].ancho / 2, x1 = c.x0 + lx[i + 1].pos - lx[i + 1].ancho / 2, z0 = c.z0 + lz[j].pos + lz[j].ancho / 2, z1 = c.z0 + lz[j + 1].pos - lz[j + 1].ancho / 2;
      const lados = { izq: cols[i][j], der: cols[i + 1][j], arriba: filas[j][i], abajo: filas[j + 1][i] };   // ¿da a calle?
      const fx = ((x0 + x1) / 2 - c.x0) / (c.x1 - c.x0), fz = ((z0 + z1) / 2 - c.z0) / (c.z1 - c.z0);
      const b = barrioDe(c, fx, fz), B = BARRIOS[b];
      const torre = c.id === 'bahia' && Math.abs(fx - 0.5) < 0.07 && Math.abs(fz - 0.5) < 0.07 && !celdas.some(q => q.torre);
      const m = { ciudad: c.indice, i, j, x0, z0, x1, z1, lados, barrio: b, parque: !torre && azar() < B.parque, edificios: [], arboles: [], torre };
      m.muro = { x0: x0 + (lados.izq ? A : 0), z0: z0 + (lados.arriba ? A : 0), x1: x1 - (lados.der ? A : 0), z1: z1 - (lados.abajo ? A : 0) };   // dentro de la acera
      const w = m.muro.x1 - m.muro.x0, d = m.muro.z1 - m.muro.z0, cx = (m.muro.x0 + m.muro.x1) / 2, cz = (m.muro.z0 + m.muro.z1) / 2;
      if (w < 6 || d < 6) { celdas.push(m); continue; }
      if (m.torre) { m.edificios.push({ x: cx, z: cz, w: 26, d: 26, h: 90, color: 0x1d3f8a }, { x: cx, z: cz, w: Math.min(w, 40), d: Math.min(d, 40), h: 8, color: 0x2e8bff }); }
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
    // los túneles: bajo cada avenida, de circunvalación a circunvalación, con rampa en los extremos; se cruzan en el centro
    const tuneles = [];
    const bajo = (x, z) => -10;
    function tunel(horizontal, idx) {
      const L = horizontal ? lx : lz, Lotra = horizontal ? lz : lx, pos = (horizontal ? lz : lx)[idx].pos;
      const largo = L[L.length - 1].pos - L[0].pos, puntos = [0, 24, 48, 72];
      for (let s = 72 + 60; s < largo - 72 - 30; s += 60) puntos.push(s);
      puntos.push(largo - 72, largo - 48, largo - 24, largo);
      const otra = Lotra.findIndex(q => q.tipo === 'avenida');   // el cruce con el otro túnel
      const cruce = otra >= 0 ? (horizontal ? lx : lz)[otra].pos - L[0].pos : -1;
      if (cruce > 0) { const k = puntos.findIndex(p => p > cruce); puntos.splice(k, 0, cruce); for (let q = puntos.length - 1; q > 0; q--) if (puntos[q] - puntos[q - 1] < 14 && puntos[q] !== cruce) puntos.splice(q, 1); else if (puntos[q] - puntos[q - 1] < 14) puntos.splice(q - 1, 1); }
      let prev = null; const cadena = [];
      for (const s of puntos) {
        const rampa = s < 73 || s > largo - 73, prof = rampa ? bajo() * Math.min(1, (s < 73 ? s : largo - s) / 72) : bajo();
        const x = horizontal ? c.x0 + L[0].pos + s : c.x0 + pos, z = horizontal ? c.z0 + pos : c.z0 + L[0].pos + s;
        let n;
        if (s === 0) n = nodos[horizontal ? 0 : idx][horizontal ? idx : 0]; else if (s === largo) n = nodos[horizontal ? NX - 1 : idx][horizontal ? idx : NZ - 1];
        else if (s === cruce) { n = g.compartido('cruce-' + c.indice) || g.compartido('cruce-' + c.indice, g.nodo(x, z, { ciudad: c.indice, tipo: 'tunel', bajo: prof })); }
        else n = g.nodo(x, z, { ciudad: c.indice, tipo: rampa ? 'rampa' : 'tunel', bajo: prof });
        if (prev) g.une(prev, n, 12, (prev.tipo === 'rampa' || n.tipo === 'rampa') && (prev.tipo !== 'tunel' && n.tipo !== 'tunel') ? 'rampa' : 'tunel');
        cadena.push(n); prev = n;
      }
      tuneles.push(cadena);
    }
    if (avZ >= 0 && nodos[0][avZ] && nodos[NX - 1][avZ]) tunel(true, avZ);
    if (avX >= 0 && nodos[avX][0] && nodos[avX][NZ - 1]) tunel(false, avX);
    return { lx, lz, nodos, celdas, tuneles, NX, NZ };
  }
  return { generar, BARRIOS, ANCHO };
})();
