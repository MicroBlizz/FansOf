// Fans of Pop · SPRITES: carga los dibujos lisos de Yoshi (img-liso/*.png, preparados con herramientas/comfyui/pop/preparar_liso.py)
// y lo dibuja a escala entera y sin suavizar. Si un dibujo aún no está, el juego pinta su versión de repuesto (ver pintar.js):
// los slimes se pintan como gelatinas de su color con ojos, así el prototipo se puede probar sin esperar a Yoshi.
'use strict';
const PP_IMG = {};
// ESTILO: todo liso (Daniel, 02-11-2026: el pixel art, sacado del liso reducido, «parecía un filtro borroso»). Ya no hay opción
// PIXEL ART ni carpeta img/: los dibujos salen de img-liso/ en grande y se pintan suaves. PP_LISO se queda siempre a true.
const PP_LISO = true;
const PP_FLOTANTES = ['unicornio', 'arcoiris', 'capibara', 'gatito', 'conejito', 'osito', 'pato', 'piruleta', 'caramelo', 'cupcake', 'donut', 'nube', 'corazon', 'helado'].map(k => 'f-' + k);
// las de cada mundo (Daniel, 02-11-2026: «cada mundo tiene que tener las suyas»), por su fondo; mientras Yoshi no las pinta
// salen solo las que ya hay, y si no hay ninguna, la mezcla de siempre (la portada, el mapa y los duelos también la usan)
const PP_FLOTA_MUNDO = {
  'fondo-jardin': ['mariposa', 'mariquita', 'girasol', 'conejito', 'pato'],
  'fondo-pasteleria': ['cupcake', 'donut', 'macaron', 'cruasan', 'piruleta'],
  'fondo-heladeria': ['helado', 'polo', 'batido', 'pinguino', 'cucurucho'],
  'fondo-playa': ['cangrejo', 'estrellamar', 'sandia', 'flotador', 'pelota'],
  'fondo-feria': ['algodon', 'globo', 'palomitas', 'caballito', 'osito'],
  'fondo-nubes': ['nube', 'arcoiris', 'unicornio', 'pegaso', 'estrellita'],
  'fondo-bosque': ['seta', 'luciernaga', 'zorrito', 'hoja', 'bellota'],
  'fondo-mar': ['pezglobo', 'caballitomar', 'tortuga', 'pulpito', 'conchita'],
  'fondo-sakura': ['farolillo', 'dango', 'gatito', 'abanico', 'sakura'],
  'fondo-espacio': ['planeta', 'fugaz', 'cohetito', 'marcianito', 'luna'],
};
for (const k in PP_FLOTA_MUNDO) PP_FLOTA_MUNDO[k] = PP_FLOTA_MUNDO[k].map(n => 'f-' + n);
const PP_FLOTA_NUEVOS = [...new Set(Object.values(PP_FLOTA_MUNDO).flat())].filter(k => !PP_FLOTANTES.includes(k));
// los Animales del álbum que ya tienen dibujo de Yoshi (tarea #142, Pepins 22-11-2026; herramientas/comfyui/pop/pedidos_animales.py).
// La suricata, el pez globo, la mariposa y el caballito de mar (sin boca, 25-11-2026), con la versión repetida que se eligió: los 20.
// Solo salen con el flag `companeros` abierto; con él cerrado se cargan pero no se ven en ningún sitio
const PP_ANIMALES_CON_DIBUJO = Object.freeze(['ardilla', 'castor', 'capibara', 'pinguino', 'pato', 'cangrejo', 'osito', 'mariquita', 'zorro', 'suricata', 'mapache', 'pulpito', 'mariposa', 'luciernaga', 'erizo', 'huron', 'pezglobo', 'caballito', 'panda', 'mechavaca']);
const PP_LISTA_IMG = [...PP_FLOTANTES, ...PP_FLOTA_NUEVOS, ...Object.keys(PP_SLIMES).map(k => 'sl-' + k), ...PP_ANIMALES_CON_DIBUJO.map(k => 'sl-' + k), 'fondo-jardin', 'fondo-pasteleria', 'fondo-heladeria', 'fondo-playa', 'fondo-feria', 'fondo-nubes', 'fondo-bosque', 'fondo-mar', 'fondo-sakura', 'fondo-espacio', 'i-cohete', 'i-burbujas', 'i-petalo', 'fondo-jefe', 'tablero', 'i-copo', 'i-concha', 'i-cereza', 'i-martillo', 'i-bomba', 'i-toques3', 'i-deshacer', 'i-pista', 'i-red', 'i-hucha', 'i-infinito', 'i-pase', 'i-racha', 'i-regalo', 'i-regalo-abierto', 'i-vida', 'i-mano', 'i-estrella', 'i-moneda', 'i-cofre', 'i-perla', 'i-perlas', 'logo-pop',
  ...['rosa', 'melocoton', 'amarillo', 'menta', 'cielo', 'azul'].flatMap(k => ['b-' + k + '-arriba', 'b-' + k + '-abajo', 'b-' + k + '-doble']),
  // las burbujas de macaron de la Pastelería (tarea #110, tras el flag estilo-mundo; herramientas/comfyui/pop/macaron.py)
  ...['rosa', 'melocoton', 'amarillo', 'menta', 'cielo', 'azul'].flatMap(k => ['bm-macaron-' + k + '-arriba', 'bm-macaron-' + k + '-abajo']),
  // las bolas de helado de la Heladería (tarea #110 fase 2, tras el flag estilo-mundo; herramientas/comfyui/pop/macaron.py)
  ...['rosa', 'melocoton', 'amarillo', 'menta', 'cielo', 'azul'].flatMap(k => ['bm-helado-' + k + '-arriba', 'bm-helado-' + k + '-abajo']),
  // el botón de silicona del Jardín, la muestra de las caritas variadas (tarea #110; herramientas/comfyui/pop/boton.py)
  ...['rosa', 'melocoton', 'amarillo', 'menta', 'cielo', 'azul'].flatMap(k => ['bm-boton-' + k + '-arriba', 'bm-boton-' + k + '-abajo']),
  // el arte del perfil de jugador: adornos de los marcos, pegatinas y entradas (tarea #41, js/perfil-catalogo.js)
  ...['marco', 'pegatina', 'entrada'].flatMap(t => PP_PERFIL_CAT[t].map(d => d.img).filter(Boolean))];
