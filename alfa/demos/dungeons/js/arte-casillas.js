// Fans of Dungeons · Las casillas del mapa (32 × 32), dibujadas por código con el aire de las mazmorras de Crypt of the
// NecroDancer: suelo de losas de piedra oscura en damero (con bisel, grietas, piedrecitas y manchas), muros de bloques con
// cara frontal de sillares irregulares y grietas, puertas con arco, escaleras que se hunden en lo negro, alfombras raídas,
// muebles y antorchas. Tres zonas, todas oscuras: Oficinas (piedra gris azulada), Cementerio (tierra y hueso), Foro (acero).
'use strict';

const CAS = {};   // nombre → lienzo 32 × 32
const ZONAS_ARTE = {
  oficinas: { losa: ['#2c2a3c', '#27253a'], junta: '#15131d', luz: '#3c3a52', sombra: '#1e1c2a', muro: '#3a3850', muroLuz: '#4e4c6a', muroSombra: '#262436', muroTop: '#3a384e', grieta: '#141220', puerta: '#5a3a1e', puertaLuz: '#7a5230', alfombra: '#4a1a24', alfombra2: '#5a2230', detalle: '#6a5a3a' },
  cementerio: { losa: ['#2a2a22', '#25251e'], junta: '#121210', luz: '#3a3a30', sombra: '#1c1c16', muro: '#3a3630', muroLuz: '#4e4a42', muroSombra: '#24221c', muroTop: '#3c3830', grieta: '#141210', puerta: '#4a3220', puertaLuz: '#684a30', alfombra: '#2a1a3a', alfombra2: '#34204a', detalle: '#3a5a30' },
  foro: { losa: ['#1e2232', '#1a1e2c'], junta: '#0c0e16', luz: '#2c3248', sombra: '#141826', muro: '#2a3046', muroLuz: '#3c4460', muroSombra: '#1a1e2e', muroTop: '#2c344a', grieta: '#0a0c14', puerta: '#3a4260', puertaLuz: '#525c82', alfombra: '#14283a', alfombra2: '#1a344a', detalle: '#f7d34a' },
};

function lienzoCas(nombre, pinta) {
  const c = document.createElement('canvas'); c.width = TS; c.height = TS;
  pinta(c.getContext('2d'));
  CAS[nombre] = c;
  return c;
}
// ruido repetible por casilla (para que cada variante sea siempre la misma)
function ruidoCas(sem) { let a = sem * 7919 + 13; return () => { a = (a * 1103515245 + 12345) & 0x7fffffff; return a / 0x7fffffff; }; }
const px = (g, x, y, c) => { g.fillStyle = c; g.fillRect(x, y, 1, 1); };
// un bloque de piedra con junta, bisel de luz arriba y a la izquierda y sombra abajo y a la derecha
function piedra(g, x, y, w, h, base, luz, sombra, junta) {
  g.fillStyle = junta; g.fillRect(x, y, w, h);
  g.fillStyle = base; g.fillRect(x + 1, y + 1, w - 2, h - 2);
  g.fillStyle = luz; g.fillRect(x + 1, y + 1, w - 2, 1); g.fillRect(x + 1, y + 1, 1, h - 2);
  g.fillStyle = sombra; g.fillRect(x + 1, y + h - 2, w - 2, 1); g.fillRect(x + w - 2, y + 1, 1, h - 2);
}
// una grieta: línea quebrada de píxeles oscuros
function grieta(g, r, x, y, n, color) { for (let i = 0; i < n; i++) { px(g, x, y, color); x += r() < 0.5 ? 1 : 0; y += r() < 0.7 ? 1 : 0; if (r() < 0.2) x -= 1; } }
// la cara frontal de un muro: sillares de tamaño irregular en filas desplazadas
function sillares(g, r, Z, y0, h) {
  for (let y = y0; y < y0 + h;) {
    const fh = Math.min(y0 + h - y, 6 + Math.floor(r() * 3));
    let x = -Math.floor(r() * 10);
    while (x < TS) { const w = 7 + Math.floor(r() * 9); piedra(g, x, y, w, fh, Z.muro, Z.muroLuz, Z.muroSombra, Z.grieta); x += w - 1; }
    y += Math.max(2, fh - 1);
  }
  for (let i = 0; i < 2; i++) grieta(g, r, Math.floor(r() * 26) + 2, y0 + Math.floor(r() * 4), 5 + Math.floor(r() * 8), Z.grieta);
}

