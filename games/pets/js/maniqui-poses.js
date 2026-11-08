// Fans Of Pets · MANIQUÍ 3D: las POSES (docs/pets/animacion-2d.md). Cada pose dice, en el instante t, cuánto gira cada hueso del maniquí
// (maniqui.js) desde su reposo, en radianes (x adelante/atrás, y a los lados, z de lado a lado), cuánto se estira (sy) o se mueve
// (px, py, pz), si los ojos van cerrados, a qué altura se sienta la criatura y qué objetos salen (bol, cuchara, cesta). El brazo 1 es el
// de la derecha de la pantalla. Solo cuentas, sin reloj ni dibujo: quien pinta pasa el tiempo.
'use strict';
PT.maniquiPoses = (() => {
  const ola = (t, hz) => Math.sin(2 * Math.PI * hz * t);
  const parpadea = t => (t % 3.2) < 0.14;   // un parpadeo cada 3,2 s
  const respira = (t, cuanto = 0.025, hz = 0.5) => ({ sy: 1 + cuanto * ola(t, hz) });
  const pose = (huesos, extra = {}) => ({ huesos, ojos: 'abiertos', sentado: 0, objetos: [], f: 0, ...extra });

  const POSES = {
    quieto: t => pose({ cuerpo: respira(t), cabeza: { z: 0.05 * ola(t, 0.25) }, 'oreja-1': { z: 0.08 * ola(t, 0.5) }, oreja1: { z: -0.08 * ola(t, 0.5) },
      cola: { z: 0.12 * ola(t, 0.4) } }, { ojos: parpadea(t) ? 'cerrados' : 'abiertos' }),
    // saluda con la mano de la derecha de la pantalla (brazo1); la cabeza se ladea un poco
    saludo: t => pose({ cuerpo: respira(t, 0.02, 0.8), cabeza: { z: -0.1, y: 0.12 }, brazo1: { z: 1.0 + 0.3 * ola(t, 1.6), x: -0.4 }, cola: { z: 0.2 * ola(t, 0.8) } },
      { ojos: parpadea(t) ? 'cerrados' : 'abiertos' }),
    // mira a un lado y al otro: el giro es pequeño, porque de lado el dibujo no enseña nada
    mirar: t => pose({ cabeza: { y: 0.16 * ola(t, 0.3), z: 0.05 * ola(t, 0.3) }, cola: { z: 0.12 * ola(t, 0.4) } }, { ojos: parpadea(t) ? 'cerrados' : 'abiertos' }),
    // come de un bol: lo sujeta el brazo de la izquierda de la pantalla y la cuchara, el de la derecha (brazo1); la cuchara va del bol a la boca (f de 0 a 1) y cierra los ojos al saborear
    comer(t) {
      const f = (Math.sin(t * 3.2) + 1) / 2;
      return pose({ cuerpo: respira(t, 0.015), cabeza: { x: 0.04 + 0.1 * f }, brazo1: { z: 0.1 - 0.25 * f, x: -1.15 - 0.45 * f }, 'brazo-1': { z: -0.5, x: -1.2 } },
        { f, objetos: ['bol', 'cuchara'], ojos: f > 0.8 ? 'cerrados' : 'abiertos' });
    },
    // los minijuegos de cuidado (docs/pets/cuidados-minijuegos.md): el jugador hace la acción y el muñeco solo reacciona, con los brazos colgando.
    // atiende: espera con la cabeza un poco adelantada; mastica: cabecea al ritmo de la masticación; frotado: se deja frotar, con la cabeza ladeada;
    // sacude: se sacude al acabar de ducharse (el giro de la cabeza se amortigua con el tiempo)
    atiende: t => pose({ cuerpo: respira(t), cabeza: { x: 0.1 + 0.02 * ola(t, 0.4), z: 0.04 * ola(t, 0.25) }, cola: { z: 0.14 * ola(t, 0.5) } },
      { ojos: parpadea(t) ? 'cerrados' : 'abiertos' }),
    mastica: t => pose({ cuerpo: respira(t, 0.03, 2.5), cabeza: { x: 0.05 + 0.07 * ola(t, 2.5), z: 0.03 * ola(t, 1.25) }, cola: { z: 0.25 * ola(t, 1.2) } }, { ojos: 'cerrados' }),
    frotado: t => pose({ cuerpo: { ...respira(t, 0.02, 0.8), z: 0.03 * ola(t, 1.5) }, cabeza: { z: 0.1 + 0.03 * ola(t, 1.5), x: 0.05 }, cola: { z: 0.2 * ola(t, 1.5) } }, { ojos: 'cerrados' }),
    sacude: t => pose({ cuerpo: { ...respira(t, 0.02, 0.8), z: 0.1 * ola(t, 6) * Math.exp(-t * 1.5) }, cabeza: { z: 0.25 * ola(t, 6) * Math.exp(-t * 1.5) },
      'oreja-1': { z: 0.3 * ola(t, 6) * Math.exp(-t) }, oreja1: { z: -0.3 * ola(t, 6) * Math.exp(-t) }, cola: { z: 0.4 * ola(t, 6) * Math.exp(-t * 1.5) } }),
    // duerme hundida en su cesta: asoma la cabeza ladeada y las manitas en el borde; sale una zeta (f de 0 a 1 en su vuelta)
    dormir: t => pose({ cuerpo: { x: 0.2, ...respira(t, 0.035, 0.22) }, cabeza: { z: 0.12 + 0.02 * ola(t, 0.22), x: -0.12 },
      'oreja-1': { z: 0.3 }, oreja1: { z: -0.3 }, 'pierna-1': { x: -1.5 }, pierna1: { x: -1.5 },
      brazo1: { x: -1.45, z: -0.35, pz: 0.3, py: 0.05 }, 'brazo-1': { x: -1.45, z: 0.35, pz: 0.3, py: 0.05 } },
    { sentado: 0.07, objetos: ['cesta'], f: (t % 2.5) / 2.5, ojos: 'cerrados' }),
  };
  // PT.ok(pose) o PT.error('pose-desconocida', { nombre })
  function de(nombre, t) {
    const f = Object.hasOwn(POSES, nombre) ? POSES[nombre] : null;
    return f ? PT.ok(f(Math.max(0, t))) : PT.error('pose-desconocida', { nombre });
  }
  return { de, lista: () => Object.keys(POSES) };
})();