// devuelve una promesa que se cumple cuando han llegado todos, con la lista de los que no llegaron ni al segundo intento (vacía si todo
// fue bien). La splash de core no se va hasta entonces (NUCLEO.listo en principal.js), sin tope de tiempo: así no se ven los dibujos de
// repuesto del primer boceto (Daniel, 31-10-2026; tarea #130). `nueva` crea cada imagen (los tests pasan una de mentira).
function ppCargaImagenes(nueva = () => new Image()) {
  const v = typeof VERSION !== 'undefined' ? VERSION : '0';
  const una = k => ppCargaUna(k, (PP_LISO ? 'img-liso/' : 'img/') + k + '.png?v=' + v, nueva);
  return Promise.all(PP_LISTA_IMG.map(una)).then(llegados => PP_LISTA_IMG.filter((k, i) => !llegados[i]));
}
// un dibujo: si falla se pide una vez más al cabo de 1 s (en el móvil a veces se corta la red un momento) y se cumple con true si llegó, false si no
function ppCargaUna(k, src, nueva, intento = 1) {
  return new Promise(ok => {
    const im = nueva();
    im.onload = () => { PP_IMG[k] = /^b-.*-abajo$/.test(k) && !PP_LISO ? ppHundida(im) : im; ok(true); };   // las lisas ya vienen hundidas (preparar_liso.py)
    im.onerror = () => (intento < 2 ? setTimeout(() => ok(ppCargaUna(k, src + '&otra=' + intento, nueva, intento + 1)), 1000) : ok(false));
    im.src = src;
  });
}
// la burbuja reventada tiene que verse HUNDIDA de un vistazo (si no, un niño no distingue cuáles faltan): se oscurece entera
// y lleva una sombra por dentro arriba a la izquierda y luz abajo a la derecha, como un hueco en la silicona
function ppHundida(im) {
  const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height;
  const c = cv.getContext('2d'), w = im.width, h = im.height; c.imageSmoothingEnabled = false;
  c.drawImage(im, 0, 0);
  c.globalCompositeOperation = 'source-atop';
  c.fillStyle = 'rgba(90, 30, 90, 0.28)'; c.fillRect(0, 0, w, h);
  const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, 'rgba(60, 10, 60, 0.55)'); g.addColorStop(0.55, 'rgba(60, 10, 60, 0)'); g.addColorStop(1, 'rgba(255, 255, 255, 0.35)');
  c.fillStyle = g; c.beginPath(); c.arc(w / 2, h / 2, w * 0.36, 0, Math.PI * 2); c.fill();
  return cv;
}
const ppTieneImg = k => !!PP_IMG[k];
// dibuja un sprite con su esquina (x, y) a escala entera s. Devuelve [ancho, alto] dibujados, o null si no está.
function ppDibuja(c, k, x, y, s = 4) {
  const im = PP_IMG[k]; if (!im) return null;
  const w = im.width * s, h = im.height * s;
  c.imageSmoothingEnabled = PP_LISO; if (PP_LISO) c.imageSmoothingQuality = 'high';
  c.drawImage(im, Math.round(x), Math.round(y), w, h);
  return [w, h];
}
// centrado en (cx, cy), ajustado a que quepa en `lado` píxeles (escala entera si es posible)
function ppDibujaEn(c, k, cx, cy, lado, exacto = false) {
  const im = PP_IMG[k]; if (!im) return null;
  let s = lado / Math.max(im.width, im.height); if (s >= 2 && !exacto && !PP_LISO) s = Math.floor(s);   // entero si cabe x2 o más; si no, el tamaño que toque
  return ppDibuja(c, k, cx - im.width * s / 2, cy - im.height * s / 2, s);
}
// un sprite en un lienzo pequeño (para las ventanas en HTML)
function ppMiniatura(k, lado = 72) {
  const cv = document.createElement('canvas');
  cv.width = lado; cv.height = lado; cv.style.width = lado + 'px'; cv.style.height = lado + 'px'; cv.style.imageRendering = PP_LISO ? 'auto' : 'pixelated';
  const c = cv.getContext('2d');
  if (!ppDibujaEn(c, k, lado / 2, lado / 2, lado) && k.startsWith('sl-')) ppSlimeRepuesto(c, k.slice(3), lado / 2, lado / 2, lado * 0.42, 0, 1);
  return cv;
}
