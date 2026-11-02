// Fans Of Pets · ANCLAS: dónde está la cara en cada plantilla lisa (docs/pets/arte.md), medido una vez sobre el monigote y válido para
// toda criatura dibujada encima (el editor conserva la pose). Son datos, en fracciones del dibujo: los dos ojos (centro x, y y radios
// rx, ry) y la boca (x, y). Con ellos arte.js coloca las piezas de la cara viva (caras.js: ojos y boca) por el marco de la cara.
// Una plantilla que no está aquí (los ojos cerrados de dientes y cara, dormir) no tiene cara viva. La pose base de niña, adolescente y
// adulta es la de su personalidad (una por rama, sobre el molde de adulta las dos últimas); las jefas van sobre el monigote liso de adulta.
// ENCUADRE dice cómo recortar.py (modo molde) encajó cada plantilla en el lienzo de 640 (escala y desplazamiento, en fracciones):
// las anclas se miden sobre el dibujo de Yoshi y de() las devuelve ya en el lienzo.
'use strict';
PT.anclas = (() => {
  const ENCUADRE = {
    'bebe-base': [0.8279, 0.0852, 0.0778], 'bebe-comer': [0.8279, 0.0852, 0.0778], 'bebe-beber': [0.8279, 0.0852, 0.0778],
    'bebe-bano': [0.84, 0.0755, 0.0776], 'bebe-ducha': [0.7296, 0.1359, 0.1746],
    'nino-liso': [0.8589, 0.0479, 0.0681], 'nino-base-loco': [0.8579, 0.0472, 0.0691], 'nino-comer': [0.8589, 0.0479, 0.0681], 'nino-beber': [0.8589, 0.0479, 0.0681],
    'nino-bano': [0.8309, 0.0732, 0.0855], 'nino-ducha': [0.7602, 0.1258, 0.1616],
    'adulto-liso': [0.859, 0.068, 0.0689], 'adulto-base-loco': [0.8601, 0.0678, 0.0687], 'adulto-comer': [0.859, 0.0684, 0.0689],
    'adulto-beber': [0.859, 0.0684, 0.0689], 'adulto-bano': [0.831, 0.0727, 0.0862], 'adulto-ducha': [0.7329, 0.1278, 0.1872],
  };
  const T = {
    'bebe-base': [[0.344, 0.5, 0.076, 0.078], [0.669, 0.497, 0.076, 0.076], [0.506, 0.664]],
    'bebe-comer': [[0.37, 0.42, 0.062, 0.062], [0.65, 0.42, 0.062, 0.062], [0.5, 0.53]],
    'bebe-beber': [[0.357, 0.426, 0.07, 0.069], [0.652, 0.421, 0.069, 0.069], [0.504, 0.571]],
    'bebe-bano': [[0.376, 0.402, 0.051, 0.059], [0.594, 0.408, 0.057, 0.059], [0.485, 0.531]],
    'bebe-ducha': [[0.396, 0.531, 0.049, 0.052], [0.616, 0.533, 0.051, 0.053], [0.506, 0.645]],
    'nino-liso': [[0.367, 0.457, 0.065, 0.066], [0.686, 0.457, 0.066, 0.066], [0.526, 0.596]],
    'nino-base-concentrado': [[0.378, 0.388, 0.057, 0.06], [0.626, 0.383, 0.061, 0.062], [0.502, 0.517]],
    'nino-base-loco': [[0.383, 0.402, 0.047, 0.048], [0.641, 0.402, 0.047, 0.048], [0.512, 0.504]],
    'nino-base-carinoso': [[0.38, 0.434, 0.055, 0.059], [0.625, 0.401, 0.057, 0.057], [0.502, 0.557]],
    'nino-base-gamberro': [[0.384, 0.376, 0.059, 0.059], [0.616, 0.37, 0.061, 0.06], [0.5, 0.501]],
    'nino-base-dormilon': [[0.379, 0.427, 0.061, 0.055], [0.616, 0.4, 0.066, 0.04], [0.498, 0.542]],
    'nino-comer': [[0.365, 0.387, 0.052, 0.056], [0.642, 0.391, 0.056, 0.057], [0.504, 0.511]],
    'nino-beber': [[0.37, 0.393, 0.052, 0.055], [0.635, 0.393, 0.055, 0.055], [0.502, 0.508]],
    'nino-bano': [[0.378, 0.353, 0.039, 0.048], [0.569, 0.361, 0.048, 0.051], [0.474, 0.467]],
    'nino-ducha': [[0.384, 0.491, 0.048, 0.048], [0.624, 0.493, 0.048, 0.048], [0.504, 0.595]],
    'adulto-liso': [[0.372, 0.424, 0.062, 0.062], [0.637, 0.415, 0.059, 0.061], [0.504, 0.556]],
    'adulto-base-concentrado': [[0.379, 0.417, 0.059, 0.062], [0.624, 0.402, 0.059, 0.061], [0.502, 0.548]],
    'adulto-base-loco': [[0.385, 0.4, 0.047, 0.053], [0.615, 0.397, 0.049, 0.053], [0.5, 0.512]],
    'adulto-base-carinoso': [[0.379, 0.422, 0.056, 0.06], [0.612, 0.382, 0.057, 0.059], [0.496, 0.548]],
    'adulto-base-gamberro': [[0.382, 0.415, 0.059, 0.059], [0.624, 0.393, 0.059, 0.057], [0.503, 0.538]],
    'adulto-base-dormilon': [[0.378, 0.424, 0.06, 0.055], [0.591, 0.387, 0.07, 0.043], [0.484, 0.539]],
    'adulto-comer': [[0.374, 0.417, 0.061, 0.062], [0.637, 0.414, 0.059, 0.06], [0.506, 0.548]],
    'adulto-beber': [[0.372, 0.415, 0.06, 0.061], [0.633, 0.409, 0.057, 0.06], [0.502, 0.544]],
    'adulto-bano': [[0.382, 0.354, 0.043, 0.049], [0.566, 0.358, 0.048, 0.051], [0.474, 0.465]],
    'adulto-ducha': [[0.372, 0.424, 0.062, 0.062], [0.635, 0.417, 0.057, 0.06], [0.504, 0.556]],
  };
  // qué plantilla lleva esa etapa y pose (la base de niña y adulta, por personalidad; sin personalidad, nada: no está sobre molde)
  function plantilla(etapa, pose, personalidad) {
    if (!personalidad) return '';
    if (etapa === 'jefe') return 'adulto-liso';
    const e = etapa === 'adolescente' ? 'adulto' : etapa;
    return pose === 'base' && e !== 'bebe' ? `${e}-base-${personalidad}` : `${e}-${pose}`;
  }
  // las anclas de esa pose, en fracciones del lienzo del juego: { ojos: [[x, y, rx, ry], [...]], boca: [x, y], cara: [x, y, w, h]
  // (el recuadro de los recortes) }; null si no hay. Sin encuadre apuntado, las devuelve en fracciones del dibujo de Yoshi
  function de(etapa, pose, personalidad) { return dePlantilla(plantilla(etapa, pose, personalidad)); }
  // las anclas de una plantilla por su clave (lo mismo, para las herramientas que trabajan plantilla a plantilla)
  function dePlantilla(clave) {
    const t = T[clave];
    if (!t) return null;
    const [s, ox, oy] = ENCUADRE[clave] || [1, 0, 0], px = x => x * s + ox, py = y => y * s + oy;
    const [i, d] = t.slice(0, 2).map(([x, y, rx, ry]) => [px(x), py(y), rx * s, ry * s]), boca = [px(t[2][0]), py(t[2][1])];
    const ry = Math.max(i[3], d[3]);
    const x0 = i[0] - i[2] * 2, x1 = d[0] + d[2] * 2, y0 = Math.min(i[1], d[1]) - ry * 1.6, y1 = boca[1] + ry * 2;
    return { ojos: [i, d], boca, cara: [x0, y0, x1 - x0, y1 - y0] };
  }
  // el marco de la cara: el punto medio entre los ojos y la distancia entre ellos (fracciones del lienzo). Las piezas de la cara (caras.js)
  // se fichan en unidades de este marco, así la misma pieza vale en cualquier plantilla, en la que se coloca por el marco de esa
  const marco = A => { const [i, d] = A.ojos; return [(i[0] + d[0]) / 2, (i[1] + d[1]) / 2, Math.hypot(d[0] - i[0], d[1] - i[1])]; };
  return { de, dePlantilla, marco, plantilla, plantillas: () => Object.keys(T) };
})();
