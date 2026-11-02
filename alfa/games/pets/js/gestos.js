// Fans Of Pets · GESTOS: cómo se mueve una criatura POR PIEZAS (figura.js) en cada gesto: cuántos grados gira cada pieza en el
// instante t (segundos). Grados en el sentido del reloj, sobre el punto de giro de cada pieza. Solo cuentas, sin reloj ni dibujo:
// quien pinta pasa el tiempo. Las piezas que la criatura no tiene (orejas móviles, cola) simplemente no se usan.
'use strict';
PT.gestos = (() => {
  const ola = (t, hz) => Math.sin(2 * Math.PI * hz * t);
  // el gesto → sus giros en el instante t. Cada uno es un bucle (se repite solo)
  const GESTOS = {
    quieto: t => ({ cabeza: 2 * ola(t, 0.25), 'oreja-izq': -3 * ola(t, 0.5), 'oreja-der': 3 * ola(t, 0.5), cola: 6 * ola(t, 0.7) }),
    mirar: t => ({ cabeza: 9 * ola(t, 0.3), 'oreja-izq': 4 * ola(t, 0.3), 'oreja-der': 4 * ola(t, 0.3) }),
    // el brazo derecho se abre hacia fuera y saluda (más arriba lo tapa la cabezota); la cabeza se ladea hacia él
    saludo: t => ({ 'brazo-der': -80 + 18 * ola(t, 1.6), cabeza: 5, cola: 8 * ola(t, 1.6) }),
    // las orejas se abren y se cierran dos veces y luego se mecen juntas
    orejas: t => {
      const a = 14 * ola(t, 0.8), juntas = (t % 2.5) > 1.25;
      return { 'oreja-izq': juntas ? a : -a, 'oreja-der': a };
    },
    baile: t => ({ cabeza: 6 * ola(t, 1), 'brazo-izq': 30 * ola(t, 1), 'brazo-der': 30 * ola(t, 1), 'pierna-izq': 6 * ola(t, 2),
      'pierna-der': -6 * ola(t, 2), cola: 15 * ola(t, 2), 'oreja-izq': -8 * ola(t, 1), 'oreja-der': -8 * ola(t, 1) }),
  };
  const lista = () => Object.keys(GESTOS);
  // PT.ok({ pieza: grados }) o PT.error('gesto-desconocido', { gesto })
  function giros(gesto, t) {
    const g = GESTOS[gesto];
    return g ? PT.ok(g(t)) : PT.error('gesto-desconocido', { gesto });
  }
  return { lista, giros };
})();
