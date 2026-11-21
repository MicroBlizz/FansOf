// Fans of Auto · EL ARTE (3): los coches en LONCHAS. Cada coche se parte en dibujos apilados (suelo, chapa, cristales, techo) que
// salen solos de su foto vista desde arriba: a cada píxel se le da una altura según la parte del coche que es. Al pintar, cada
// loncha se aleja del centro de la pantalla según lo alta que esté, igual que los tejados de los edificios, y así el coche enseña
// el lateral. Vistas desde justo encima, las lonchas dan exactamente la foto de siempre.
'use strict';

const ALTO_LONCHA = 0.1;        // lo que sube cada loncha, en plantas de edificio (un turismo mide media planta)
const CRISTAL_LONCHA = [38, 49, 64];
const LONCHAS = new Map();      // foto del coche -> sus lonchas

// la altura (en lonchas) del píxel (x, y) de un coche de medidas D (las de COCHES), con el morro hacia la derecha
function alturaCoche(D, x, y) {
  const L = D.l, A = D.a, xPar = L - D.capo - 2, xLun = D.cola + 1;
  if (x < 1 || x > L - 2 || y < 1 || y > A - 2) return 1;                       // el borde: bajos, ruedas, faros y pilotos
  if (D.caja && x >= 2 && x <= xPar - 2) return 7;                              // la caja de furgonetas y camiones
  const cabina = D.caja ? x >= xPar - 1 && x <= xPar + 1 : x >= xLun && x <= xPar + 1;
  return cabina && y >= 2 && y <= A - 3 ? 5 : 3;                                // cabina con techo, o capó y maletero
}
// el color de un píxel en una loncha que no es su tapa: cristal en la cabina de los turismos, la chapa más oscura en lo demás
function colorLateral(D, capa, altura, r, g, b) {
  if (!D.caja && altura === 5 && capa === 4) return CRISTAL_LONCHA;
  return [r * 0.72 | 0, g * 0.72 | 0, b * 0.72 | 0];
}
// las lonchas de una foto de coche (de abajo arriba), hechas una vez y guardadas
function lonchasCoche(foto, tipo) {
  if (LONCHAS.has(foto)) return LONCHAS.get(foto);
  const D = COCHES[tipo], W = foto.width, H = foto.height, px = foto.getContext('2d').getImageData(0, 0, W, H).data, capas = [];
  for (let capa = 1; capa <= 7; capa++) {
    const [c, g] = lienzoNuevo(W, H), img = g.createImageData(W, H); let hay = false;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4, alt = alturaCoche(D, x, y);
      if (px[i + 3] === 0 || alt < capa) continue;
      const col = alt === capa ? [px[i], px[i + 1], px[i + 2]] : colorLateral(D, capa, alt, px[i], px[i + 1], px[i + 2]);
      img.data[i] = col[0]; img.data[i + 1] = col[1]; img.data[i + 2] = col[2]; img.data[i + 3] = px[i + 3]; hay = true;
    }
    if (!hay) break;
    g.putImageData(img, 0, 0); capas.push(c);
  }
  LONCHAS.set(foto, capas);
  return capas;
}
