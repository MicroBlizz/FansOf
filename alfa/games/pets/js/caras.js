// Fans Of Pets · CARAS: las piezas de la cara viva (docs/pets/arte.md, «cara viva por despiece»). Las criaturas dibujadas sobre las plantillas
// van con la CARA VACÍA y arte.js les pone encima dos piezas: la boca y, sobre ella, los ojos. Las piezas de cada MOLDE de edad (bebé,
// niño, adulto) valen para toda criatura de ese molde: ojos cerrados, de cachorrito o tristes; boca base, bostezo, masticando o triste.
// Las PROPIAS son las de una criatura concreta (su ojo especial, la sonrisa de su personalidad) y mandan sobre las del molde.
// Cada ficha es el recuadro de la pieza en unidades del marco de la cara (anclas.marco: [x, y, ancho, alto] desde el punto medio
// entre los ojos, en distancias entre ojos), que es lo que imprime herramientas/pets/piezas.py. Los archivos están en img/caras/.
'use strict';
PT.caras = (() => {
  // molde → zona → nombre → ficha; archivo img/caras/<molde>-<zona>-<nombre>.webp
  const MOLDE = {
    bebe: {
      ojos: { base: [-0.7657, -0.2724, 1.5329, 0.569], cerrados: [-0.7541, -0.2086, 1.4864, 0.2439], bostezo: [-0.7657, -0.5511, 1.498, 0.5226], cachorrito: [-0.818, -0.6092, 1.62, 0.9522], triste: [-0.8006, -0.5511, 1.5619, 0.7606] },
      boca: { base: [-0.1851, 0.163, 0.3774, 0.1742], bostezo: [-0.487, 0.1456, 1.051, 0.9813], masca: [-0.3419, 0.2095, 0.6329, 0.4993], triste: [-0.2199, 0.1921, 0.4181, 0.2206] },
    },
    nino: {
      ojos: { base: [-0.736, -0.244, 1.477, 0.4847], cerrados: [-0.8044, -0.2041, 1.5055, 0.2851], bostezo: [-0.7873, -0.3181, 1.4599, 0.3193], cachorrito: [-0.8329, -0.6203, 1.5853, 0.8611], triste: [-0.8215, -0.4892, 1.5169, 0.7299] },
      boca: { base: [-0.1943, 0.1666, 0.3136, 0.1597], bostezo: [-0.3881, 0.064, 0.7014, 0.633], masca: [-0.3482, 0.2179, 0.6387, 0.4562], triste: [-0.2741, 0.2693, 0.4676, 0.2224] },
    },
    adulto: {
      ojos: { base: [-0.7744, -0.2795, 1.5364, 0.5762], cerrados: [-0.7812, -0.1492, 1.5364, 0.2538], bostezo: [-0.7675, -0.2178, 1.5159, 0.3087], cachorrito: [-0.8361, -0.5607, 1.653, 0.878], triste: [-0.8224, -0.4922, 1.605, 0.7682] },
      boca: { base: [-0.1845, 0.2486, 0.3704, 0.1509], bostezo: [-0.3285, 0.0634, 0.6722, 0.679], masca: [-0.3148, 0.0634, 0.6379, 0.6448], triste: [-0.2051, 0.2486, 0.4253, 0.1921] },
    },
  };

  // criatura → etapa (bebe, nino, adolescente, adulto; las jefas usan adulto) → zona → nombre → ficha; archivo img/caras/<id>-<etapa>-<zona>-<nombre>.webp
  const PROPIAS = {
    'animales:bunny': {
      bebe: { ojos: { base: [-0.8064, -0.2724, 1.5735, 0.5574] }, boca: { base: [-0.1851, 0.163, 0.3774, 0.1742] } },
      nino: { ojos: { base: [-0.8635, -0.3245, 1.7016, 0.6708] }, boca: { base: [-0.5599, 0.2615, 1.1156, 0.7414] } },
      adolescente: { ojos: { base: [-0.8499, -0.3262, 1.7063, 0.6951] }, boca: { base: [-0.5497, 0.3057, 1.1138, 0.6004] } },
      adulto: { ojos: { base: [-0.842, -0.3183, 1.6984, 0.6872] }, boca: { base: [-0.5497, 0.2978, 1.1138, 0.6083] } },
    },
  };

  const moldeDe = etapa => (etapa === 'bebe' || etapa === 'nino' ? etapa : 'adulto');
  const etapaDe = etapa => (etapa === 'jefe' ? 'adulto' : etapa);
  // la pieza de esa zona con ese nombre para esa criatura y etapa: { ruta, c } o null si no existe
  function pieza(id, etapa, zona, nombre) {
    const ep = etapaDe(etapa), propia = PROPIAS[id] && PROPIAS[id][ep] && PROPIAS[id][ep][zona] && PROPIAS[id][ep][zona][nombre];
    if (propia) return { ruta: `img/caras/${id.replace(':', '-')}-${ep}-${zona}-${nombre}.webp`, c: propia };
    const m = moldeDe(etapa), del = MOLDE[m][zona][nombre];
    return del ? { ruta: `img/caras/${m}-${zona}-${nombre}.webp`, c: del } : null;
  }
  // qué ojos y qué boca lleva la cara: cara, la del animador ('' | parpadeo | bostezo | masca | cachorrito | triste); e: { dormida, triste }
  function eleccion(cara, e) {
    const cerrados = cara === 'parpadeo' || cara === 'bostezo' || !!e.dormida, triste = cara === 'triste' || !!e.triste;
    return {
      ojos: cerrados ? 'cerrados' : cara === 'cachorrito' ? 'cachorrito' : triste ? 'triste' : 'base',
      boca: cara === 'bostezo' ? 'bostezo' : cara === 'masca' ? 'masca' : triste ? 'triste' : 'base',
    };
  }
  return { pieza, eleccion, moldeDe, etapaDe };
})();
