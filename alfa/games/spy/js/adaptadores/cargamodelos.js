// Fans of Spy · ADAPTADORES · Los modelos de Yoshi (.glb, figuras de vinilo de una pieza con su textura): al arrancar los descarga
// los 8 a la vez, los lee (gl/glb.js), decodifica su imagen y hace sus mallas con textura (gl/texturas.js). Cada .glb viene en las
// medidas propias del generador (tamaño y origen cualesquiera, de frente hacia +z); la tabla AJUSTE dice solo la altura que debe
// tener en el juego (una casilla mide 1) y el giro para que mire al norte (−z), y `ajuste` saca de su caja (mínimo y máximo) la
// matriz que lo deja de ese alto, mirando al norte, centrado en x y z y apoyado en y = 0. Lo que no se pueda cargar se queda sin
// malla y el juego sigue con el modelo por código de siempre (modelos.js y escenario.js): ver `uno`.
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
(function (S) {
  const M = S.gl.M;
  // alto: lo que mide de pie en el juego; giro: el que lo pone mirando al norte (todos los de Yoshi miran hacia +z).
  // Las alturas salen de los modelos por código: agente ~1,1 con las orejas, Becario ~1 (con su patinete), caja de mudanza 0,6,
  // los coches algo más grandes que los de código, la cabeza de la cámara ~0,35. Garita y barrera se estiran a su tramo.
  const AJUSTE = Object.freeze({
    crazybunny: { alto: 1.1, giro: Math.PI },
    becario: { alto: 1, giro: Math.PI },
    camara: { alto: 0.36, giro: Math.PI },
    caja: { alto: 0.58, giro: Math.PI },
    coche: { alto: 0.6, giro: Math.PI },      // más grandes que los de código (Daniel, 19-11-2026): ~1,2 de largo, llenan su plaza
    cochazo: { alto: 0.6, giro: Math.PI },
    garita: { alto: 1.4, giro: 0 },
    barrera: { alto: 0.85, giro: 0, fondo: 0.26 },   // el giro depende de qué lado esté la garita (escenario.js)
  });
  const NOMBRES = Object.keys(AJUSTE);
  // Tope de cada descarga: con mala cobertura un fetch puede quedarse parado sin dar error; al pasar este tiempo se corta y ese
  // modelo sale por código, para que el cartel de carga no se quede para siempre.
  const TOPE_MS = 15000;

  // La matriz que pasa el modelo de su caja [minimo, maximo] a la del juego: centrado en x y z, apoyado en y = 0, girado `giro`
  // alrededor del eje vertical y escalado para medir `alto`. Con `largo` (en x, ya girado) o `fondo` (en z) se estira a esa medida
  // en ese eje (la garita y la barrera, que ocupan un tramo de casillas); sin ellos, la escala es la misma en los tres ejes.
  function ajuste(minimo, maximo, opc) {
    const giro = opc.giro || 0, c = Math.abs(Math.cos(giro)), s = Math.abs(Math.sin(giro));
    const tx = maximo[0] - minimo[0], ty = maximo[1] - minimo[1], tz = maximo[2] - minimo[2];
    const k = opc.alto / ty, anchoX = tx * c + tz * s, anchoZ = tx * s + tz * c;
    const sx = opc.largo ? opc.largo / anchoX : k, sz = opc.fondo ? opc.fondo / anchoZ : k;
    const centro = M.traslada(-(minimo[0] + maximo[0]) / 2, -minimo[1], -(minimo[2] + maximo[2]) / 2);
    return M.une(M.escala(sx, k, sz), M.rotaY(giro), centro);
  }

  // Uno: descarga, lee y sube a WebGL. Si algo falla (sin red, archivo roto, imagen que no se decodifica) se avisa en la consola
  // y devuelve null: es un respaldo A PROPÓSITO, para que el juego no se quede colgado en el cartel de carga y siga con el modelo
  // por código de siempre para ese modelo.
  async function uno(nombre) {
    try {
      const r = await fetch('modelos/' + nombre + '.glb', { signal: AbortSignal.timeout(TOPE_MS) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const g = S.glb.lee(await r.arrayBuffer());
      if (!g.imagen) throw new Error('el modelo no trae textura');
      const imagen = await createImageBitmap(new Blob([g.imagen.datos], { type: g.imagen.tipo }));
      const malla = S.gl.mallaGlb(S.gl.empaquetaGlb(g), imagen);
      imagen.close();   // ya está en la GPU: se suelta la copia de memoria
      return { malla, minimo: g.minimo, maximo: g.maximo, ajuste: ajuste(g.minimo, g.maximo, AJUSTE[nombre]) };
    } catch (e) {
      console.warn('Spy: no se pudo cargar el modelo «' + nombre + '»; se usa el dibujado por código.', e);
      return null;
    }
  }

  // Los 8 a la vez. Nunca falla: deja en S.modelos.glb los que se cargaron (los que no, sin poner). Devuelve cuántos cargó.
  async function carga() {
    const hechos = await Promise.all(NOMBRES.map(uno));
    const glb = {};
    NOMBRES.forEach((n, i) => { if (hechos[i]) glb[n] = hechos[i]; });
    S.modelos.glb = Object.freeze(glb);
    return Object.keys(glb).length;
  }

  S.cargaModelos = Object.freeze({ AJUSTE, ajuste, carga });
})(SPY);
