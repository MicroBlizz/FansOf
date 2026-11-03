// Fans Of Pets · MUÑECO: las POSES del muñeco kawaii por código (docs/pets/animacion-2d.md, «muñeco por código»). Cada acción (comer,
// ducharse, dormir en el puff…), cada gesto pequeño (mirar, saludar) y cada emoción (contento, triste…) dice, en el instante t, dónde
// están las manos y los pies, cuánto se aplasta o salta el cuerpo, cómo va la cabeza, qué cara pone y qué objetos y efectos salen.
// Solo cuentas, sin dibujo ni reloj: quien pinta pasa el tiempo. Unidades: las del muñeco (muneco.js), con los pies en y = 0 y hacia
// arriba en negativo; la boca queda en (0, -233), los hombros en (±70, -170).
'use strict';
PT.munecoPoses = (() => {
  const ola = (t, hz) => Math.sin(2 * Math.PI * hz * t);
  const fase = (t, dura) => (t % dura) / dura;   // de 0 a 1 en cada vuelta
  const mezcla = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  const suave = f => f * f * (3 - 2 * f);
  // ida y vuelta suave: 0 → 1 → 0 en la vuelta
  const vaivenAt = f => suave(f < 0.5 ? f * 2 : 2 - f * 2);
  const BOCA = [0, -233];
  const REPOSO = { i: [-118, -78], d: [118, -78] };
  const PIES = { i: [-52, -14], d: [52, -14] };
  const SENTADO = { i: [-66, -40], d: [66, -40] };   // los pies hacia delante, al estar sentada
  // parpadea un momento cada 3,2 s (los ojos que se pidan, si no)
  const parpadeo = (t, ojos = 'base') => ((t % 3.2) < 0.12 ? 'cerrados' : ojos);

  // la pose de partida: de pie, respirando, con las manos abajo
  function base(t) {
    return { salto: 0, aplasta: 0.025 * ola(t, 0.5), sentada: 0, giro: 0, baja: 0, mira: 0, manos: { ...REPOSO }, pies: { ...PIES },
      ojos: parpadeo(t), boca: 'base', cejas: '', orejas: 0, objetos: [], efectos: [] };
  }
  // sentada (en el puff o en el orinal): el cuerpo sube a la altura del asiento y los pies van hacia delante
  const sienta = (p, alto) => Object.assign(p, { sentada: alto, pies: { ...SENTADO }, aplasta: p.aplasta * 0.6 });

  const GESTOS = {
    quieto: t => base(t),
    mirar: t => Object.assign(base(t), { mira: ola(t, 0.3) }),
    saludo: t => Object.assign(base(t), { giro: 0.06, manos: { i: REPOSO.i, d: [150 + 16 * ola(t, 2), -300] }, boca: 'sonrisa' }),
  };

  const EMOCIONES = {
    // contenta: da saltitos, aplastándose al caer y estirándose al subir, con los ojos de alegría
    contento(t) {
      const f = fase(t, 1.1), arriba = Math.max(0, Math.sin(f * Math.PI * 2)), cae = Math.max(0, -Math.sin(f * Math.PI * 2));
      return Object.assign(base(t), { salto: 70 * arriba, aplasta: -0.08 * arriba + 0.1 * cae, ojos: 'feliz', boca: 'abierta',
        manos: { i: mezcla(REPOSO.i, [-150, -250], arriba), d: mezcla(REPOSO.d, [150, -250], arriba) }, orejas: -0.3 * arriba });
    },
    triste: t => Object.assign(base(t), { baja: 1, giro: 0.04 * ola(t, 0.2), ojos: 'triste', boca: 'triste', orejas: 1,
      manos: { i: [-60, -70], d: [60, -70] }, aplasta: 0.015 * ola(t, 0.3), efectos: [{ tipo: 'lagrima', f: fase(t, 1.6) }] }),
    enfado: t => Object.assign(base(t), { ojos: 'enfado', boca: 'enfado', cejas: 'enfado', aplasta: 0.04 * Math.abs(ola(t, 1.5)),
      manos: { i: [-128, -110 + 8 * ola(t, 3)], d: [128, -110 - 8 * ola(t, 3)] }, efectos: [{ tipo: 'humo', f: fase(t, 1.2) }] }),
    sorpresa(t) {
      const f = Math.min(1, (t % 2.4) / 0.25), salto = 30 * Math.sin(f * Math.PI);
      return Object.assign(base(t), { salto, ojos: 'sorpresa', boca: 'o', orejas: -0.15, manos: { i: [-140, -280], d: [140, -280] },
        efectos: [{ tipo: 'brillo', f: fase(t, 2.4) }] });
    },
    sueno: t => Object.assign(base(t), { ojos: (t % 4) < 2.5 ? 'sueno' : 'cerrados', boca: (t % 4) > 2.6 && (t % 4) < 3.6 ? 'bostezo' : 'base',
      baja: 0.4, orejas: 0.5, aplasta: 0.035 * ola(t, 0.25) }),
  };

  const ACCIONES = {
    // come de un bol que sujeta con la izquierda: la cuchara va del bol a la boca, mastica contenta y vuelve
    comer(t) {
      const f = fase(t, 2.2), lleva = vaivenAt(Math.min(1, f / 0.7)), bol = [-30, -150];
      const cuchara = mezcla([10, -160], [14, -238], lleva);
      return Object.assign(base(t), { manos: { i: bol, d: cuchara }, baja: 0.3 * (1 - lleva), ojos: f > 0.35 && f < 0.75 ? 'feliz' : parpadeo(t),
        boca: f > 0.3 && f < 0.9 ? 'masca' : 'abierta', objetos: [{ tipo: 'bol', x: bol[0], y: bol[1] + 16 }, { tipo: 'cuchara', x: cuchara[0], y: cuchara[1], lleno: f < 0.35 }] });
    },
    // bebe de una taza con las dos manos: la sube, bebe con los ojos cerrados y la baja
    beber(t) {
      const f = fase(t, 2.6), sube = suave(Math.min(1, f / 0.25)) * (1 - suave(Math.max(0, (f - 0.75) / 0.25)));
      const taza = mezcla([0, -150], [0, -228], sube);
      return Object.assign(base(t), { manos: { i: [taza[0] - 44, taza[1] + 6], d: [taza[0] + 44, taza[1] + 6] }, giro: 0, baja: -0.5 * sube,
        ojos: sube > 0.8 ? 'cerrados' : parpadeo(t), boca: sube > 0.6 ? 'oculta' : 'base', objetos: [{ tipo: 'taza', x: taza[0], y: taza[1], inclina: 0.5 * sube }] });
    },
    // la ducha: cae el agua de la alcachofa y se frota la cabeza con las dos manos, con espuma
    banar: t => Object.assign(base(t), { manos: { i: [-150 + 12 * ola(t, 2), -320 + 10 * ola(t, 4)], d: [150 - 12 * ola(t, 2), -320 - 10 * ola(t, 4)] },
      ojos: 'cerrados', boca: 'sonrisa', orejas: 0.6, objetos: [{ tipo: 'alcachofa', x: 80, y: -600 }],
      efectos: [{ tipo: 'lluvia', f: fase(t, 0.6) }, { tipo: 'espuma', f: fase(t, 1.5) }] }),
    // los dientes: el cepillo va de lado a lado delante de la boca, con espuma
    dientes: t => Object.assign(base(t), { manos: { i: REPOSO.i, d: [40 + 22 * ola(t, 2.5), -228] }, boca: 'dientes', ojos: parpadeo(t, 'base'),
      objetos: [{ tipo: 'cepillo', x: 4 + 22 * ola(t, 2.5), y: -233 }], efectos: [{ tipo: 'burbujas', f: fase(t, 1.2) }] }),
    // la cara: se frota las mejillas con las manos y salpica agua, con los ojos apretados
    cara: t => Object.assign(base(t), { manos: { i: [-100, -230 + 14 * ola(t, 2)], d: [100, -230 - 14 * ola(t, 2)] }, ojos: 'apretados', boca: 'base',
      efectos: [{ tipo: 'salpica', f: fase(t, 0.8) }] }),
    // el baño: sentada en el orinal, primero concentrada y luego aliviada
    bano(t) {
      const f = fase(t, 3), alivio = f > 0.6;
      return Object.assign(sienta(base(t), 56), { manos: { i: [-70, -70], d: [70, -70] }, ojos: alivio ? 'feliz' : 'apretados', boca: alivio ? 'sonrisa' : 'apretada',
        aplasta: alivio ? 0.02 * ola(t, 0.5) : 0.03 * Math.abs(ola(t, 3)), objetos: [{ tipo: 'orinal', x: 0, y: 0 }], efectos: alivio ? [{ tipo: 'brillo', f: (f - 0.6) / 0.4 }] : [] });
    },
    // dormir en el puff: sentada y hundida, la cabeza ladeada, respira despacio y salen zetas
    dormir: t => Object.assign(sienta(base(t), 70), { giro: 0.16, baja: 0.5, ojos: 'cerrados', boca: (t % 4) < 2 ? 'o' : 'base', orejas: 0.8,
      manos: { i: [-80, -84], d: [80, -84] }, aplasta: 0.04 * ola(t, 0.22), objetos: [{ tipo: 'puff', x: 0, y: 0 }], efectos: [{ tipo: 'zetas', f: fase(t, 2.5) }] }),
    // jugar con la tableta: sentada en el puff, la sujeta con las dos manos, mira abajo y toca la pantalla de vez en cuando
    tablet(t) {
      const toca = (t % 1.4) < 0.25;
      return Object.assign(sienta(base(t), 70), { baja: 0.9, mira: 0.15 * ola(t, 0.2), manos: { i: [-80, -118], d: toca ? [12, -132] : [80, -118] },
        ojos: parpadeo(t, 'abajo'), boca: toca ? 'abierta' : 'sonrisa', objetos: [{ tipo: 'puff', x: 0, y: 0 }, { tipo: 'tableta', x: 0, y: -118, toca }] });
    },
  };

  const TODAS = { ...GESTOS, ...EMOCIONES, ...ACCIONES };
  const lista = () => ({ gestos: Object.keys(GESTOS), emociones: Object.keys(EMOCIONES), acciones: Object.keys(ACCIONES) });
  // PT.ok(pose) o PT.error('pose-desconocida', { nombre })
  function pose(nombre, t) {
    const f = TODAS[nombre];
    return f ? PT.ok(f(Math.max(0, t))) : PT.error('pose-desconocida', { nombre });
  }
  return { pose, lista, BOCA };
})();
