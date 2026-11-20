// Fans of Pinball · adaptador · SPRITES: lo que se prepara UNA vez al cargar, píxel a píxel y sin suavizado (ARTE.md, «Cómo pintarlo sin
// que se emborrone»): las palas grandes y cortas giradas en 9 ángulos (y sus versiones teñidas: aviso del láser, congelada y lenta), el
// ovillo de cada criatura (y sus posturas cómicas, si existen) girado en 16, la cápsula aplastada y estirada en cada eje del choque, los
// dibujos de otros juegos reducidos a su tamaño, las siluetas blancas del destello, los tintes y las luces del decorado.
// Todo se hace leyendo y escribiendo píxeles (getImageData / putImageData): cada píxel de salida copia UN píxel del dibujo pequeño, así
// que sale un píxel de verdad del tamaño de los demás. Después la partida solo hace drawImage de estos lienzos a escala entera.
'use strict';
PB.sprites = (() => {
  const pixeles = src => {
    const c = PB.lienzoNuevo(src.width, src.height), x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.drawImage(src, 0, 0);
    return x.getImageData(0, 0, c.width, c.height);
  };
  function lienzoDe(datos) {
    const c = PB.lienzoNuevo(datos.width, datos.height);
    c.getContext('2d').putImageData(datos, 0, 0);
    return c;
  }
  // un lienzo w x h donde cada píxel copia el de muestra(x, y) → [sx, sy] del dibujo (o nada si cae fuera)
  function remuestrea(src, w, h, muestra) {
    const d = pixeles(src), sal = new ImageData(w, h), o = sal.data, s = d.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const [sx, sy] = muestra(x + 0.5, y + 0.5);
        if (sx < 0 || sy < 0 || sx >= d.width || sy >= d.height) continue;
        const i = (Math.floor(sy) * d.width + Math.floor(sx)) * 4, j = (y * w + x) * 4;
        o[j] = s[i]; o[j + 1] = s[i + 1]; o[j + 2] = s[i + 2]; o[j + 3] = s[i + 3];
      }
    }
    return lienzoDe(sal);
  }
  // aplastada, estirada o reducida: ancho w y alto h, al vecino más próximo
  const ajusta = (src, w, h) => remuestrea(src, w, h, (x, y) => [x * src.width / w, y * src.height / h]);
  // reducida a la parte `f` de su tamaño (f = 1: tal cual)
  const reduce = (src, f) => (f === 1 ? src : ajusta(src, Math.max(1, Math.round(src.width * f)), Math.max(1, Math.round(src.height * f))));
  // girada `ang` radianes (sentido de las agujas, como el mundo) alrededor de (px, py); sale en un cuadrado de lado `lado` con el eje en medio
  function gira(src, ang, px, py, lado) {
    const c = Math.cos(-ang), s = Math.sin(-ang), m = lado / 2;
    return remuestrea(src, lado, lado, (x, y) => { const dx = x - m, dy = y - m; return [px + dx * c - dy * s, py + dx * s + dy * c]; });
  }
  const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  // mezcla cada píxel visible con un color (fuerza de 0 a 1); fuerza 1 = silueta
  function tine(src, hex, fuerza) {
    const d = pixeles(src), t = rgb(hex);
    for (let i = 0; i < d.data.length; i += 4) {
      if (!d.data[i + 3]) continue;
      for (let k = 0; k < 3; k++) d.data[i + k] = Math.round(d.data[i + k] * (1 - fuerza) + t[k] * fuerza);
    }
    return lienzoDe(d);
  }
  return { ajusta, reduce, gira, tine };
})();

