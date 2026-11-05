// Fans of Basement · Sprites provisionales en píxel: cada dibujo es una lista de filas de letras (cada letra, un color de su paleta;
// el punto es transparente). Se pintan una vez en un lienzo pequeño, con el contorno oscuro de la serie alrededor, y luego se
// escalan sin suavizar. Son de prueba: cuando el juego esté decidido, Yoshi hace el arte de verdad y estos se cambian por PNG.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const CONTORNO = '#161616';
  const DIBUJOS = {
    jugador: { pal: { H: '#3a2416', S: '#f2c08a', e: '#1a1a1a', k: '#2b3445', O: '#ff8a2a', W: '#ffffff', J: '#3b5bdb', Z: '#1a1a1a' }, filas: [
      '...HHHHH....', '..HHHHHHH...', '..HSSSSSHk..', '..SSeSSeSk..', '..SSSSSSSkk.', '...SSSSS..k.', '..OOOOOOO...',
      '.OOOOWOOOO..', '.SOOOWOOOS..', '.SOOOOOOOS..', '..JJJJJJJ...', '..JJJ.JJJ...', '..JJJ.JJJ...', '..ZZZ.ZZZ...'] },
    bug: { pal: { d: '#1b1b1b', G: '#3fa34d', g: '#8fe07a', R: '#ff3b2d' }, filas: [
      '..d.....d..', '...d...d...', '..GGGGGGG..', '.GRGGGGGRG.', '.GGGgGgGGG.', 'dGGGGGGGGGd', '.GGgGGGgGG.', 'd.d.d.d.d.d'] },
    correo: { pal: { W: '#ffffff', w: '#9fb0c8', R: '#e5322d' }, filas: [
      'WWWWWWWWWWWW', 'WwWWWWWWWWwW', 'WWwWWWWWWwWW', 'WWWwWWWWwWWW', 'WWWWwWWwWWWW', 'WWWWWwwWWWWW', 'WWWWWWWWWWWW', 'WRRWWWWWWWWW', 'WWWWWWWWWWWW'] },
    miniCorreo: { pal: { W: '#ffffff', w: '#9fb0c8', R: '#e5322d' }, filas: [
      'WWWWWWWW', 'WwWWWWwW', 'WWwWWwWW', 'WWWwwWWW', 'WRWWWWWW', 'WWWWWWWW'] },
    reunion: { pal: { K: '#1a1a1a', R: '#e5322d', W: '#ffffff', g: '#9fb0c8', E: '#1a1a1a' }, filas: [
      '.K..........K...', 'RRRRRRRRRRRRRRRR', 'RRRRRRRRRRRRRRRR', 'WWWWWWWWWWWWWWWW', 'WggWggWggWggWggW', 'WWWWWWWWWWWWWWWW',
      'WWKKWWWWWWWWKKWW', 'WWWKKWWWWWWKKWWW', 'WWWWEEWWWWEEWWWW', 'WWWWEEWWWWEEWWWW', 'WWWWWWWWWWWWWWWW', 'WWWWWKKKKKKWWWWW',
      'WWWWKWWWWWWKWWWW', 'WggWggWggWggWggW', 'WWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWW'] },
    codigo: { pal: { k: '#0f3a1c', G: '#2fbf5a', L: '#c8ffd4' }, filas: [
      'kkkkkkkkk', 'kGGGGGGGk', 'kGGLGLLGk', 'kGLGLGGLk', 'kGGLLGLGk', 'kGGGGGGGk', 'kkkkkkkkk'] },
    postit: { pal: { Y: '#ffe14a', y: '#e8b923', b: '#3b5bdb' }, filas: [
      'YYYYYYY', 'YYYYYYY', 'YbbbbYY', 'YYYYYYY', 'YbbbYYY', 'YYYYYYY', 'YYYYYyy'] },
    taza: { pal: { G: '#f2b705', g: '#fff3a0' }, filas: [
      'GGGGGGG..', 'GgGGGGGGG', 'GgGGGGG.G', 'GgGGGGG.G', 'GGGGGGGGG', 'GGGGGGG..', 'GGGGGGG..', '.GGGGG...'] },
    cafe: { pal: { s: '#ffffff', W: '#ffffff', C: '#6b3a1e' }, filas: [
      '.s.s...', '..s.s..', 'WWWWWW.', 'WCCCCWW', 'WWWWW.W', 'WWWWWWW', 'WWWWW..', '.WWW...'] },
    caja: { pal: { C: '#e0a85a', D: '#c98f3d', T: '#8a5a24' }, filas: [
      'CCCCCCCCCC', 'CCCCCCCCCC', 'DDDDDDDDDD', 'DDDDTTDDDD', 'DDDDTTDDDD', 'DDDDDDDDDD', 'DDDDDDDDDD', 'DDDDDDDDDD'] },
    grapadora: { pal: { K: '#1a1a1a', R: '#e5322d', r: '#a8201c', S: '#b8c4d6' }, filas: [
      '.RRRRRRRRR.', 'RRRRRRRRRRr', '.rrrrrrrrr.', '..KKKKKKK..', 'SSSSSSSSSSS', 'SSSSSSSSSSS'] },
    // ---- fase 2: mascotas, jefes, paquetes, equipo y la trampa del becario ----
    pato: { pal: { Y: '#ffd23a', y: '#e8b923', e: '#1a1a1a', O: '#ff8a2a' }, filas: [
      '...YYY....', '..YYYYY...', '..YeYYYOO.', '..YYYYYOO.', '...YYY....', '.YYYYYYYY.', 'YYYYYYYYYY', 'YYyYYYYYY.', '.YYYYYYY..'] },
    gato: { pal: { K: '#2b2b35', G: '#5fe05f', P: '#ff9fb0' }, filas: [
      'K.......K..', 'KK.....KK..', 'KKKKKKKKK..', 'KGKKKKKGK..', 'KKKKPKKKK..', '.KKKKKKK...', '.KKKKKKKK.K', '.KKKKKKKKKK', '.KK.KK.KK..'] },
    roomba: { pal: { S: '#c8d2e0', d: '#5a6478', R: '#ff3b2d' }, filas: [
      '...SSSSSS...', '.SSSSSSSSSS.', 'SSSSRRSSSSSS', 'SSSSSSSSSSSS', 'SSSSSSSSSSSS', '.SddddddddS.', '...dddddd...'] },
    dron: { pal: { K: '#2b2b35', S: '#c8d2e0', R: '#ff3b2d', P: '#d9a066', p: '#b07a3e' }, filas: [
      'KKK......KKK', '.K..SSSS..K.', '.KSSSSSSSSK.', '..SSRSSRSS..', '...SSSSSS...', '....K..K....', '..PPPPPPPP..', '..PpPPPPpP..', '..PPPPPPPP..'] },
    jefe_producto: { pal: { H: '#2b2b35', S: '#f2c08a', K: '#1a1a1a', M: '#a8201c', B: '#26385c', R: '#e5322d', Z: '#1a1a1a' }, filas: [
      '....HHHHHH....', '...HHHHHHHH...', '...HSSSSSSH...', '...SKKSSKKS...', '...SSSSSSSS...', '....SSMMSS....', '.....SSSS.....', '..BBBBRRBBBB..',
      '.BBBBBRRBBBBB.', '.BBBBBRRBBBBB.', '.SBBBBRRBBBBS.', '.SBBBBBBBBBBS.', '..BBBBBBBBBB..', '..BBBB..BBBB..', '..BBBB..BBBB..', '..ZZZZ..ZZZZ..'] },
    jefe_rrhh: { pal: { H: '#7a3b1e', S: '#f2c08a', e: '#1a1a1a', M: '#a8201c', G: '#2f7d4f', W: '#ffffff', R: '#e5322d', K: '#2b2b35', Z: '#1a1a1a' }, filas: [
      '....HHHHHH....', '...HHHHHHHHH..', '..HHSSSSSSHH..', '..HHSeSSeSHH..', '..HHSSSSSSHH..', '..HH.SMMS.HH..', '.....SSSS.....', '..GGGGGGGGGG..',
      '.GGGGWWWWGGGG.', '.GGGGWWWWGGGGR', '.SGGGWWWWGGGRR', '.SGGGGGGGGGG..', '..KKKKKKKKKK..', '..KKKKKKKKKK..', '...SS....SS...', '...ZZ....ZZ...'] },
    jefe_lanzamiento: { pal: { d: '#1b1b1b', R: '#e5322d', r: '#8a1712', Y: '#ffe14a', K: '#1a1a1a' }, filas: [
      '...d........d...', '....d......d....', '....dd....dd....', '...RRRRRRRRRR...', '..RRRRRRRRRRRR..', '.RRYYRRRRRRYYRR.', '.RRYKRRRRRRKYRR.',
      'dRRRRRrRRrRRRRRd', '.RRRrRRRRRRrRRR.', 'dRRRRRRRRRRRRRRd', '.RRrRRRRRRRRrRR.', 'd.d.d.d..d.d.d.d'] },
    jefe_accionistas: { pal: { K: '#2b2b35', R: '#e5322d', G: '#ffe14a', M: '#d9b56b', W: '#ffffff', D: '#2fbf5a' }, filas: [
      '....KKKKKK....', '....KKKKKK....', '....KRRRRK....', '..KKKKKKKKKK..', '.....GGGG.....', '....GGGGGG....', '...MMMMMMMM...', '..MMWMMMMWWM..',
      '.MMMKMMMMWKWM.', '.MMMMMMMMMWMM.', 'MMMMMMKKMMMMMM', 'MMMMDDDDDDMMMM', 'MMMMMDDDDMMMMM', '.MMMMMMMMMMMM.', '..MMMMMMMMMM..', '...MMMMMMMM...'] },
    paquete: { pal: { C: '#e0a85a', D: '#c98f3d', T: '#8a5a24', L: '#ffffff' }, filas: [
      'CCCCTTCCCC', 'CCCCTTCCCC', 'DDDDTTDDDD', 'DDDDTTDDDD', 'DLLLTTDDDD', 'DLLLTTDDDD', 'DDDDTTDDDD', 'DDDDTTDDDD'] },
    paqueteJefe: { pal: { C: '#b0703a', D: '#8a5424', T: '#ffe14a', L: '#e5322d' }, filas: [
      'CCCCTTCCCC', 'CCCCTTCCCC', 'DDDDTTDDDD', 'DDDDTTDDDD', 'DLLLTTDDDD', 'DLLLTTDDDD', 'DDDDTTDDDD', 'DDDDTTDDDD'] },
    teclado: { pal: { K: '#2b3445', W: '#e8eef7' }, filas: ['KKKKKKKKKKKK', 'KWKWKWKWKWKK', 'KKWKWKWKWKWK', 'KWKWWWWWWKWK', 'KKKKKKKKKKKK'] },
    auriculares: { pal: { K: '#2b3445', R: '#e5322d' }, filas: [
      '...KKKKK...', '..K.....K..', '.K.......K.', '.K.......K.', 'K.........K', 'KK.......KK', 'RRK.....KRR', 'RRR.....RRR', 'RRR.....RRR', '.R.......R.'] },
    silla: { pal: { B: '#3b5bdb', K: '#2b2b35' }, filas: [
      '..BBBBBB..', '..BBBBBB..', '..BBBBBB..', '..BBBBBB..', '...BBBB...', '....KK....', '.BBBBBBBB.', '.BBBBBBBB.', '....KK....', '....KK....', '.KKKKKKKK.', '.K..KK..K.'] },
    fotocopiadora: { pal: { S: '#d0d8e4', K: '#2b3445', W: '#ffffff', G: '#5fe05f', D: '#8a97ab' }, filas: [
      'SSSSSSSSSSSSSS', 'SKKKKKKKKKKKKS', 'SSSSSSSSSSSSSS', 'SSWWWWWWWWWWSS', 'SSSSSSSSSSSSSS', 'SSSSSSSSGGSSSS', 'SSSSSSSSSSSSSS', 'SDDDDDDDDDDDDS', 'SDDDDDDDDDDDDS', 'SSSSSSSSSSSSSS'] },
    // ---- 0.4.0: las armas que no tienen dibujo de Yoshi ----
    lanzaclips: { pal: { S: '#c8d2e0' }, filas: [
      '..SSSSS..', '.S.....S.', '.S.SSS.S.', '.S.S.S.S.', '.S.S.S.S.', '.S.S.S.S.', '.S.S...S.', '.S.SSSSS.', '.S.......'] },
    taladro: { pal: { K: '#2b2b35', O: '#ff8a2a', S: '#c8d2e0' }, filas: [
      '...KKKKKK...', '..KOOOOOOKSS', '..KOOOOOOKSS', '...KKOOKK...', '....KOOK....', '....KOOK....', '....KKKK....'] },
    extintor: { pal: { K: '#2b2b35', R: '#e8413a', W: '#ffffff' }, filas: [
      '..KK..', '.KKKK.', '..KK.K', '.RRRR.', 'RRRRRR', 'RWWWRR', 'RWWWRR', 'RRRRRR', 'RRRRRR', 'RRRRRR', 'RRRRRR', '.RRRR.'] },
    raton: { pal: { B: '#3a8ee6', K: '#1a1a1a' }, filas: [
      '..BBBB..', '.BBKBBB.', 'BBBKBBBB', 'BBBKBBBB', 'BBBBBBBB', 'BBBBBBBB', 'BBBBBBBB', 'BBBBBBBB', '.BBBBBB.', '..BBBB..'] },
    taza_hud: { pal: { W: '#ffffff', C: '#6b3a1e', s: '#ffffff' }, filas: [
      '.s..s....', '..s..s...', 'WWWWWWW..', 'WCCCCCWWW', 'WWWWWWW.W', 'WWWWWWW.W', 'WWWWWWWWW', 'WWWWWWW..', '.WWWWW...'] },
  };

  // El becario es el jugador con la sudadera verde.
  DIBUJOS.becario = { pal: { ...DIBUJOS.jugador.pal, O: '#3fa34d' }, filas: DIBUJOS.jugador.filas };

  // Pinta el dibujo en un lienzo de (ancho+2)×(alto+2) píxeles: el borde de 1 píxel es el contorno.
  function pintar(d, blanco) {
    const h = d.filas.length, w = d.filas[0].length, c = document.createElement('canvas');
    c.width = w + 2; c.height = h + 2;
    const g = c.getContext('2d'), lleno = (x, y) => y >= 0 && y < h && x >= 0 && x < w && d.filas[y][x] !== '.';
    g.fillStyle = CONTORNO;
    for (let y = -1; y <= h; y++) for (let x = -1; x <= w; x++) if (!lleno(x, y) && vecino(lleno, x, y)) g.fillRect(x + 1, y + 1, 1, 1);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const ch = d.filas[y][x];
      if (ch === '.') continue;
      g.fillStyle = blanco ? '#ffffff' : d.pal[ch];
      g.fillRect(x + 1, y + 1, 1, 1);
    }
    return c;
  }
  function vecino(lleno, x, y) { return lleno(x - 1, y) || lleno(x + 1, y) || lleno(x, y - 1) || lleno(x, y + 1); }

  const CACHE = {};
  // El lienzo de un dibujo (y su versión toda blanca, para el destello al recibir un golpe).
  B.sprite = function (nombre, blanco) {
    const k = nombre + (blanco ? ':b' : '');
    if (!CACHE[k]) CACHE[k] = pintar(DIBUJOS[nombre], blanco);
    return CACHE[k];
  };

  // Lo dibuja centrado en (x, y) con cada píxel del dibujo de `px` unidades; volteado si mira a la izquierda.
  B.dibujaSprite = function (g, nombre, x, y, px, opc) {
    const o = opc || {}, c = B.sprite(nombre, o.blanco), w = c.width * px, h = c.height * px;
    g.save();
    g.imageSmoothingEnabled = false;
    if (o.alfa != null) g.globalAlpha = o.alfa;
    g.translate(Math.round(x), Math.round(y));
    if (o.izq) g.scale(-1, 1);
    if (o.giro) g.rotate(o.giro);
    g.drawImage(c, -w / 2, -h / 2, w, h);
    g.restore();
  };
})(BAS);
