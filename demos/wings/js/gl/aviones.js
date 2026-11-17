// Fans of Wings · Los seis aviones chibi (cortos, gorditos y con la cabina enorme), montados con las piezas de maquetas.js. Cada uno
// parte de un avión de verdad y lleva los colores y el emblema de su piloto: Zanahoria Uno (CrazyBunny, tipo Su-27, negro y naranja),
// Zorra Invisible (SlyFox, tipo F-22), Castor Bombardero (BoomBeaver, tipo A-10), el dron del becario, el bombardero de cajas (un
// avión de carga) y SurvivalBot (un ala volante). Medidas en unidades: x a los lados, y arriba, z a lo largo con el morro en 0.
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  const MQ = A.maquetas, AV = A.aviones = {};
  const CONEJO = ['XX...XX', 'XX...XX', 'XX...XX', 'XX...XX', 'XXXXXXX', 'X.XXX.X', 'XXXXXXX', 'XXX.XXX', '.XXXXX.'];
  const ZORRO = ['X.....X', 'XX...XX', 'XXX.XXX', 'XXXXXXX', 'X.XXX.X', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
  const CASTOR = ['.X...X.', 'XXXXXXX', 'X.XXX.X', 'XXXXXXX', 'XXX.XXX', '.XXXXX.', '..X.X..', '..X.X..', '.......'];
  // Lo que llevan todos igual.
  const COMUN = { misil: '#f4f4f0', misilpunta: '#e63a2a', emblema: '#ffffff', fuego: '#ffc24a', luzroja: '#e63a2a', luzverde: '#3fae3a', toma: '#0e0f12', tobera: '#5d6068', pala: '#5d6068', buje: '#ffd23c' };
  const pal = (p) => Object.assign({}, COMUN, p);
  // Retoques de pintura: el emblema del piloto en lo alto de cada ala y las luces de las puntas (roja a un lado, verde al otro).
  const enAla = (bits, x0, z0) => (p, ax, y, z) => (p === 'ala' && MQ.punto(bits, 2, ax - x0, z - z0) ? 'emblema' : null);
  const luces = (ax0, z0) => (p, ax, y, z, x) => (p === 'punta' && ax > ax0 && z > z0 && z < z0 + 1.4 ? (x < 0 ? 'luzroja' : 'luzverde') : null);

  function bunny() {
    const F = [[0, 0, 0, -0.8], [0.8, 1.0, 1.0, -0.8], [3, 2.2, 2.1, -0.4], [7, 3.1, 3.3, 0.6], [11, 3.4, 3.7, 1.0], [17, 3.3, 3.4, 0.8], [24, 2.6, 2.4, 0.5], [31, 1.6, 1.4, 0.2], [37, 1.1, 1.0, 0], [39.6, 0.3, 0.3, 0]];
    return { k: 3, ky: 4, u: 0.75, ancho: 19, alto: [-6.5, 13.5], largo: 41, toberas: [[-4.6, -2.6, 37], [4.6, -2.6, 37]], punta: [16.5, -0.2, 30],
      pal: pal({ cuerpo: '#25272e', lomo: '#31343d', panza: '#3d414b', morro: '#ff8a1c', antirreflejo: '#0e0f12', ala: '#31343d', borde: '#ff8a1c', punta: '#ff8a1c', franja: '#ffab40',
        deriva: '#25272e', cristal: '#b85a0c', brillo: '#ffd98a', marco: '#0e0f12', aro: '#ff8a1c', motor: '#25272e', detalle: '#ff8a1c', galon: '#ff8a1c' }),
      piezas: [MQ.cabina(F, 5.5, 15.8, 0.82, 1.15), MQ.bola(2.2, 4.6, 0.85, 'emblema'), MQ.fuselaje(F, { morro: 3.2, anti: [3.2, 5.6] }),
        MQ.antena(18.5, 5.6), MQ.antena(23, 4.4), MQ.antena(27.5, 3.2), MQ.misil(16.9, -0.2, 23.5, 31, 0.7), MQ.misil(11.8, -1.9, 19, 27, 0.7),
        MQ.tubo({ x: 4.6, y: -2.6, r: 2.6, rx: 2.7, z0: 15, z1: 37, inclina: 0.8, tobera: 2.8, labio: 0.8, fuego: true }),
        MQ.plano([[9, 3], [16, 8.2], [31, 8.2], [34, 6]], { y0: -1.2, y1: 0.7, panza: 0.7, galones: [17.2, 20], pend: 0.6 }),
        MQ.ala({ s0: 7.5, s1: 16.5, le0: 16, te0: 29, le1: 25, te1: 30.5, y: -0.2, g0: 1.2, g1: 0.6, punta: 1.6 }),
        MQ.ala({ s0: 7, s1: 12.5, le0: 30, te0: 37, le1: 34.5, te1: 38.5, y: -0.7, g0: 0.9, g1: 0.5, punta: 1.4 }),
        MQ.deriva({ x: 7, y0: 0.4, y1: 11.6, a0: 25.5, b0: 35.5, a1: 30, b1: 36.5, banda: 1.4, emblema: [CONEJO, 2, 30.4, 9.4] }),
        MQ.deriva({ x: 7, y0: -4.4, y1: -1.2, a0: 31, b0: 35, a1: 30, b1: 35.5 })],
      pintas: [enAla(CONEJO, 8.7, 21.4), luces(15.6, 25.4), (p, ax, y, z) => (z > 38 ? 'detalle' : null)] };
  }

  // Las tomas de aire y las toberas planas de la zorra, talladas en su cuerpo ancho.
  function bocasZorra(W) {
    const wz = MQ.perfil(W);
    return function (ax, y, z) {
      if (z < 10 || z > 39.5 || y < -1.7 || y > 0.9 || ax > wz(z)[0]) return null;
      if (z < 11.4) return ax > 3.7 && ax < wz(z)[0] - 0.4 && y > -1.3 && y < 0.5 ? 'toma' : null;
      if (z > 38.4 && ax > 1.6 && ax < 5.2 && y > -1.2 && y < 0.5) return 'fuego';
      return z > 37.4 ? 'tobera' : (z > 36.8 ? 'aro' : null);
    };
  }
  function zorro() {
    const F = [[0, 0, 0, -0.5], [1, 1.2, 0.9, -0.5], [4, 2.4, 2.0, -0.2], [8, 3.2, 3.2, 0.5], [12, 3.5, 3.6, 0.8], [20, 3.4, 3.2, 0.6], [30, 3.0, 2.4, 0.3], [38, 2.6, 1.8, 0.1], [40, 2.4, 1.6, 0.1]];
    const W = [[10, 3.5], [14, 6.6], [34, 6.6], [39.5, 5]];
    return { k: 3, ky: 4, u: 0.85, ancho: 18, alto: [-6, 13], largo: 42, toberas: [[-3.4, -0.3, 39.5], [3.4, -0.3, 39.5]], punta: [16.5, 0, 30],
      pal: pal({ cuerpo: '#d9451c', lomo: '#ef6a3a', panza: '#f4e7d3', morro: '#0e0f12', antirreflejo: '#0e0f12', ala: '#ef6a3a', borde: '#f4e7d3', punta: '#0e0f12', franja: '#f4e7d3',
        deriva: '#d9451c', cristal: '#b85a0c', brillo: '#ffd98a', marco: '#0e0f12', aro: '#f4e7d3', motor: '#d9451c' }),
      piezas: [MQ.cabina(F, 5.5, 15.5, 0.8, 1.15), MQ.fuselaje(F, { morro: 2.6, anti: [2.6, 5.4], exp: 2.6 }), MQ.misil(11, -1.7, 22, 30, 0.65),
        bocasZorra(W), MQ.plano(W, { y0: -1.7, y1: 0.9, panza: 0.8 }),
        MQ.ala({ s0: 6, s1: 16.5, le0: 14, te0: 33, le1: 27, te1: 30, y: 0, g0: 1.2, g1: 0.6, punta: 1.8, franja: [13.2, 14.2] }),
        MQ.ala({ s0: 5.5, s1: 12.5, le0: 32, te0: 39.5, le1: 37, te1: 41, y: -0.3, g0: 0.9, g1: 0.5, punta: 1.2 }),
        MQ.deriva({ x: 5.2, y0: 0.6, y1: 10.8, a0: 26, b0: 36, a1: 32.5, b1: 37.5, inclina: 0.26, banda: 1.5, emblema: [ZORRO, 2, 31.7, 8.8] })],
      pintas: [enAla(ZORRO, 7.4, 23.2)] };
  }

  // Los dos dientes del castor y la línea de la boca, pintados en el morro.
  function dientes(p, ax, y, z) {
    if (z < 3.6 && ax > 0.15 && ax < 1.35 && y < -0.5 && y > -2.6) return 'emblema';
    return z < 3.2 && ax < 2.2 && y < 0.3 && y > -0.5 ? 'marco' : null;
  }
  function castor() {
    const F = [[0, 0, 0, -0.6], [1, 1.6, 1.5, -0.6], [4, 3.0, 2.9, -0.2], [8, 3.6, 3.7, 0.3], [14, 3.7, 3.8, 0.4], [24, 3.3, 3.2, 0.3], [32, 2.4, 2.2, 0.4], [38, 1.8, 1.4, 0.5], [41, 1.5, 1.0, 0.5]];
    return { k: 3, ky: 4, u: 0.7, ancho: 21, alto: [-6, 13], largo: 42, toberas: [[-4.8, 3.6, 34.5], [4.8, 3.6, 34.5]], punta: [19.5, -1.2, 23.5],
      pal: pal({ cuerpo: '#a86a32', lomo: '#c58648', panza: '#f4e7d3', morro: '#f4e7d3', antirreflejo: '#6b4320', ala: '#c58648', borde: '#f4e7d3', punta: '#e63a2a', franja: '#f4e7d3',
        deriva: '#a86a32', cristal: '#2b5fa8', brillo: '#9fd8ff', marco: '#6b4320', aro: '#f4e7d3', motor: '#6b4320' }),
      piezas: [MQ.cabina(F, 5.5, 14.5, 0.8, 1.1), MQ.fuselaje(F, { morro: 2.6, anti: [2.6, 5.2] }),
        MQ.misil(8, -2.9, 15, 21.5, 0.95), MQ.misil(12.5, -2.9, 15.5, 22, 0.95), MQ.misil(16.2, -2.9, 16, 22.5, 0.95),
        MQ.ala({ s0: 3, s1: 19.5, le0: 14, te0: 24.5, le1: 16, te1: 23.5, y: -1.2, g0: 1.5, g1: 0.9, punta: 1.8, franja: [14.6, 15.8] }),
        MQ.tubo({ x: 4.8, y: 3.6, r: 2.4, z0: 23, z1: 34.5, tobera: 2.2, boca: 1 }), MQ.caja(2.4, 4.8, 0.6, 3.4, 25.5, 32, 'cuerpo'),
        MQ.ala({ s0: 1, s1: 9.8, le0: 34.5, te0: 41.5, le1: 35.5, te1: 41.5, y: 0.6, g0: 1, g1: 0.9 }),
        MQ.deriva({ x: 9.5, y0: 0.4, y1: 8.8, a0: 34.5, b0: 41.5, a1: 36.2, b1: 41.5, banda: 1.2, emblema: [CASTOR, 2, 36.5, 7.2] })],
      pintas: [dientes, enAla(CASTOR, 6.6, 16.2)] };
  }

  // El ojo del dron: una lente roja con su reflejo, metida en un cerco oscuro en lo alto de la cabeza.
  function ojoDron(ax, y, z) {
    const d = Math.sqrt(ax * ax + (y - 2.5) * (y - 2.5) + (z - 4.6) * (z - 4.6));
    if (d < 0.6 && y > 3) return 'emblema';
    return d < 1.35 ? 'ojo' : (d < 1.8 ? 'toma' : null);
  }
  function becario() {
    const F = [[0, 0, 0, 0.4], [1, 1.8, 1.6, 0.4], [4, 3.0, 2.8, 0.6], [8, 3.2, 3.0, 0.6], [13, 2.4, 2.2, 0.2], [22, 2.0, 1.9, 0], [30, 1.7, 1.6, 0], [32, 1.2, 1.2, 0]];
    return { k: 2, ky: 3, u: 0.95, ancho: 19, alto: [-5, 10], largo: 35, toberas: [[0, 0, 33]], punta: [18, 0.2, 18.8],
      pal: pal({ cuerpo: '#3a6cff', lomo: '#6f95ff', panza: '#2748b8', morro: '#ffd23c', ala: '#6f95ff', borde: '#ffffff', punta: '#ffd23c', franja: '#ffd23c', deriva: '#3a6cff', ojo: '#e63a2a' }),
      piezas: [ojoDron, MQ.fuselaje(F, { morro: 1.6 }), MQ.misil(8, -1.3, 12, 18.5, 0.6),
        MQ.ala({ s0: 1.5, s1: 18, le0: 13, te0: 19.8, le1: 15.5, te1: 18.8, y: 0.2, g0: 1, g1: 0.55, punta: 2.2, franja: [9.5, 10.6] }),
        MQ.deriva({ x: 1.2, y0: 0.5, y1: 7.4, a0: 25, b0: 31, a1: 28.5, b1: 32, inclina: 0.75, banda: 1.5 }),
        MQ.deriva({ x: 0, y0: -4.2, y1: -1, a0: 26, b0: 31, a1: 27.5, b1: 31 }), MQ.helice(0, 0, 33, 3.6)] };
  }

  // La cinta de embalar de la caja: dos vueltas rojas y una tira clara a lo largo del lomo.
  function cinta(p, ax, y, z) {
    if (ax > 4.25 || y > 4.25 || p === 'cristal' || p === 'marco' || p === 'brillo' || p === 'morro') return null;
    if ((z > 15.5 && z < 18) || (z > 24.5 && z < 27)) return 'franja';
    return ax < 0.5 && y > 0 && z > 11 && z < 30 ? 'borde' : null;
  }
  function caja() {
    const F = [[0, 0, 0, -0.8], [1, 2.2, 2.0, -0.8], [4, 3.8, 3.6, -0.2], [8, 4.2, 4.2, 0], [28, 4.2, 4.2, 0], [36, 2.6, 2.4, 1.4], [41.5, 1.2, 1.0, 2.4]];
    const motor = (x, y, r, z) => [MQ.helice(x, y, z - 0.8, r + 1.6), MQ.tubo({ x, y, r, z0: z, z1: 21, tobera: 0.8, boca: 0 })];
    return { k: 2, ky: 3, u: 1.05, ancho: 22, alto: [-6, 14], largo: 43, toberas: [[-8, 2.6, 21], [8, 2.6, 21], [-14, 2.8, 21], [14, 2.8, 21]], punta: [20.5, 3.7, 22.5],
      pal: pal({ cuerpo: '#e2b324', lomo: '#8a5a1c', panza: '#b98a12', morro: '#8a5a1c', antirreflejo: '#8a5a1c', ala: '#e2b324', borde: '#f4e7d3', punta: '#e63a2a', franja: '#e63a2a',
        deriva: '#e63a2a', cristal: '#2b5fa8', brillo: '#9fd8ff', marco: '#8a5a1c', aro: '#f4e7d3', motor: '#8a5a1c', tobera: '#0e0f12' }),
      piezas: [MQ.cabina(F, 3.2, 10.5, 0.85, 0.75), ...motor(8, 2.6, 1.8, 11.4), ...motor(14, 2.8, 1.6, 12.4), MQ.fuselaje(F, { morro: 2.2, exp: 4 }),
        MQ.ala({ s0: 2, s1: 20.5, le0: 14, te0: 23.5, le1: 16.5, te1: 22.5, y: 3.7, g0: 1.4, g1: 0.8, punta: 1.8, franja: [10.6, 11.6] }),
        MQ.ala({ s0: 1, s1: 10, le0: 35, te0: 41.5, le1: 37.5, te1: 41.5, y: 3, g0: 0.9, g1: 0.6, punta: 1.4 }),
        MQ.deriva({ x: 0, y0: 3, y1: 12.6, a0: 31, b0: 41.5, a1: 37, b1: 42, banda: 1.4 })],
      pintas: [cinta] };
  }

  function jefe() {
    const F = [[0, 0, 0, 0], [1, 2.0, 1.4, 0], [5, 4.5, 3.4, 0.4], [12, 5.5, 4.2, 0.6], [22, 5.0, 3.6, 0.4], [30, 3.5, 2.2, 0.2], [35, 1.5, 1.0, 0]];
    const sierra = (ax) => 6 * Math.abs(((ax / 8.5) % 1) - 0.5);   // el borde de atrás, en dientes de sierra
    return { k: 2, ky: 3, u: 1.55, ancho: 30, alto: [-6, 11], largo: 40, toberas: [[-9.5, 1.3, 32], [9.5, 1.3, 32]], punta: [28.5, 0, 33],
      pal: pal({ cuerpo: '#4d5564', lomo: '#e63a2a', panza: '#2f3540', morro: '#2f3540', antirreflejo: '#2f3540', ala: '#5d6676', borde: '#e63a2a', punta: '#ffd23c', franja: '#e63a2a',
        deriva: '#2f3540', cristal: '#e63a2a', brillo: '#ffd98a', marco: '#0e0f12', aro: '#e63a2a', motor: '#2f3540', tobera: '#0e0f12' }),
      piezas: [MQ.cabina(F, 4, 14, 0.75, 0.95), MQ.fuselaje(F, { morro: 2 }),
        MQ.tubo({ x: 9.5, y: 1.3, r: 1.9, rx: 2.6, z0: 13, z1: 32, tobera: 2.2, inclina: -0.8, fuego: true }),
        MQ.misil(15, -1.6, 17, 26, 0.8), MQ.misil(21, -1.2, 22, 30, 0.8),
        MQ.ala({ s0: 3, s1: 28.5, le0: 6, te0: 30, le1: 26, te1: 33, y: 0, g0: 2.4, g1: 0.7, punta: 2.2, franja: [18.5, 19.8], atras: sierra }),
        MQ.deriva({ x: 15.5, y0: 0.5, y1: 5, a0: 23.5, b0: 28.5, a1: 26, b1: 29, banda: 1 })] };
  }

  const HACER = { bunny, zorro, castor, becario, caja, jefe }, HECHOS = {};
  AV.ids = Object.keys(HACER);
  AV.dame = (id) => HECHOS[id] || (HECHOS[id] = HACER[id]());
})(WINGS);
