// Fans of Toys · adaptador · ICONOS: pinta el pixel art de TY.DIBUJOS en un lienzo pequeño (TY.icono) y dibuja el retrato de cada
// ejecutivo (TY.retrato): una cara de 12 x 12 que sale del nombre de la mejora, siempre la misma para la misma mejora y siempre de frente.
'use strict';
(() => {
  const LADO = 12;
  const lienzo = px => Object.assign(document.createElement('canvas'), { width: LADO, height: LADO, className: 'ty-icono', style: `width:${px}px;height:${px}px` });
  const pinta = (ctx, filas, paleta) => filas.forEach((fila, y) => [...fila].forEach((letra, x) => {
    if (paleta[letra]) { ctx.fillStyle = paleta[letra]; ctx.fillRect(x, y, 1, 1); }
  }));
  TY.icono = (id, px = 48) => {
    const c = lienzo(px);
    pinta(c.getContext('2d'), TY.DIBUJOS[id] || TY.DIBUJOS.caja, TY.DIBUJOS.PALETA);
    return c;
  };

  const PIEL = ['#f2c79a', '#d9a066', '#a8683c', '#ffe0bd'], PELO = ['#1b1320', '#8a5a34', '#e2452f', '#ffd23f', '#fff7e8', '#ff8a1f'], ROPA = ['#3aa0e8', '#e2452f', '#5fc04a', '#ff8a1f', '#35c7b0', '#1c5fa8'];
  const CARA = ['....hhhh....', '..hhhhhhhh..', '.hhhhhhhhhh.', '.hhsssssshh.', '.hssssssssh.', '.hsosssosss.', '.hssssssssh.', '..sssmmsss..', '...ssssss...', '..rrrssrrr..', '.rrrrccrrrr.', '.rrrrccrrrr.'];
  const numero = texto => [...texto].reduce((n, letra) => (n * 31 + letra.charCodeAt(0)) >>> 0, 7);
  TY.retrato = (id, px = 48) => {
    const n = numero(id), c = lienzo(px);
    pinta(c.getContext('2d'), CARA, { h: PELO[n % PELO.length], s: PIEL[(n >> 3) % PIEL.length], r: ROPA[(n >> 5) % ROPA.length], o: '#1b1320', m: '#c0392b', c: '#fff7e8' });
    return c;
  };
})();