// Prepara todo lo de la partida a partir de las imágenes cargadas. Devuelve { img, palas, ovillos, aplastes, enemigos, jefe, ... }
PB.preparaSprites = (img, arte, mesa) => {
  const S = PB.sprites, T = arte.tintes;
  // los cuadros girados de una pala: de `desde` a `hasta` radianes, en n pasos, con su eje
  function cuadrosPala(fuente, eje, desde, hasta) {
    const n = arte.angulosPala, lado = 2 * Math.ceil(Math.hypot(fuente.width, fuente.height)) + 2, lista = [];
    for (let i = 0; i < n; i++) {
      const a = desde + (hasta - desde) * i / (n - 1), base = S.gira(fuente, a, eje[0], eje[1], lado);
      lista.push({ a, normal: base, aviso: S.tine(base, T.aviso, 0.55), congelada: S.tine(base, T.congelada, 0.6), lenta: S.tine(base, T.lenta, 0.6) });
    }
    return { lado, lista };
  }
  // de arriba a reposo; la derecha gira con el ángulo del mundo menos π (su dibujo ya apunta a la izquierda)
  function rango(p) { const d = p.lado === 'derecha' ? Math.PI : 0; return [p.arriba - d, p.reposo - d].sort((a, b) => a - b); }
  // una pala por id: las de abajo con el dibujo grande y las de arriba con el corto
  const palas = {};
  for (const p of mesa.palas) {
    const corta = p.nivel === 'arriba' ? 'Corta' : '', fuente = img[(p.lado === 'izquierda' ? 'palaIzquierda' : 'palaDerecha') + corta];
    const eje = p.lado === 'izquierda' ? arte.pivotePala : [fuente.width - arte.pivotePala[0], arte.pivotePala[1]];
    palas[p.id] = cuadrosPala(fuente, eje, ...rango(p));
  }
  const giros = fuente => Array.from({ length: arte.angulosOvillo }, (_, i) =>
    S.gira(fuente, i * 2 * Math.PI / arte.angulosOvillo, fuente.width / 2, fuente.height / 2, Math.max(fuente.width, fuente.height)));
  // el ovillo de cada criatura y sus posturas cómicas (solo las que ya existen: AJUSTES.arte.posturasHechas)
  const ovillos = {}, posturas = {};
  for (const [id, c] of Object.entries(arte.criaturas)) {
    ovillos[id] = giros(img[c.ovillo]); posturas[id] = {};
    for (const [nombre, p] of Object.entries(arte.posturas)) {
      const clave = c.nombre + '-' + (p.archivo || nombre);
      if (img['postura:' + clave]) posturas[id][nombre] = giros(img['postura:' + clave]);
    }
  }
  // la cápsula aplastada: cada cuadro de AJUSTES.arte.aplaste girado en cada eje (el eje del choque, en media vuelta)
  const cap = img.capsula, lado = Math.ceil(Math.hypot(cap.width + 6, cap.height + 6));
  const aplastes = arte.aplaste.cuadros.map(([w, h]) => {
    const base = S.ajusta(cap, w, h);
    return Array.from({ length: arte.angulosAplaste }, (_, i) => S.gira(base, i * Math.PI / arte.angulosAplaste - Math.PI / 2, w / 2, h / 2, lado));
  });
  const enemigos = {};
  for (const [tipo, e] of Object.entries(arte.enemigos)) {
    const base = S.reduce(img[e.img], e.reduce), c = e.tinte ? S.tine(base, e.tinte, 0.35) : base;
    enemigos[tipo] = { c, golpe: S.tine(c, T.golpe, 1), sinCasco: base };
  }
  const jefe = S.reduce(img[arte.jefe.img], arte.jefe.reduce), caja = S.reduce(img[arte.jefe.caja], arte.jefe.reduceCaja);
  const proyectiles = {};
  for (const tipo of ['cafe', 'cubito', 'bolsa']) proyectiles[tipo] = S.reduce(img[arte.proyectiles[tipo]], arte.proyectiles.reduce);
  return {
    img, palas, ovillos, posturas, aplastes, enemigos, proyectiles,
    jefe: { c: jefe, golpe: S.tine(jefe, T.golpe, 1), rabia: S.tine(jefe, T.rabia, 0.4) },
    caja: { c: caja, golpe: S.tine(caja, T.golpe, 1) },
    rampaLuz: S.tine(img.rampaEntrada, '#fad949', 0.7),
    luz: { rebotadorIzquierdo: S.tine(img.rebotadorIzquierdo, T.luz, 0.6), rebotadorDerecho: S.tine(img.rebotadorDerecho, T.luz, 0.6),
      fotocopiadora: S.tine(img.fotocopiadora, T.luz, 0.35), tienda: S.tine(img.tienda, '#fad949', 0.3) },
  };
};
