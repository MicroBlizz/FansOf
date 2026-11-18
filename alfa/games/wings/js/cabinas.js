// Fans of Wings · Las cabinas (datos, sin dibujar): dónde está cada instrumento en la imagen de la cabina de cada caza y qué marca.
// Las medidas van en los «píxeles gordos» del dibujo (480x270 la parte central; la imagen trae 75 más a cada lado). Las imágenes
// salen de herramientas/wings/cabinas/generar.py: si allí se mueve un instrumento, aquí se cambia su sitio. cabinaDatos() saca de
// la misión las lecturas (de 0 a 1 para agujas y barras, y las cifras para las pantallas); las dibuja cabina.js.
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  const NARANJA = '#ff8a1c', AMBAR = '#ffb040', VERDE = '#3fe05f', TURQUESA = '#7dffd0', BLANCO = '#ffffff', AMARILLO = '#ffd23c';
  // relojes: aguja de 0 a 1 · textos: { de: lectura, et: rótulo delante (se traduce), al: alineación } · palanca: caja de su imagen
  A.cabinas = {
    bunny: {
      relojes: [{ x: 95.5, y: 201.5, r: 16, de: 'vel', color: NARANJA }, { x: 95.5, y: 238.5, r: 13, de: 'comb', color: NARANJA },
        { x: 385.5, y: 201.5, r: 16, de: 'alt', color: NARANJA }, { x: 385.5, y: 238.5, r: 13, de: 'esc', color: VERDE },
        { x: 202.5, y: 246.5, r: 8, de: 'motor', color: AMBAR }, { x: 278.5, y: 246.5, r: 8, de: 'giro', color: AMBAR }],
      radar: { x: 156.5, y: 214.5, r: 21 }, horizonte: { x: 240.5, y: 204.5, r: 28 },
      textos: [{ x: 346, y: 186, de: 'nAlt', al: 'right', color: AMBAR }, { x: 346, y: 195, de: 'nVel', al: 'right', color: AMBAR }, { x: 346, y: 204, de: 'nComb', al: 'right', color: AMBAR },
        { x: 196, y: 71, de: 'nVel', et: 'VEL', al: 'left', color: '#7dff9a' }, { x: 284, y: 71, de: 'nAlt', et: 'ALT', al: 'right', color: '#7dff9a' },
        { x: 240.5, y: 147, de: 'rumbo', al: 'center', color: '#7dff9a' }, { x: 190, y: 266, de: 'horaSeg', al: 'center', color: NARANJA, tam: 3.5 }],
      barras: [{ x: 300, y: 247, w: 48, h: 6, n: 8, de: 'esc', color: VERDE }],
      misiles: { x: 301, y: 222, w: 46, h: 21 },
      palanca: { x: 228, y: 226, w: 25, h: 44 },
    },
    zorro: {
      relojes: [], radar: { x: 122.5, y: 220.5, r: 21 }, horizonte: { x: 240.5, y: 218.5, w: 59, h: 27 },
      textos: [{ x: 170, y: 99, de: 'nVel', al: 'right', color: TURQUESA }, { x: 334, y: 99, de: 'nAlt', al: 'right', color: TURQUESA },
        { x: 240.5, y: 55, de: 'rumbo', et: 'RBO', al: 'center', color: TURQUESA }, { x: 240.5, y: 151, de: 'fijado', al: 'center', color: '#ff4a3a' },
        { x: 203, y: 199, de: 'nVel', al: 'right', color: TURQUESA, caja: 24 }, { x: 297, y: 199, de: 'nAlt', al: 'right', color: TURQUESA, caja: 24 },
        { x: 240.5, y: 243.5, de: 'rumbo', et: 'RBO', al: 'center', color: TURQUESA, caja: 40 },
        { x: 88, y: 244, de: 'enemigos', et: 'E', al: 'left', color: '#ff4a3a' }, { x: 384, y: 217, de: 'misiles', al: 'center', color: BLANCO }],
      barras: [{ x: 323, y: 211, w: 16, h: 5, n: 5, de: 'comb', color: AMARILLO }, { x: 323, y: 227, w: 16, h: 5, n: 5, de: 'esc', color: VERDE }],
      gases: { x: 16, y: 210, w: 26, h: 3, paso: 5, n: 8, color: TURQUESA },
      palanca: { x: 384, y: 230, w: 25, h: 40 },
    },
    castor: {
      relojes: [{ x: 150.5, y: 198.5, r: 17, de: 'vel', color: BLANCO }, { x: 150.5, y: 238.5, r: 17, de: 'comb', color: AMARILLO },
        { x: 330.5, y: 198.5, r: 17, de: 'alt', color: BLANCO }, { x: 330.5, y: 238.5, r: 17, de: 'esc', color: VERDE },
        { x: 194.5, y: 244.5, r: 10, de: 'motor', color: BLANCO }, { x: 286.5, y: 244.5, r: 10, de: 'giro', color: BLANCO }],
      radar: { x: 45.5, y: 223.5, r: 19 }, horizonte: { x: 240.5, y: 206.5, r: 23 },
      textos: [{ x: 166, y: 49, de: 'nVel', et: 'VEL', al: 'left', color: AMARILLO }, { x: 314, y: 49, de: 'nAlt', et: 'ALT', al: 'right', color: AMARILLO },
        { x: 253, y: 245.5, de: 'bombasD', al: 'center', color: '#2a1a0c' }, { x: 263, y: 245.5, de: 'bombasU', al: 'center', color: '#2a1a0c' },
        { x: 295.5, y: 185, de: 'hora', al: 'center', color: AMBAR }],
      barras: [], misiles: { x: 79, y: 238, w: 32, h: 12 },
      palanca: { x: 227, y: 240, w: 27, h: 30 },
    },
  };

  A.cabinas.vaca = A.cabinas.castor;   // la cabina de Filete Rosa lleva los instrumentos en el mismo sitio que la del castor (vaca.py)

  const entre01 = (v) => Math.max(0, Math.min(1, v));
  const dos = (n) => String(n).padStart(2, '0');
  // Las lecturas de la cabina en este instante. `ahora` es un Date (la hora del reloj del panel).
  A.cabinaDatos = function (e, ahora) {
    const j = e.aire.jugador, P = e.aj.aire.vuelo, VU = A.vuelo;
    const rumbo = ((Math.round(VU.rumbo(j) * 180 / Math.PI) % 360) + 360) % 360;
    return {
      vel: entre01(j.vel / P.velMax), alt: entre01(j.pos.y / P.altMax), comb: entre01(e.combustible / e.aj.combustible.max),
      esc: entre01(e.escudo / e.caza.escudo), motor: entre01((j.vel - P.velMin) / (P.velMax - P.velMin)), giro: entre01(0.5 + VU.alabeo(j) / Math.PI),
      nVel: Math.round(j.vel * 3.6), nAlt: Math.round(j.pos.y), nComb: Math.ceil(e.combustible), rumbo: String(rumbo).padStart(3, '0'),
      misiles: e.misiles, bombasD: Math.floor(e.bombas / 10) % 10, bombasU: e.bombas % 10, enemigos: e.aire.enemigos.length + (e.aire.jefe ? 1 : 0),
      fijado: e.aire.fijando.fijado ? 'MISIL LISTO' : '', alabeo: VU.alabeo(j), cabeceo: Math.asin(Math.max(-1, Math.min(1, j.f.y))),
      hora: dos(ahora.getHours()) + ':' + dos(ahora.getMinutes()), horaSeg: dos(ahora.getHours()) + ':' + dos(ahora.getMinutes()) + ':' + dos(ahora.getSeconds()),
    };
  };
})(WINGS);