function creaCasillas() {
  for (const z in ZONAS_ARTE) {
    const Z = ZONAS_ARTE[z];
    // suelos: losa de piedra con bisel; 0 y 1 son los dos tonos del damero, 2 con grieta, 3 con «cosa» (huesos, manchas, charcos)
    // los dos tonos del damero son suelo0 y suelo1; detalle2 (grieta) y detalle3 (cosas) se pintan encima, transparentes
    for (let v = 0; v < 4; v++) lienzoCas(z + (v < 2 ? '_suelo' : '_detalle') + v, g => {
      const r = ruidoCas(v + 1 + (z === 'foro' ? 40 : z === 'cementerio' ? 20 : 0));
      if (v < 2) {
        piedra(g, 0, 0, TS, TS, Z.losa[v], Z.luz, Z.sombra, Z.junta);
        for (let i = 0; i < 22; i++) { const x = 2 + Math.floor(r() * 28), y = 2 + Math.floor(r() * 28); px(g, x, y, r() < 0.5 ? Z.sombra : Z.luz); }   // el grano de la piedra
        if (z === 'cementerio') for (let i = 0; i < 6; i++) px(g, 2 + Math.floor(r() * 28), 2 + Math.floor(r() * 28), '#1a1a14');
        return;
      }
      if (v === 2) { grieta(g, r, 4 + Math.floor(r() * 10), 2, 10 + Math.floor(r() * 12), Z.grieta); for (let i = 0; i < 4; i++) px(g, 3 + Math.floor(r() * 26), 3 + Math.floor(r() * 26), Z.sombra); }
      if (v === 3) {
        if (z === 'oficinas') { g.fillStyle = '#1e1410'; g.fillRect(11, 15, 9, 6); g.fillRect(9, 17, 13, 2); px(g, 14, 14, '#1e1410'); px(g, 22, 18, '#1e1410'); g.fillStyle = '#4a4458'; g.fillRect(20, 6, 7, 5); g.fillStyle = '#2c2a3c'; g.fillRect(21, 7, 5, 1); g.fillRect(21, 9, 4, 1); }   // una mancha y un papel
        else if (z === 'cementerio') { g.fillStyle = '#b8b0a0'; g.fillRect(8, 18, 12, 2); g.fillRect(7, 17, 2, 4); g.fillRect(19, 17, 2, 4); g.fillRect(21, 7, 6, 5); g.fillRect(22, 12, 4, 2); px(g, 22, 9, '#1a1a14'); px(g, 25, 9, '#1a1a14'); g.fillStyle = '#4a1020'; g.fillRect(4, 6, 5, 3); g.fillRect(6, 9, 2, 2); }   // un hueso, una calavera y sangre
        else { g.fillStyle = '#0e2630'; g.fillRect(8, 16, 14, 7); g.fillRect(11, 14, 8, 11); px(g, 12, 17, '#1f5a6a'); g.fillStyle = '#f7d34a'; g.fillRect(3, 24, 12, 1); g.fillRect(14, 20, 1, 5); g.fillRect(14, 20, 9, 1); px(g, 23, 19, '#ff4b5c'); }   // un charco y un cable
      }
    });
    // muro con cara frontal (cuando debajo hay suelo) y muro visto solo por arriba
    lienzoCas(z + '_muro', g => {
      const r = ruidoCas(z === 'foro' ? 77 : z === 'cementerio' ? 55 : 33);
      g.fillStyle = Z.muroTop; g.fillRect(0, 0, TS, 9);
      for (let i = 0; i < 10; i++) px(g, Math.floor(r() * TS), Math.floor(r() * 8), r() < 0.5 ? Z.muroLuz : Z.muroSombra);
      g.fillStyle = Z.muroLuz; g.fillRect(0, 0, TS, 1);
      g.fillStyle = Z.grieta; g.fillRect(0, 8, TS, 1);
      sillares(g, r, Z, 9, 23);
      g.fillStyle = Z.grieta; g.fillRect(0, 31, TS, 1);
      if (z === 'cementerio') { g.fillStyle = Z.detalle; g.fillRect(3, 11, 4, 2); g.fillRect(24, 20, 5, 2); g.fillRect(26, 22, 2, 2); }   // musgo
      if (z === 'foro') { for (let i = 0; i < 3; i++) px(g, 27, 13 + i * 6, i === 1 ? '#ff4b5c' : '#3fcf6a'); }   // luces
      if (z === 'oficinas') { g.fillStyle = Z.detalle; g.fillRect(5, 24, 6, 1); px(g, 5, 23, Z.detalle); }   // un cable viejo
    });
    lienzoCas(z + '_muro_top', g => {
      const r = ruidoCas(z === 'foro' ? 78 : z === 'cementerio' ? 56 : 34);
      g.fillStyle = Z.muroTop; g.fillRect(0, 0, TS, TS);
      for (let i = 0; i < 40; i++) px(g, Math.floor(r() * TS), Math.floor(r() * TS), r() < 0.5 ? Z.muroLuz : Z.muroSombra);
      g.fillStyle = Z.grieta; g.fillRect(0, 15, TS, 1); g.fillRect(15, 0, 1, 16); g.fillRect(7, 16, 1, 16); g.fillRect(23, 16, 1, 16);
      grieta(g, r, 20, 2, 9, Z.grieta);
    });
    // puertas (cerrada y abierta): un arco de piedra con la puerta de madera dentro
    lienzoCas(z + '_puerta', g => {
      g.drawImage(CAS[z + '_suelo0'], 0, 0);
      g.fillStyle = Z.muroSombra; g.fillRect(0, 0, 4, TS); g.fillRect(28, 0, 4, TS); g.fillRect(0, 0, TS, 3);
      g.fillStyle = Z.muroLuz; g.fillRect(1, 1, 1, 30); g.fillRect(29, 1, 1, 30);
      g.fillStyle = Z.puerta; g.fillRect(4, 3, 24, 28);
      g.fillStyle = Z.puertaLuz; for (let x = 6; x < 27; x += 5) g.fillRect(x, 4, 1, 26);
      g.fillStyle = Z.grieta; g.fillRect(4, 9, 24, 1); g.fillRect(4, 24, 24, 1);
      g.fillStyle = '#c8a040'; g.fillRect(23, 16, 3, 3); px(g, 24, 17, '#2a1a06');
    });
    lienzoCas(z + '_puerta_abierta', g => {
      g.drawImage(CAS[z + '_suelo0'], 0, 0);
      g.fillStyle = Z.muroSombra; g.fillRect(0, 0, 4, TS); g.fillRect(28, 0, 4, TS);
      g.fillStyle = Z.muroLuz; g.fillRect(1, 1, 1, 30); g.fillRect(29, 1, 1, 30);
      g.fillStyle = Z.puerta; g.fillRect(4, 0, 3, TS); g.fillRect(25, 0, 3, TS);
      g.fillStyle = Z.grieta; g.fillRect(6, 0, 1, TS); g.fillRect(25, 0, 1, TS);
    });
    // escaleras: la de subida (la salida, con un resplandor arriba) y la de llegada (un hueco negro que baja)
    lienzoCas(z + '_subida', g => {
      g.drawImage(CAS[z + '_suelo0'], 0, 0);
      g.fillStyle = Z.junta; g.fillRect(2, 2, 28, 28);
      for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? Z.muroLuz : Z.muro; g.fillRect(3 + i * 2, 27 - i * 5, 26 - i * 4, 5); g.fillStyle = Z.grieta; g.fillRect(3 + i * 2, 27 - i * 5, 26 - i * 4, 1); }
      g.fillStyle = '#ffd040'; g.fillRect(13, 2, 6, 2); g.fillRect(14, 1, 4, 1); g.fillStyle = '#fff4a8'; g.fillRect(15, 2, 2, 1);
    });
    lienzoCas(z + '_llegada', g => {
      g.drawImage(CAS[z + '_suelo0'], 0, 0);
      g.fillStyle = '#07050c'; g.fillRect(4, 5, 24, 24);
      for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? Z.muroSombra : Z.grieta; g.fillRect(6 + i * 2, 7 + i * 5, 20 - i * 4, 4); }
      g.fillStyle = Z.muroLuz; g.fillRect(3, 4, 26, 1); g.fillRect(3, 4, 1, 25); g.fillStyle = Z.muroSombra; g.fillRect(28, 4, 1, 25); g.fillRect(3, 29, 26, 1);
    });
    // alfombras raídas de las salas especiales (tesoro: roja oscura; tienda y descanso: la otra)
    for (const [n, c1, c2] of [['alfombra', Z.alfombra, Z.alfombra2], ['alfombra2', Z.alfombra2, Z.alfombra]]) lienzoCas(z + '_' + n, g => {
      const r = ruidoCas(n.length + (z === 'foro' ? 90 : z === 'cementerio' ? 60 : 30));
      g.fillStyle = c1; g.fillRect(0, 0, TS, TS);
      g.fillStyle = c2; for (let y = 0; y < TS; y += 4) for (let x = (y / 4 & 1) * 2; x < TS; x += 4) g.fillRect(x, y, 1, 1);
      for (let i = 0; i < 5; i++) px(g, Math.floor(r() * TS), Math.floor(r() * TS), Z.junta);   // raída
      g.fillStyle = '#8a6a1a'; g.fillRect(0, 0, TS, 1); g.fillRect(0, 31, TS, 1); g.fillRect(0, 0, 1, TS); g.fillRect(31, 0, 1, TS);
    });
    // muebles que cortan el paso (y sirven de parapeto)
    lienzoCas(z + '_mueble0', g => {
      g.drawImage(CAS[z + '_suelo1'], 0, 0);
      if (z === 'oficinas') {   // una mesa con monitor apagado
        g.fillStyle = '#4a3220'; g.fillRect(3, 14, 26, 10); g.fillStyle = '#2a1c10'; g.fillRect(3, 24, 26, 2); g.fillRect(4, 26, 3, 5); g.fillRect(25, 26, 3, 5);
        g.fillStyle = '#1e2436'; g.fillRect(10, 4, 12, 9); g.fillStyle = '#2e3652'; g.fillRect(11, 5, 10, 7); g.fillStyle = '#5ef2e0'; g.fillRect(12, 7, 3, 1);
        g.fillStyle = '#1e2436'; g.fillRect(14, 13, 4, 2);
      } else if (z === 'cementerio') {   // una lápida torcida con «RIP»
        g.fillStyle = '#6a6e68'; g.fillRect(8, 8, 16, 22); g.fillRect(10, 5, 12, 3); g.fillRect(11, 4, 10, 1);
        g.fillStyle = '#42463f'; g.fillRect(8, 28, 16, 2); g.fillRect(22, 8, 2, 22);
        g.fillStyle = '#2a2e2a'; g.fillRect(11, 11, 3, 4); g.fillRect(15, 11, 3, 4); g.fillRect(19, 11, 2, 4); g.fillRect(11, 17, 10, 1);
        g.fillStyle = '#3a5a30'; g.fillRect(6, 27, 4, 3); g.fillRect(23, 26, 3, 4);
      } else {   // una pila de cajas de servidores
        g.fillStyle = '#2c3246'; g.fillRect(4, 10, 24, 20); g.fillStyle = '#1a1e2e'; g.fillRect(4, 16, 24, 1); g.fillRect(4, 23, 24, 1); g.fillRect(16, 10, 1, 20);
        g.fillStyle = '#3fcf6a'; g.fillRect(6, 12, 1, 1); g.fillRect(18, 19, 1, 1); g.fillStyle = '#ff4b5c'; g.fillRect(18, 12, 1, 1); g.fillStyle = '#f7d34a'; g.fillRect(6, 26, 1, 1);
      }
    });
    lienzoCas(z + '_mueble1', g => {
      g.drawImage(CAS[z + '_suelo1'], 0, 0);
      if (z === 'oficinas') {   // un archivador con una planta muerta encima
        g.fillStyle = '#5a5e74'; g.fillRect(8, 12, 16, 18); g.fillStyle = '#3a3e52'; for (let y = 14; y < 30; y += 5) g.fillRect(9, y, 14, 1); g.fillRect(14, 16, 4, 1); g.fillRect(14, 21, 4, 1); g.fillRect(14, 26, 4, 1);
        g.fillStyle = '#4a3220'; g.fillRect(12, 8, 8, 4); g.fillStyle = '#5a5a3a'; g.fillRect(11, 4, 4, 4); g.fillRect(17, 3, 5, 5); g.fillRect(14, 7, 5, 2);
      } else if (z === 'cementerio') {   // un árbol muerto
        g.fillStyle = '#2a1e12'; g.fillRect(14, 10, 4, 20); g.fillRect(10, 8, 4, 2); g.fillRect(8, 5, 2, 4); g.fillRect(18, 6, 5, 2); g.fillRect(22, 2, 2, 5); g.fillRect(12, 2, 2, 7); g.fillRect(11, 28, 10, 2);
        g.fillStyle = '#3a2c1c'; g.fillRect(15, 12, 1, 16);
      } else {   // un monitor roto echando chispas
        g.fillStyle = '#1e2436'; g.fillRect(6, 8, 20, 16); g.fillStyle = '#2c3246'; g.fillRect(12, 24, 8, 3); g.fillRect(9, 27, 14, 2);
        g.fillStyle = '#0e1018'; g.fillRect(8, 10, 16, 12); g.fillStyle = '#5ef2e0'; g.fillRect(9, 11, 6, 1); g.fillRect(9, 13, 9, 1); g.fillRect(9, 17, 4, 1);
        g.fillStyle = '#f7d34a'; g.fillRect(22, 6, 1, 3); g.fillRect(24, 5, 1, 2); px(g, 20, 4, '#ffffff');
      }
    });
  }
  // la antorcha de los muros: soporte y llama (dos cuadros)
  for (let f = 0; f < 2; f++) lienzoCas('antorcha' + f, g => {
    g.fillStyle = '#2a1a0c'; g.fillRect(14, 18, 4, 8); g.fillStyle = '#4a3220'; g.fillRect(15, 18, 1, 7);
    g.fillStyle = '#5a5e74'; g.fillRect(12, 24, 8, 2);
    g.fillStyle = '#c04a10'; g.fillRect(12 + f, 10, 7 - f, 9); g.fillStyle = '#ff9a2a'; g.fillRect(13 + f, 9 + f, 5 - f, 8); g.fillStyle = '#ffd848'; g.fillRect(14 + f, 11 - f, 3 - f, 5); g.fillStyle = '#fff6c0'; g.fillRect(15, 14 - f, 1, 3);
  });
}
// el nombre de la casilla a pintar según la zona y la casilla de debajo (los muros enseñan su cara si hay suelo debajo)
function casilla(zona, tipo, variante) {
  const z = ZONAS_ARTE[zona] ? zona : 'foro';   // la azotea del CEO usa el arte del Foro (de momento)
  return CAS[z + '_' + tipo + (variante === undefined ? '' : variante)] || CAS[z + '_suelo0'];
}
