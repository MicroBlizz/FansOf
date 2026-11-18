// Fans of Wings · La vida en las calles de Barcelona (boceto de la tarea #99): coches, taxis negros y amarillos y autobuses rojos
// que circulan por las calles de la trama (cada calle en un sentido, como en el Eixample), con los faros encendidos, y el tranvía
// por la Diagonal. No se guarda nada: en cada imagen se calcula, a partir de la hora, dónde está cada vehículo de las calles
// cercanas a donde mira la cámara, y se escriben sus cajas en un lote que pinta el programa de fachadas.js. Van al doble de
// tamaño, como los edificios.
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  const GL = A.gl, B = A.barcelona, FA = A.fachadas;
  const TR = A.trafico = { vehiculos: 0 };
  const RADIO = 430, CADA = 46, MAX_CAJAS = 1500, D = new Float32Array(MAX_CAJAS * 30 * 9);
  let n = 0;   // vértices escritos en esta imagen
  const FARO = [1, 0.95, 0.72], PILOTO = [1, 0.16, 0.1], LUZ_DENTRO = [1, 0.84, 0.55];
  const COCHES = ['#e8e6e0', '#b9bcc2', '#3a3f48', '#c23a2e', '#2f5f9e', '#d9d2c0', '#5a6068'].map(GL.hex);
  const TAXI = GL.hex('#17181c'), AMARILLO = GL.hex('#f2c230'), BUS = GL.hex('#c9302a'), TRAM = GL.hex('#eef2ee'), TRAM_VERDE = GL.hex('#3f9a6a');

  const CARAS = [   // las cinco caras que se ven de una caja (sin la de abajo), con su brillo
    [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1], 1], [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1], 0.72], [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1], 0.6],
    [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1], 0.66], [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], 0.8]];
  // Una caja de (x0, y0, z0) a (x1, y1, z1). Con `luz`, todas las caras igual de brillantes (faros y ventanillas encendidas).
  function caja(x0, x1, y0, y1, z0, z1, col, luz) {
    if (n + 30 > MAX_CAJAS * 30) return;
    for (const [a, b, c, d, k] of CARAS) {
      const f = luz ? 1 : k * 0.8;
      for (const v of [a, b, c, a, c, d]) {
        const o = n++ * 9;
        D[o] = v[0] ? x1 : x0; D[o + 1] = v[1] ? y1 : y0; D[o + 2] = v[2] ? z1 : z0;
        D[o + 3] = col[0] * f; D[o + 4] = col[1] * f; D[o + 5] = col[2] * f; D[o + 6] = 0; D[o + 7] = 0; D[o + 8] = -1;
      }
    }
  }
  // Una caja centrada en (c, lat) sobre una calle: `largo` va a lo largo de la calle y `ancho` a través. porA = la calle va a lo largo de `a`.
  function enCalle(porA, c, lat, largo, ancho, y0, y1, col, luz) {
    const [x, z] = porA ? B.aDibujo(c, lat) : B.aDibujo(lat, c), dx = (porA ? largo : ancho) / 2, dz = (porA ? ancho : largo) / 2;
    caja(x - dx, x + dx, y0, y1, z - dz, z + dz, col, luz);
  }

  const Y = 0.9;
  function coche(porA, c, lat, sd, h) {
    const taxi = h > 0.8, col = taxi ? TAXI : COCHES[Math.floor(h * 8.7) % 7];
    enCalle(porA, c, lat, 9, 4.2, Y, Y + 2.4, col);
    enCalle(porA, c - sd * 0.6, lat, 5, 3.8, Y + 2.4, Y + 4.2, taxi ? AMARILLO : col);
    enCalle(porA, c + sd * 4.6, lat, 0.6, 3.8, Y + 0.8, Y + 1.8, FARO, true);
    enCalle(porA, c - sd * 4.6, lat, 0.6, 3.8, Y + 0.8, Y + 1.8, PILOTO, true);
  }
  function autobus(porA, c, lat, sd) {
    enCalle(porA, c, lat, 22, 5.2, Y, Y + 3, BUS);
    enCalle(porA, c, lat, 21.4, 5, Y + 3, Y + 5.4, LUZ_DENTRO, true);
    enCalle(porA, c, lat, 22, 5.2, Y + 5.4, Y + 6.4, BUS);
    enCalle(porA, c + sd * 11.2, lat, 0.6, 4.6, Y + 0.8, Y + 1.8, FARO, true);
    enCalle(porA, c - sd * 11.2, lat, 0.6, 4.6, Y + 0.8, Y + 1.8, PILOTO, true);
  }

  // ¿Hay calle con casas a los lados en este punto? (no en los parques, la ronda ni fuera del trozo)
  const K0 = B.GRAN_VIA - 5 * B.PASO - B.PASO / 2, I0 = B.MARINA - B.PASO / 2;
  function conCasas(porA, linea, c) {
    const otro = Math.round((c - (porA ? I0 : K0)) / B.PASO), zona = (d) => (porA ? B.zona(otro, linea + 5 + d) : B.zona(linea + d, otro));   // la calle `linea` a lo largo de `a` pasa entre las manzanas linea + 5 y linea + 6
    if (!(porA ? B.enTrozo(otro, linea + 5) && B.enTrozo(otro, linea + 6) : B.enTrozo(linea, otro) && B.enTrozo(linea + 1, otro))) return false;
    const z0 = zona(0), z1 = zona(1);
    return z0 !== 'ronda' && z1 !== 'ronda' && !(z0 === 'parque' && z1 === 'parque');
  }
  // Los vehículos de una calle (la número `linea` de las que van a lo largo de `a` o de `b`) que caen cerca del punto `c`.
  function calle(porA, linea, c, t) {
    const eje = (porA ? B.GRAN_VIA : B.MARINA) + linea * B.PASO, h0 = GL.h2(linea, porA ? 1 : 2, 31), sd = (linea + (porA ? 1 : 0)) & 1 ? 1 : -1;
    const corrido = h0 * CADA + sd * t * (11 + h0 * 7), k0 = Math.ceil((c - RADIO - corrido) / CADA), k1 = Math.floor((c + RADIO - corrido) / CADA);
    for (let k = k0; k <= k1; k++) {
      const h = GL.h2(k, linea * 2 + (porA ? 1 : 0), 37), pos = k * CADA + corrido;
      if (h < 0.3 || !conCasas(porA, linea, pos) || B.enAvenida(porA ? pos : eje, porA ? eje : pos, 4)) continue;
      const lat = eje + (k & 1 ? 3.4 : -3.4);
      if (h > 0.93) autobus(porA, pos, lat, sd); else coche(porA, pos, lat, sd, h);
      TR.vehiculos++;
    }
  }
  // El tranvía de la Diagonal: dos convoyes de cinco coches que van y vienen por la mediana.
  function tranvia(t) {
    const av = B.AVENIDAS[0];
    for (const [fase, sd] of [[0, 1], [1300, -1]]) {
      const s = ((t * 15 * sd + fase) % 2600 + 2600) % 2600 - 1300;
      for (let j = 0; j < 5; j++) {
        const [x, z] = B.aDibujo(av.p.a + av.d.a * (s + j * 7.6), av.p.b + av.d.b * (s + j * 7.6));
        caja(x - 3.4, x + 3.4, Y, Y + 3, z - 3.4, z + 3.4, j % 2 ? TRAM_VERDE : TRAM);
        caja(x - 3.3, x + 3.3, Y + 3, Y + 5.6, z - 3.3, z + 3.3, LUZ_DENTRO, true);
        caja(x - 3.4, x + 3.4, Y + 5.6, Y + 6.6, z - 3.4, z + 3.4, TRAM);
      }
    }
  }

  // Escribe y pinta el tráfico alrededor del punto del suelo al que mira la cámara (con el programa de fachadas ya puesto).
  TR.dibujar = function (cam, t) {
    n = 0; TR.vehiculos = 0;
    const f = cam.ejes.f, lejos = Math.min(700, cam.ojo[1] * 1.2), a = cam.ojo[0] + f[0] * lejos + B.SALIDA.a, b = cam.ojo[2] + f[2] * lejos + B.SALIDA.b;
    if (cam.ojo[1] < 1400) {
      const la = Math.round((a - B.MARINA) / B.PASO), lb = Math.round((b - B.GRAN_VIA) / B.PASO), m = Math.ceil(RADIO / B.PASO);
      for (let d = -m; d <= m; d++) { calle(false, la + d, b, t); calle(true, lb + d, a, t); }
    }
    tranvia(t);
    FA.pintaLote(D, n);
  };
})(WINGS);
