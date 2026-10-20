// Fans of Rouflage · MI ESCENARIO (datos): las salas vacías que se pueden tener (ESCENARIOS: el suelo y la pared de un mapa del juego) y los
// MUEBLES para decorarlas (los mismos dibujos que los muebles de los mapas, TIPOS_MUEBLE). Se añaden al armario como dos categorías más
// ('escenarios' y 'muebles', con `sala: true`: no se llevan puestas, se usan en MI ESCENARIO, escenario.js) y se consiguen como lo demás:
// al empezar (de: base), con Gotas (de: gotas, «N Gotas»), en el gachapón (de: tienda, comunes y raras), con Acciones (épicas y legendarias
// de la tienda, que también salen en el gachapón) o en el pase. Las BACKROOMS son la legendaria más cara (ESC_PRECIO_BACKROOMS Acciones).
// Va después de armario-precios.js (el precio de las Backrooms no lo pisa la rareza). El dibujo de las salas está en escenario-pinta.js.
'use strict';
const ESC_PRECIO_BACKROOMS = 1500;
// cada escenario: el suelo (SUELOS) y el papel de la pared (PAPELES) de su sala principal, como en su mapa; b y c, los de la segunda sala y
// los pasillos; la forma del mapa (FORMAS_ESC, escenario-formas.js) y el muro visto desde arriba y su canto
const ESCENARIOS = {
  oficina: { suelo: 'moqueta', pared: 'rayas', b: ['rombos', 'madera'], c: ['flechas', 'ventanas'], forma: 'oficina' },
  cafeteria: { suelo: 'damero', pared: 'azulejo', b: ['moqueta', 'rayas'], c: ['flechas', 'ventanas'], forma: 'oficina' },
  rrhh: { suelo: 'rombos', pared: 'madera', b: ['moqueta', 'rayas'], c: ['flechas', 'ventanas'], forma: 'oficina' },
  almacen: { suelo: 'hormigon', pared: 'chapa', b: ['placas', 'racks'], c: ['flechas', 'ventanas'], forma: 'nave' },
  parking: { suelo: 'asfalto', pared: 'hormigonP', b: ['aceite', 'hormigonP'], c: ['rampa', 'hormigonP'], forma: 'nave', muro: '#2b2d36', canto: '#595d6a' },
  terraza: { suelo: 'terraza', pared: 'fachada', b: ['acera', 'fachada'], c: ['cebra', 'fachada'], forma: 'jardin', muro: '#4a3a3a', canto: '#8a6a5a' },
  jardin: { suelo: 'cesped', pared: 'seto', b: ['flores', 'seto'], c: ['gravilla', 'seto'], forma: 'jardin', muro: '#2f5a2a', canto: '#4f8a3e' },
  caseta: { suelo: 'tablas', pared: 'valla', b: ['cesped', 'seto'], c: ['gravilla', 'valla'], forma: 'oficina', muro: '#2f5a2a', canto: '#4f8a3e' },
  nube: { suelo: 'placas', pared: 'racks', b: ['hormigon', 'chapa'], c: ['flechas', 'ventanas'], forma: 'oficina' },
  hotel: { suelo: 'moquetaHab', pared: 'rayasHotel', b: ['banoAzulejo', 'azulejo'], c: ['moquetaHotel', 'damasco'], forma: 'hotel', muro: '#3a1f24', canto: '#7a4a3a' },
  cloacas: { suelo: 'ladrilloSuelo', pared: 'ladrillo', b: ['rejilla', 'tuberias'], c: ['pasarela', 'ladrillo'], forma: 'laberinto', muro: '#2b2320', canto: '#5a3a30' },
  vestibulo: { suelo: 'marmol', pared: 'maderaNoble', b: ['alfombraRoja', 'maderaNoble'], c: ['moquetaHotel', 'damasco'], forma: 'hotel', muro: '#3a1f24', canto: '#7a4a3a' },
  cumple: { suelo: 'confeti', pared: 'banderines', b: ['moquetaBk', 'amarillo'], c: ['linoleo', 'amarillo'], forma: 'hotel', muro: '#3a2f10', canto: '#6b561e' },
  bombas: { suelo: 'rejilla', pared: 'tuberias', b: ['cables', 'tuberias'], c: ['pasarela', 'ladrillo'], forma: 'laberinto', muro: '#2b2320', canto: '#5a3a30' },
  archivo: { suelo: 'hexagonos', pared: 'piedra', b: ['moquetaGris', 'tabique'], c: ['flechas', 'ventanas'], forma: 'oficina' },
  backrooms: { suelo: 'moquetaBk', pared: 'amarillo', b: ['moquetaGris', 'tabique'], c: ['moquetaBk', 'amarillo'], forma: 'laberinto', muro: '#3a2f10', canto: '#6b561e', zumbido: true },
};
// cada mueble del armario: el tipo de TIPOS_MUEBLE con que se dibuja, cuántas variantes de color tiene (el botón COLOR) y su pestaña
// en la bandeja del editor (g: muebles, plantas o deco)
const MUEBLES_SALA = {};
const ESC_PLANTAS = ['planta', 'arbol', 'fuenteJardin', 'gnomo', 'farola'];
const ESC_DECO = ['caja', 'papelera', 'extintor', 'cono', 'fuente', 'bidon', 'maleta', 'cubo', 'pilar', 'maniqui', 'globos', 'flotador', 'vater', 'tarta', 'coche'];
(() => {
  const it = (id, n, r, de, txt, x) => ({ id, n, r, de, txt, x });
  const escenariosR = [
    ['oficina', 'La oficina', 'comun', 'base', 'Al empezar'], ['cafeteria', 'La cafetería', 'comun', 'base', 'Al empezar'],
    ['rrhh', 'Recursos Humanos', 'comun', 'gotas', '250 Gotas'], ['almacen', 'El almacén', 'comun', 'gotas', '250 Gotas'],
    ['parking', 'El parking', 'comun', 'gotas', '400 Gotas'], ['terraza', 'La terraza del bar', 'comun', 'tienda', 0],
    ['jardin', 'El jardín', 'rara', 'gotas', '600 Gotas'], ['caseta', 'La caseta del jardinero', 'rara', 'gratis', 'Pase gratis · nv 6'],
    ['nube', 'La Nube', 'rara', 'tienda', 0], ['hotel', 'Habitación de hotel', 'rara', 'tienda', 0], ['cloacas', 'Las cloacas', 'rara', 'tienda', 0],
    ['vestibulo', 'El vestíbulo del hotel', 'epica', 'tienda', 0], ['cumple', 'El cumpleaños', 'epica', 'tienda', 0],
    ['bombas', 'La sala de bombas', 'epica', 'premium', 'Pase premium · nv 20'], ['archivo', 'Juegos cerrados', 'epica', 'premium', 'Pase premium · nv 30'],
    ['backrooms', 'Las Backrooms', 'legend', 'tienda', ESC_PRECIO_BACKROOMS],
  ].map(([id, n, r, de, txt]) => it(id, n, r, de, txt, (c, w) => escenarioIcono(c, w, id)));
  // [id, nombre, rareza, de, txt, tipo de mueble, variantes]
  const mueblesR = [
    ['silla', 'Silla de oficina', 'comun', 'base', 'Al empezar', 'silla', 1], ['mesa', 'Mesa redonda', 'comun', 'base', 'Al empezar', 'mesa', 1],
    ['planta', 'Planta', 'comun', 'base', 'Al empezar', 'planta', 1], ['caja', 'Caja de cartón', 'comun', 'base', 'Al empezar', 'caja', 3],
    ['escritorio', 'Escritorio', 'comun', 'gotas', '150 Gotas', 'escritorio', 3], ['archivador', 'Archivador', 'comun', 'gotas', '100 Gotas', 'archivador', 1],
    ['estanteria', 'Estantería', 'comun', 'gotas', '200 Gotas', 'estanteria', 1], ['papelera', 'Papelera', 'comun', 'gotas', '40 Gotas', 'papelera', 1],
    ['extintor', 'Extintor', 'comun', 'gotas', '60 Gotas', 'extintor', 1], ['cono', 'Cono', 'comun', 'gotas', '40 Gotas', 'cono', 1],
    ['mesilla', 'Mesilla de noche', 'comun', 'gotas', '100 Gotas', 'mesilla', 1], ['fuente', 'Fuente de agua', 'comun', 'gotas', '150 Gotas', 'fuente', 1],
    ['farola', 'Farola', 'rara', 'gotas', '300 Gotas', 'farola', 1],
    ['banco', 'Banco', 'comun', 'gratis', 'Pase gratis · nv 15', 'banco', 1], ['gnomo', 'Gnomo de jardín', 'rara', 'gratis', 'Pase gratis · nv 26', 'gnomo', 1],
    ['fotocopiadora', 'Fotocopiadora', 'comun', 'tienda', 0, 'fotocopiadora', 1], ['bidon', 'Bidón', 'comun', 'tienda', 0, 'bidon', 3],
    ['maleta', 'Maleta', 'comun', 'tienda', 0, 'maleta', 3], ['cubo', 'Cubo de basura', 'comun', 'tienda', 0, 'cubo', 2],
    ['mesaBar', 'Mesa de terraza', 'comun', 'tienda', 0, 'mesaBar', 1], ['pilar', 'Pilar de las Backrooms', 'comun', 'tienda', 0, 'pilar', 1],
    ['expendedora', 'Máquina de bebidas', 'rara', 'tienda', 0, 'expendedora', 3], ['rack', 'Rack de servidores', 'rara', 'tienda', 0, 'rack', 3],
    ['vitrina', 'Vitrina de trofeos', 'rara', 'tienda', 0, 'vitrina', 4], ['maniqui', 'Maniquí', 'rara', 'tienda', 0, 'maniqui', 1],
    ['carroMaletas', 'Carro de maletas', 'rara', 'tienda', 0, 'carroMaletas', 1], ['arbol', 'Árbol', 'rara', 'tienda', 0, 'arbol', 3],
    ['sillon', 'Sillón', 'rara', 'tienda', 0, 'sillon', 2], ['globos', 'Globos', 'rara', 'tienda', 0, 'globos', 6],
    ['flotador', 'Flotador', 'rara', 'tienda', 0, 'flotador', 2], ['vater', 'Váter', 'rara', 'tienda', 0, 'vater', 1],
    ['mesajefe', 'Mesa del jefe', 'epica', 'tienda', 0, 'mesajefe', 1], ['cama', 'Cama', 'epica', 'tienda', 0, 'cama', 5],
    ['tarta', 'Tarta gigante', 'epica', 'tienda', 0, 'tarta', 1], ['fuenteJardin', 'Fuente del jardín', 'epica', 'tienda', 0, 'fuenteJardin', 1],
    ['barra', 'Barra de bar', 'epica', 'tienda', 0, 'barra', 1],
    ['piano', 'Piano de cola', 'epica', 'premium', 'Pase premium · nv 35', 'piano', 1], ['coche', 'Coche aparcado', 'legend', 'tienda', 0, 'coche', 6],
  ].filter(m => TIPOS_MUEBLE[m[5]]).map(([id, n, r, de, txt, t, vars]) => { MUEBLES_SALA[id] = { t, vars, g: ESC_PLANTAS.includes(id) ? 'plantas' : ESC_DECO.includes(id) ? 'deco' : 'muebles' }; return it(id, n, r, de, txt, (c, w) => muebleIcono(c, w, t)); });
  for (const x of [...escenariosR, ...mueblesR]) if (x.de === 'tienda' && x.txt === 0) x.txt = PRECIO_AR[x.r];      // el precio por rareza (armario-precios.js ya pasó)
  CATALOGO_AR.push(
    { id: 'escenarios', nombre: 'Escenarios (tu sala vacía)', corto: 'Escenarios', nota: 'Se usan en MI ESCENARIO: decóralo y píntalo a tu gusto', sala: true, items: escenariosR },
    { id: 'muebles', nombre: 'Muebles para tu escenario', corto: 'Muebles', nota: 'Se usan en MI ESCENARIO: pon todos los que quieras', sala: true, items: mueblesR },
  );
})();
// el icono de un mueble: su dibujo entero, centrado y lo más grande que quepa
function muebleIcono(c, w, t, v = 0) {
  const T = TIPOS_MUEBLE[t]; if (!T) return;
  const bw = T.w + 16, bh = (T.tope || T.d + T.h) + 14, s = Math.min(w * 0.86 / bw, w * 0.8 / bh);
  c.save(); c.translate(w / 2, w / 2 + bh * s / 2 - 4 * s); c.scale(s, s);
  c.fillStyle = 'rgba(24,12,40,0.24)'; c.beginPath(); rrPathRF(c, -T.w / 2 - 3, -T.d + 4, T.w + 6, T.d + 1, 7); c.fill();
  T.pinta(c, { t, v, x: 0, y: 0, T });
  c.restore();
}
