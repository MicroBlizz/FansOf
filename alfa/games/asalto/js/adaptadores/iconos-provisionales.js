// Fans of Asalto · ADAPTADORES · Los iconos provisionales de los objetos de la tienda que aún no tienen su PNG (los de Yoshi llegarán
// después): un pixel art sencillo dibujado por código, del tamaño de los de verdad. La forma y el color dicen la rareza (común: losa
// de madera clara; raro: rombo azul; épico: escudo naranja), con contorno grueso y la inicial del objeto en grande. En cuanto el PNG
// existe (sprites-datos.js lo lista), dibujos.js usa el de verdad y este deja de salir. La inicial es la del nombre en el idioma de ahora:
// cada idioma guarda sus propios dibujos.
'use strict';
AS.iconosProvisionales = (() => {
  const W = 32, H = 30, TINTA = '#22140e', CREMA = '#fff3d6';
  // por rareza: el relleno y los puntos de su silueta (en una rejilla de 32 x 30)
  const FORMA = [
    { col: '#c8a878', puntos: [[3, 3], [29, 3], [29, 27], [3, 27]] },
    { col: '#3f8ae8', puntos: [[16, 1], [31, 15], [16, 29], [1, 15]] },
    { col: '#f08a2a', puntos: [[3, 2], [29, 2], [29, 16], [16, 29], [3, 16]] },
  ];
  const hechos = {};   // por idioma y nombre
  const objetoDe = nombre => (nombre.startsWith('objeto-') ? ASALTO.objetos[nombre.slice(7)] || null : null);

  function silueta(g, f) {
    g.beginPath();
    f.puntos.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.closePath();
    g.fillStyle = f.col; g.fill();
    g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
  }
  function inicial(g, d) {
    const letra = tr(d.nombre).charAt(0).toUpperCase();
    g.font = 'bold 17px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = 4; g.strokeStyle = TINTA; g.strokeText(letra, W / 2, H / 2 + 1);
    g.fillStyle = CREMA; g.fillText(letra, W / 2, H / 2 + 1);
  }
  // sin medias tintas: cada píxel se queda entero o se borra, para que parezca pixel art
  function aPixeles(g) {
    const im = g.getImageData(0, 0, W, H), p = im.data;
    for (let i = 3; i < p.length; i += 4) p[i] = p[i] >= 128 ? 255 : 0;
    g.putImageData(im, 0, 0);
  }
  function dibuja(d) {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    silueta(g, FORMA[d.rareza] || FORMA[0]);
    inicial(g, d);
    aPixeles(g);
    return c;
  }
  // el lienzo del icono provisional, o null si el nombre no es de un objeto de la tienda
  const idioma = () => (typeof IDIOMA !== 'undefined' && IDIOMA.actual) || 'es';
  const hecho = nombre => hechos[idioma() + '|' + nombre];
  function imagen(nombre) {
    const clave = idioma() + '|' + nombre;
    if (!(clave in hechos)) { const d = objetoDe(nombre); hechos[clave] = d ? { c: dibuja(d), url: null } : null; }
    return hechos[clave] ? hechos[clave].c : null;
  }
  // lo mismo como dirección de imagen, para las ventanas (HTML)
  function url(nombre) {
    if (!imagen(nombre)) return null;
    const h = hecho(nombre);
    if (!h.url) h.url = h.c.toDataURL();
    return h.url;
  }
  return { imagen, url };
})();
