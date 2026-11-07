// Fans of Rumble v2 · Cambia los dibujos hechos con código por las imágenes pintadas por Yoshi (carpeta img/ de la v2).
// Se carga justo antes de games/rumble/js/21-arranque.js: ahí ya existen buildSprites, drawVector, buildBG y buildBridges.
// Lo que aún no tiene imagen se sigue viendo como en el original; cada imagen entra en cuanto se descarga.
'use strict';
const V2 = (() => {
  // personajes y edificios con imagen pintada: el nombre es el del dibujo (ART) y el archivo img/<nombre>.webp
  const SPRITES = [
    'bunny', 'squirrel', 'fox', 'beaver', 'meercat', 'junkcoon', 'mechavaca', 'vaca', 'huron', 'p_tower', 'p_base', 'p_rubble',
    'ceo', 'becario', 'starbot', 'fallen', 'e_tower', 'e_base', 'e_rubble',
  ];
  // fondos del campo: facción|plaza -> archivo (todo en WebP: pesa poco en el móvil)
  // (el de Animales se baja al empezar; los demás, la primera vez que hacen falta)
  const FONDOS = {
    'animales|mb': 'fondo-animales-mb', 'animales|ph': 'fondo-animales-ph', 'animales|ia': 'fondo-animales-ia',
    'nomuertos|mb': 'fondo-nomuertos-mb', 'streamers|mb': 'fondo-streamers-mb', 'heroes|mb': 'fondo-heroes-mb', 'ciber|mb': 'fondo-ciber-mb',
    'memes|mb': 'fondo-memes-mb', 'gamer|mb': 'fondo-gamer-mb', 'olvidados|mb': 'fondo-olvidados-mb', 'pop|mb': 'fondo-pop-mb',
  };
  const pedidos = new Set();   // fondos que ya se están bajando
  const IMG = {};   // nombre -> Image ya descargada
  const ver = '?v=' + encodeURIComponent(NUCLEO.version || '0');
  const carga = (nombre, listo) => {
    const im = new Image();
    im.onload = () => { IMG[nombre] = im; try { listo(); } catch (e) { console.warn('[v2]', nombre, e); } };
    im.onerror = () => { /* aún no está pintada: se queda el dibujo original */ };
    im.src = 'img/' + nombre + '.webp' + ver;
  };

  const barraAgrandada = {};   // edificios cuya barra de vida ya se subió (buildSprites se llama más de una vez)
  // el sprite pintado ocupa la caja del original (BOX), con los pies en el mismo punto de apoyo
  function aplicaSprite(key) {
    const im = IMG[key]; if (!im || !BOX[key]) return;
    const rol = (key.match(/_(tower|base|rubble)$/) || [])[1], e = rol ? AJUSTES.edificiosV2[rol] : 1;   // torres y bases, más grandes
    const [w, h, ax, ay] = BOX[key].map(n => n * e);
    if (e !== 1 && TOPS[key] && !barraAgrandada[key]) { barraAgrandada[key] = true; TOPS[key] = Math.round(TOPS[key] * e); }   // la barra de vida, encima
    const c = document.createElement('canvas'); c.width = Math.ceil(w * RES); c.height = Math.ceil(h * RES);
    const x = c.getContext('2d'); x.scale(RES, RES); x.imageSmoothingQuality = 'high';
    const pie = key.endsWith('_rubble') ? h : Math.min(h, ay + 3);   // los escombros llenan la caja; el resto apoya los pies
    const k = Math.min(w / im.width, pie / im.height), iw = im.width * k, ih = im.height * k;
    x.drawImage(im, ax - iw / 2, pie - ih, iw, ih);
    const blanco = document.createElement('canvas'); blanco.width = c.width; blanco.height = c.height;
    const bx = blanco.getContext('2d'); bx.drawImage(c, 0, 0); bx.globalCompositeOperation = 'source-in'; bx.fillStyle = '#fff'; bx.fillRect(0, 0, c.width, c.height);
    let gris = null;
    if (TYPES[key]) { gris = document.createElement('canvas'); gris.width = c.width; gris.height = c.height; const gx = gris.getContext('2d'); gx.drawImage(c, 0, 0); gx.globalCompositeOperation = 'source-in'; gx.fillStyle = '#9aa3a0'; gx.fillRect(0, 0, c.width, c.height); }
    const sp = { c, w: blanco, g: gris, wd: w, ht: h, ax, ay, v2: true };
    if (SPR[key]) Object.assign(SPR[key], sp); else SPR[key] = sp;
    if (typeof CORRUPT !== 'undefined') delete CORRUPT[key];   // el tinte de los corrompidos se rehace con la imagen nueva
  }


  // buildSprites: el original y, encima, lo que ya está pintado
  const buildSpritesOriginal = buildSprites;
  buildSprites = function () { buildSpritesOriginal(); SPRITES.forEach(aplicaSprite); };

  // cartas, retratos y pantalla de título: si hay imagen, se dibuja la imagen a la misma altura
  const drawVectorOriginal = drawVector;
  drawVector = function (c, key, x, y, h, flip = 1) {
    const sp = SPR[key];
    if (!sp || !sp.v2) return drawVectorOriginal(c, key, x, y, h, flip);
    const top = TYPES[key] ? TYPES[key].top : TOPS[key];
    const sc = h / (top || sp.ay);
    c.save(); c.translate(x, y); c.scale(sc * flip, sc); c.drawImage(sp.c, -sp.ax, -sp.ay, sp.wd, sp.ht); c.restore();
  };

  // el fondo del campo pintado (sin puentes: van aparte)
  const buildBGOriginal = buildBG;
  buildBG = function (fac = 'animales', plaza = 'mb') {
    const clave = fac + '|' + plaza, im = IMG[FONDOS[clave]];
    if (!im) { pideFondo(clave); return buildBGOriginal(fac, plaza); }
    const cv = document.createElement('canvas'); cv.width = W * BG_RES; cv.height = H * BG_RES;
    const c = cv.getContext('2d'); c.imageSmoothingQuality = 'high'; c.drawImage(im, 0, 0, cv.width, cv.height);
    return cv;
  };

  // los puentes pintados, en el sitio de siempre (con el estilo normal; los de colores especiales siguen como en el original)
  const buildBridgesOriginal = buildBridges;
  buildBridges = function () {
    const im = IMG.puente;
    if (!im || BRIDGE_STYLE) return buildBridgesOriginal();
    const cv = document.createElement('canvas'); cv.width = W * BG_RES; cv.height = H * BG_RES;
    const c = cv.getContext('2d'); c.scale(BG_RES, BG_RES); c.imageSmoothingQuality = 'high';
    for (const bx of BRIDGES) { const T = RIVER.top - 16, B = RIVER.bottom + 16; c.drawImage(im, bx - 40, T, 80, B - T); }
    return cv;
  };

  // lo que llega tarde se cambia en caliente
  SPRITES.forEach(k => carga(k, () => { if (typeof READY !== 'undefined' && READY) aplicaSprite(k); }));
  function pideFondo(clave) {
    if (!FONDOS[clave] || pedidos.has(clave)) return;
    pedidos.add(clave);
    carga(FONDOS[clave], () => {
      if (typeof BG_KEY !== 'undefined' && BG_KEY === clave) { const [f, p] = clave.split('|'); BG = buildBG(f, p); }
    });
  }
  pideFondo('animales|mb');
  carga('puente', () => { if (typeof READY !== 'undefined' && READY) BRIDGE_LAYER = buildBridges(); });

  return { SPRITES, FONDOS, IMG };
})();
