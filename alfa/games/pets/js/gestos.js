// Fans Of Pets · GESTOS: cómo se mueve una criatura POR PIEZAS (figura.js) en cada gesto: cuántos grados gira cada pieza en el
// instante t (segundos). Grados en el sentido del reloj, sobre el punto de giro de cada pieza. Solo cuentas, sin reloj ni dibujo:
// quien pinta pasa el tiempo. Las piezas que la criatura no tiene (orejas móviles, cola) simplemente no se usan.
// Movilidad MÍNIMA (docs/pets/arte.md): giros pequeños y lentos, para que las juntas no se abran y no parezca una marioneta.
'use strict';
PT.gestos = (() => {
  const ola = (t, hz) => Math.sin(2 * Math.PI * hz * t);
  // el gesto → sus giros en el instante t. Cada uno es un bucle (se repite solo)
  const GESTOS = {
    quieto: t => ({ cabeza: 1.5 * ola(t, 0.2), 'oreja-izq': -2 * ola(t, 0.4), 'oreja-der': 2 * ola(t, 0.4), cola: 4 * ola(t, 0.5) }),
    mirar: t => ({ cabeza: 5 * ola(t, 0.25), 'oreja-izq': 3 * ola(t, 0.25), 'oreja-der': 3 * ola(t, 0.25) }),
    // el brazo derecho se abre un poco y saluda; la cabeza se ladea hacia él
    saludo: t => ({ 'brazo-der': -28 + 10 * ola(t, 1.2), cabeza: 3, cola: 5 * ola(t, 1.2) }),
    // las orejas se abren y se cierran y luego se mecen juntas
    orejas: t => {
      const a = 9 * ola(t, 0.7), juntas = (t % 2.8) > 1.4;
      return { 'oreja-izq': juntas ? a : -a, 'oreja-der': a };
    },
    baile: t => ({ cabeza: 4 * ola(t, 0.9), 'brazo-izq': 12 * ola(t, 0.9), 'brazo-der': 12 * ola(t, 0.9), 'pierna-izq': 3 * ola(t, 1.8),
      'pierna-der': -3 * ola(t, 1.8), cola: 8 * ola(t, 1.8), 'oreja-izq': -5 * ola(t, 0.9), 'oreja-der': -5 * ola(t, 0.9) }),
  };
  const lista = () => Object.keys(GESTOS);
  // PT.ok({ pieza: grados }) o PT.error('gesto-desconocido', { gesto })
  function giros(gesto, t) {
    const g = GESTOS[gesto];
    return g ? PT.ok(g(t)) : PT.error('gesto-desconocido', { gesto });
  }
  return { lista, giros };
})();
