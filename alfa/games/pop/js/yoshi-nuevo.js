// Fans of Pop · lo nuevo de Yoshi tras el flag 'pop-recursos-yoshi' (Pepins, 28-11-2026): caminos y plataformas de 7 mundos (tarea 324),
// la Pesadilla del Jardín pintada (425), bichos sin cara (426), un sonido de combo por dibujo del letrero (428) y la música del mapa (429).
// Con el flag cerrado no se baja nada y todo se ve y suena como antes. Con él abierto, sus dibujos y sonidos se piden la primera vez
// (sin esperar en la splash) y cada pieza usa lo suyo en cuanto llega. Quien lo usa: js/mapa.js, js/pintar.js y js/sonidos.js.
'use strict';
const PP_YOSHI = (() => {
  const caminos = ['heladeria', 'feria', 'nubes', 'bosque', 'mar', 'sakura', 'espacio'];
  const bichos = ['mariposa', 'mariquita', 'hoja', 'dango', 'marcianito'];   // su versión sin cara: f-<bicho>-y.png
  // cuánto se aparta el centro de la cara de cada plataforma del centro de su imagen (fracción del lado mayor), medido en los PNG:
  // así el número del nivel cae en medio
  const cara = Object.freeze({
    'bosque-nivel': [-0.02, -0.061], 'bosque-vs': [-0.014, 0.039], 'espacio-nivel': [-0.041, -0.045], 'espacio-vs': [-0.002, 0.009],
    'feria-nivel': [-0.005, -0.057], 'feria-vs': [-0.02, -0.018], 'heladeria-nivel': [-0.02, -0.02], 'heladeria-vs': [-0.018, 0],
    'mar-nivel': [-0.014, -0.018], 'mar-vs': [-0.011, 0.023], 'nubes-nivel': [0.025, -0.059], 'nubes-vs': [0, 0.018],
    'sakura-nivel': [0.009, -0.016], 'sakura-vs': [-0.018, -0.034],
  });
  const imagenes = Object.freeze(['fondo-jardin-pesadilla', ...bichos.map(b => 'f-' + b + '-y'),
    ...caminos.flatMap(w => ['suelo', 'adorno-1', 'adorno-2', 'adorno-3', 'nivel', 'vs'].map(s => 'cm-' + w + '-' + s))]);
  const combos = Object.freeze(['gomita', 'nube', 'pegatina']);
  let pedido = false;
  const pide = () => {
    pedido = true;
    const v = typeof VERSION !== 'undefined' ? VERSION : '0';
    imagenes.forEach(k => ppCargaUna(k, 'img-liso/' + k + '.png?v=' + v, () => new Image()));
    combos.forEach(d => SONIDO_ARCHIVO.registra('combo-' + d, 'snd/combo-' + d + '.mp3?v=' + v));
  };
  // se pregunta en cada uso (nunca en una constante): abrirlo o cerrarlo en /gestion llega sin recargar
  const activo = () => {
    const si = NUCLEO.flag('pop-recursos-yoshi', 'Pop: caminos, Pesadilla, bichos, combo y música nuevos de Yoshi (tareas 324, 425, 426, 428, 429)', false);
    if (si && !pedido) pide();
    return si;
  };
  // el camino de un mundo por su fondo ('fondo-feria' → 'feria'), o null si no tiene
  const camino = fondo => { const w = String(fondo).replace('fondo-', ''); return caminos.includes(w) ? w : null; };
  // la clave del dibujo de un flotante: la versión sin cara si toca y ya llegó
  const flotante = (k, si, img) => (si && bichos.includes(k.slice(2)) && img[k + '-y'] ? k + '-y' : k);
  // los adornos del camino: 2 de cada 5 huecos, sin repetir el mismo seguido, a un lado y otro y de tamaños distintos
  const adorno = i => {
    if (i % 5 !== 1 && i % 5 !== 3) return null;
    return { n: 1 + (Math.floor(i / 5) * 2 + (i % 5 === 3 ? 1 : 0)) % 3, aparte: 170 + (i % 3) * 12, lado: 78 + (i * 7) % 20, gira: i % 2 === 1 };
  };
  return Object.freeze({ caminos, bichos, cara, imagenes, combos, activo, camino, flotante, adorno });
})();
