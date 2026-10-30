// Fans Of Taxi · ADAPTADOR de las cintas a three.js: convierte las listas de triángulos de CINTAS (datos puros) en mallas.
//
// Es la única pieza que sabe de three.js en el camino de las carreteras: el dominio (js/cintas/) no conoce la pantalla, y esta capa no
// sabe cómo se calcula una curva. Así se puede cambiar el dibujo (otro motor, exportar a .glb) sin tocar la geometría.
'use strict';
const CINTAS_MALLA = (() => {
  // cada capa con su material: la calzada gana al suelo pintado (que queda unos centímetros debajo) sin parpadeos;
  // el túnel brilla un poco por dentro porque no le llega la luz del sol
  const MATERIALES = {
    calzada: { polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 },
    muros: {},
    tunel: { emissive: 0x2a2440 },
  };

  // los colores del dominio están en sRGB (como en un editor de imágenes); three.js trabaja en lineal y los convierte al pintar
  const lineal = c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

  function malla(T, lista, opciones) {
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.BufferAttribute(new Float32Array(lista.posiciones), 3));
    geo.setAttribute('color', new T.BufferAttribute(Float32Array.from(lista.colores, lineal), 3));
    geo.computeVertexNormals();
    const material = new T.MeshLambertMaterial({ vertexColors: true, side: T.DoubleSide, ...opciones });
    return new T.Mesh(geo, material);
  }

  // las mallas de las carreteras de un trozo (solo las capas que tienen algo)
  function deTrozo(T, trozo) {
    const listas = CINTAS.trozo.construir(trozo), mallas = [];
    for (const capa of Object.keys(MATERIALES)) {
      if (listas[capa].vacia) continue;
      const m = malla(T, listas[capa], MATERIALES[capa]);
      if (capa === 'tunel') m.userData.tubo = 1;   // estado() cuenta los trozos con túnel
      mallas.push(m);
    }
    return mallas;
  }

  return { deTrozo };
})();
