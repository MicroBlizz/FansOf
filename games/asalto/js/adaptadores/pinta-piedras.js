// Fans of Asalto · ADAPTADORES · Las piedras de destino a la vista: su losa al final de la tira de misiones (por dónde va la misión de
// piedra, las oleadas que le quedan y, si hay piedras en la bolsa, el aviso de que se pueden usar; al tocarla se abre su ventana,
// ventanas-piedras.js) lo que dice la cinta cuando sale una misión de piedra, se gana la piedra o caduca, el dibujo de cada piedra (por
// código, con el color de su tipo) y lo que trae además cada una. No decide nada.
'use strict';
AS.pinta = AS.pinta || {};
AS.pinta.piedras = (() => {
  const T = AS.tema, C = T.C, tx = AS.texto.pinta, URLS = {};
  // una piedra de 9 x 8 puntos, del color de su tipo: X el borde, L la luz, C su color, S la sombra
  const FORMA = ['...XXX...', '..XLLCX..', '.XLCCCCX.', 'XLCCCCCSX', 'XCCCCCSSX', '.XCCCSSX.', '..XCSSX..', '...XXX...'];
  // la piedra con su centro en (x, y); k = el tamaño de cada punto
  function dibuja(g, piedra, x, y, k) {
    const col = ASALTO.piedras.tipos[piedra].col, t = { X: C.tinta, L: T.tono(col, 0.55), C: col, S: T.tono(col, -0.35) };
    const x0 = Math.round(x - FORMA[0].length * k / 2), y0 = Math.round(y - FORMA.length * k / 2);
    FORMA.forEach((fila, j) => { for (let i = 0; i < fila.length; i++) if (fila[i] !== '.') { g.fillStyle = t[fila[i]]; g.fillRect(x0 + i * k, y0 + j * k, k, k); } });
  }
  // la misma piedra como imagen, para las ventanas
  function img(piedra) {
    if (!URLS[piedra]) {
      const cv = document.createElement('canvas');
      cv.width = FORMA[0].length; cv.height = FORMA.length;
      dibuja(cv.getContext('2d'), piedra, cv.width / 2, cv.height / 2, 1);
      URLS[piedra] = cv.toDataURL();
    }
    return `<img class="as-pix as-ico2" src="${URLS[piedra]}" alt="">`;
  }
  const nombre = piedra => tr(ASALTO.piedras.tipos[piedra].nombre);
  // lo que trae además (las 12 nuevas), con sus cifras; las 3 de siempre, nada
  const que = piedra => { const t = ASALTO.piedras.tipos[piedra]; return t.txt ? tr(t.txt, t.extra) : ''; };
  const pide = m => tr(ASALTO.piedras.misiones[m.id].txt, { n: m.meta });
  const plazo = n => (n === 1 ? tr('Solo te queda esta oleada') : tr('Te quedan {n} oleadas', { n }));
  // un cuadradito por cada oleada que le queda a la misión, arriba a la derecha
  function oleadas(g, x, y, n) {
    for (let i = 0; i < n; i++) { g.fillStyle = C.tinta; g.fillRect(x - 9 - i * 9, y, 8, 8); g.fillStyle = n === 1 ? C.rojo : C.crema; g.fillRect(x - 7 - i * 9, y + 2, 4, 4); }
  }
  // la barra de la misión y las oleadas que le quedan
  function marcador(g, r, m) {
    g.fillStyle = C.tinta; g.fillRect(r.x + 6, r.y + r.h - 11, r.w - 12, 5);
    g.fillStyle = C.azul; g.fillRect(r.x + 6, r.y + r.h - 11, Math.round((r.w - 12) * m.va / m.meta), 5);
    oleadas(g, r.x + r.w - 3, r.y + 4, m.quedan);
  }
  // qué dice la losa: con piedras en la bolsa, USAR; con misión, por dónde va (con el icono al lado); sin nada, apagada
  function rotulo(s) {
    if (s.bolsa.length) return { txt: tr('USAR') + ' x' + s.bolsa.length, claro: true, icono: false };
    return s.mision ? { txt: s.mision.va + '/' + s.mision.meta, claro: true, icono: true } : { txt: tr('PIEDRAS'), claro: false, icono: false };
  }
  function losa(g, r, p, E) {
    const s = p.piedras, R = rotulo(s), luce = s.bolsa.length && p.fase === 'preparar' && !E.batalla && Math.floor(E.t * 3) % 2;
    T.losa(g, r.x, r.y, r.w, r.h, luce ? C.oro : R.claro ? C.celeste : C.madera2);
    if (R.icono) dibuja(g, s.mision.piedra, r.x + 22, r.y + Math.round(r.h / 2) - 4, 3);
    tx(g, R.txt, R.icono ? r.x + 40 + (r.w - 46) / 2 : r.x + r.w / 2, r.y + Math.round(r.h / 2) - 4, { col: R.claro ? C.tinta : C.crema, borde: !R.claro, ancla: 'c', max: R.icono ? r.w - 50 : r.w - 14 });
    if (s.mision) marcador(g, r, s.mision);
    E.zona(r, 'piedras');
  }
  // lo que dice la cinta de cada aviso de piedra: { titulo, texto, texto2 (segunda línea), col }
  const CINTA = {
    'piedra-mision': a => ({ titulo: tr('MISIÓN DE PIEDRA'), texto: pide(a), texto2: plazo(a.quedan), col: C.azul }),
    piedra: a => ({ titulo: tr('¡PIEDRA DE DESTINO!'), texto: nombre(a.piedra), texto2: que(a.piedra) || tr('Tócala arriba para usarla'), col: C.verde }),
    'piedra-caducada': () => ({ titulo: tr('MISIÓN DE PIEDRA CADUCADA'), texto: tr('Se acabó el plazo'), texto2: tr('Pronto saldrá otra'), col: C.sangre }),
  };
  const cinta = a => (CINTA[a.tipo] ? CINTA[a.tipo](a) : null);
  return { losa, cinta, nombre, que, pide, plazo, dibuja, img };
})();
