// Fans Of Taxi · CINTAS / rampa de salto: una cuña naranja sobre la calzada, que sube en el sentido de la marcha del carril.
//
// La cuña acaba donde el coche salta (COCHE.enRampa mira la misma parte, de 0 a `TAXI.coche.rampaSube` del largo), y su cara de
// atrás es vertical: así se ve desde lejos por dónde se entra. Se construye en coordenadas del mundo, como las cintas.
'use strict';
CINTAS.rampaSalto = (() => {
  const NARANJA = 0xff7a1a, LADO = 0xc85a10, ALTO = 0.7;

  // un punto de la rampa: `a` metros a lo largo (desde su inicio) y `l` a lo ancho (positivo a la derecha), a `y` de altura
  function punto(rampa, a, l, y) {
    const s = Math.sin(rampa.ang), c = Math.cos(rampa.ang);
    return [rampa.x + s * a + c * l, y, rampa.z + c * a - s * l];
  }

  function construir(rampa, lista) {
    const largo = rampa.largo * TAXI.coche.rampaSube, mitad = rampa.ancho / 2;
    const suelo = (a, l) => { const p = punto(rampa, a, l, 0); return CIUDAD.alturaSuelo(p[0], p[2]) + CINTAS.estilo.medidas.rayaSobreSuelo; };
    const base = (a, l) => punto(rampa, a, l, suelo(a, l));
    const alto = l => punto(rampa, largo, l, suelo(largo, l) + ALTO);
    // la cara por la que se sube, los dos lados (triángulos) y la cara de atrás
    lista.cuadrilatero(base(0, -mitad), base(0, mitad), alto(mitad), alto(-mitad), NARANJA);
    lista.triangulo(base(0, mitad), base(largo, mitad), alto(mitad), LADO);
    lista.triangulo(base(0, -mitad), alto(-mitad), base(largo, -mitad), LADO);
    lista.cuadrilatero(base(largo, -mitad), alto(-mitad), alto(mitad), base(largo, mitad), LADO);
  }

  return { construir };
})();
