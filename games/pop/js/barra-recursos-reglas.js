// Fans of Pop · LA BARRA DE CORAZONES, MONEDAS Y PERLAS, las reglas (dominio puro, tarea #373; Pepins eligió el boceto A el 25-11-2026,
// reportes 53, 55 y 60): qué grupos salen en cada pantalla, cómo se escriben las cifras, dónde va cada pieza dentro de la pastilla y
// cuándo baja el botón de pausa. Sin dibujo ni reloj: el lienzo y el HTML están en js/barra-recursos.js.
'use strict';
const PP_BARRA_REGLAS = Object.freeze((() => {
  // los grupos de cada pantalla, en orden; el «+» de la tienda solo en el camino (en Memoria no se gastan corazones)
  const GRUPOS = Object.freeze({
    camino: Object.freeze(['corazones', 'monedas', 'perlas', 'mas']),
    nivel: Object.freeze(['corazones', 'monedas', 'perlas']),
    memoria: Object.freeze(['monedas', 'perlas']),
    victoria: Object.freeze(['corazones', 'monedas', 'perlas']),
  });
  const grupos = pantalla => GRUPOS[pantalla] || Object.freeze([]);
  // las medidas de la pastilla en el lienzo (540 de ancho), a escala 1; si no cabe en `maximo`, se encoge entera
  const MEDIDAS = Object.freeze({ alto: 64, corazon: 36, icono: 36, hueco: 6, sep: 2, margenSep: 12, mas: 36, margenMas: 10, bordeIzq: 16, bordeDer: 12, maximo: 500 });

  // una cifra con los puntos de los miles (1.234); de 100.000 en adelante, corta: 123K y 1,2M. Lo que no es un número válido, 0
  function cifra(n) {
    const v = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
    if (v >= 1e6) return String(Math.floor(v / 1e5) / 10).replace('.', ',') + 'M';
    if (v >= 1e5) return Math.floor(v / 1e3) + 'K';
    return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  // el ancho de una pieza: los corazones (`anchos.vidas`, 5 si no dice), un icono con su cifra (`anchos` trae lo que mide cada cifra) o el «+»
  function anchoPieza(tipo, anchos, M) {
    if (tipo === 'corazones') return (Number.isInteger(anchos.vidas) && anchos.vidas > 0 ? anchos.vidas : 5) * M.corazon;
    if (tipo === 'mas') return M.mas;
    return M.icono + M.hueco + Math.max(0, Number(anchos[tipo]) || 0);
  }
  // dónde va cada pieza, desde el borde izquierdo de la pastilla: un separador entre grupos y el «+» al final, sin separador.
  // Devuelve { ancho, alto, esc, piezas: [{ tipo, x, w }] }; esc (≤ 1) encoge la pastilla entera si pasa de `maximo`
  function medidas(lista, anchos = {}, maximo = MEDIDAS.maximo) {
    const M = MEDIDAS, piezas = [];
    let x = M.bordeIzq;
    lista.forEach((tipo, k) => {
      if (k > 0 && tipo !== 'mas') { piezas.push(Object.freeze({ tipo: 'sep', x: x + M.margenSep, w: M.sep })); x += M.sep + 2 * M.margenSep; }
      if (tipo === 'mas') x += M.margenMas;
      const w = anchoPieza(tipo, anchos, M);
      piezas.push(Object.freeze({ tipo, x, w }));
      x += w;
    });
    const ancho = x + M.bordeDer, esc = ancho > maximo ? maximo / ancho : 1;
    return Object.freeze({ ancho, alto: M.alto, esc, piezas: Object.freeze(piezas) });
  }

  // el reloj del siguiente corazón: solo si falta alguno y no hay corazones infinitos
  const conReloj = (vidas, max, infinitas) => !infinitas && vidas < max;
  // la pausa baja a la segunda fila en un nivel normal (la barra ocupa la de arriba entera); en los duelos sigue arriba
  const pausaBaja = (pantalla, duelo) => pantalla === 'sala' && !duelo;
  // el nombre del mundo y la estrella del camino, centrados juntos en `centro`: { xNombre, xChip } (el nombre, centrado en xNombre)
  function nombreConEstrella(anchoNombre, anchoChip, centro, hueco = 12) {
    const total = anchoNombre + hueco + anchoChip, x0 = centro - total / 2;
    return Object.freeze({ xNombre: x0 + anchoNombre / 2, xChip: x0 + anchoNombre + hueco });
  }
  return { GRUPOS, MEDIDAS, grupos, cifra, medidas, conReloj, pausaBaja, nombreConEstrella };
})());
