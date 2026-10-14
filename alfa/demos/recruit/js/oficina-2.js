// Fans of Recruit · LOS MUEBLES de las Oficinas de Microblizz (2): las cajas de «TUS COSAS», el archivador, la mampara con sus
// notas, la papelera, la valla de «EN CONSTRUCCIÓN» y los folios que vuelan por todas partes.
'use strict';

// las cajas del despido: la grande dice «TUS COSAS» (como en Fans of Rumble) y de la de arriba asoman la planta, la foto y el flexo
function cajasCosas(p, x, y) {
  const P = MAT, C = P.carton;
  // la caja de arriba, con lo que asoma por detrás
  p.raya(x - 11, y - 30, x - 14, y - 38, P.negro.c[3]); p.raya(x - 14, y - 38, x - 9, y - 42, P.negro.c[3]);
  p.parte(F.pol(x - 11, y - 44, x - 6, y - 43, x - 5, y - 39.6, x - 10, y - 40), apagado(P.rojo, '#445264', 0.2), { r: 1.2, sombra: 0 });
  p.parte(F.rr(x - 3, y - 39, 8, 10, 0.5), P.mesa, { plano: 3, canto: 1, sombra: 0 });
  p.plano(F.rr(x - 1.6, y - 37.6, 5.2, 6, 0), '#a8d0e8'); p.px(x + 0.5, y - 35.5, P.piel.c[3]); p.px(x + 1.5, y - 35.5, P.piel.c[3]); p.px(x + 0.5, y - 34.5, P.capa.c[3]); p.px(x + 1.5, y - 34.5, P.capa.c[3]); p.px(x + 0.5, y - 33.5, P.capa.c[2]); p.px(x + 1.5, y - 33.5, P.capa.c[2]);
  for (const [dx, dy, a] of [[8, -37, -0.9], [11, -35, -0.2], [6, -40, -1.5]]) p.parte(F.ov(x + dx, y + dy, 3.6, 1.8, a), P.planta, { r: 1.8, sombra: 0 });
  const id2 = p.parte(F.rr(x - 16, y - 31, 24, 13, 0.5), C, { plano: 3, canto: 1, sombra: 2 });
  p.tono(F.rr(x - 5.4, y - 30, 2.4, 11, 0), 1, id2);
  p.parte(F.pol(x - 16, y - 31, x - 21, y - 34, x - 20, y - 35.4, x - 15, y - 32.4), C, { plano: 4, canto: [0, -1], sombra: 1 });
  // la caja grande, con sus solapas, la cinta de embalar y el letrero
  const id = p.parte(F.rr(x - 23, y - 18, 46, 18, 0.5), C, { plano: 3, canto: 1, sombra: 2 });
  p.tono(F.rr(x - 1.6, y - 17, 3.2, 16, 0), 1, id);
  p.tono(F.rr(x - 22, y - 4, 44, 3, 0), -1, id);
  p.parte(F.pol(x + 23, y - 18, x + 29, y - 21, x + 28, y - 22.4, x + 22, y - 19.4), C, { plano: 4, canto: [0, -1], sombra: 1 });
  p.letrero(tr('TUS COSAS'), x, y - 12.5, C.c[0], 'mini');
  // la carita triste que alguien ha pintado
  p.px(x + 17.5, y - 14.5, C.c[1]); p.px(x + 19.5, y - 14.5, C.c[1]); p.px(x + 17.5, y - 11.5, C.c[1]); p.px(x + 18.5, y - 12.5, C.c[1]); p.px(x + 19.5, y - 11.5, C.c[1]);
  return id;
}
// un archivador de tres cajones. abierto: el de arriba, con las carpetas asomando
function archivador(p, x, y, abierto) {
  const P = MAT, M = apagado(P.robot, '#58687c', 0.3);
  if (abierto) {
    const idA = p.parte(F.rr(x + 7, y - 39, 12, 11, 0.5), M, { plano: 3, canto: 1, sombra: 2 });
    for (let k = 0; k < 4; k++) { p.parte(F.rr(x + 9 + k * 2.2, y - 42 + (k % 2), 2, 4, 0), k % 2 ? P.carton : P.blanco, { plano: 4, linea: false, sombra: 0 }); }
    p.tonoPx(x + 17.5, y - 34.5, 2); p.tonoPx(x + 17.5, y - 33.5, -1); p.tono(F.rr(x + 8, y - 38, 10, 1, 0), 1, idA);
  }
  const id = p.parte(F.rr(x - 9, y - 40, 18, 40, 1), M, { plano: 3, canto: 1, sombra: 3 });
  for (const j of [-27, -14]) p.raya(x - 8, y + j, x + 8, y + j, null, -2);
  for (const j of [-34, -21, -8]) {
    if (abierto && j === -34) { p.plano(F.rr(x - 7, y - 38, 14, 9, 0), '#161c28'); continue; }
    p.tono(F.rr(x - 3, y + j, 6, 1.6, 0), -2, id); p.tono(F.rr(x - 3, y + j + 1.6, 6, 1, 0), 1, id);
    p.plano(F.rr(x - 2, y + j - 4, 4, 2, 0), '#d9dde6');
  }
  p.tono(F.rr(x - 8, y - 5, 16, 4, 0), -1, id);
  return id;
}
// una mampara de cubículo de w × h, con el canto de aluminio y lo que la gente clava en ella. sem cambia las notas
function mampara(p, x, y, w, h, sem = 1) {
  const P = MAT;
  for (const dx of [2, w - 4]) p.parte(F.rr(x + dx, y - 2, 3, 2, 0), P.acero, { plano: 2, linea: false, sombra: 0 });
  const id = p.parte(F.rr(x, y - h, w, h - 2, 1), P.tela, { plano: 3, canto: 1, sombra: 3 });
  p.tono(F.rr(x + 1, y - h + 1, w - 2, h - 4, 0), -1, id, (i, j) => hash2(i >> 1, j, sem) < 0.1);
  p.tono(F.rr(x + 1, y - 7, w - 2, 4, 0), -1, id);
  p.parte(F.rr(x - 1, y - h - 1.4, w + 2, 2.4, 0.5), P.acero, { plano: 4, canto: [1, -2], sombra: 1 });
  // notas adhesivas, una foto y un calendario
  const notas = ['#f4d024', '#ff9ec4', '#9ef07a', '#8cd0ee'];
  for (let k = 0; k < Math.floor(w / 9); k++) {
    const nx = x + 3 + Math.floor(hash(sem * 13 + k) * (w - 9)), ny = y - h + 4 + Math.floor(hash(sem * 7 + k * 5) * (h - 16)), c = notas[Math.floor(hash(sem + k * 3) * 4)];
    p.plano(F.rr(nx, ny, 4, 4, 0), c); p.px(nx + 3.5, ny + 3.5, mezcla(c, '#202836', 0.4)); p.px(nx + 1.5, ny + 1.5, mezcla(c, '#202836', 0.5)); p.px(nx + 2.5, ny + 1.5, mezcla(c, '#202836', 0.5));
  }
  return id;
}
function papelera(p, x, y) {
  const P = MAT;
  for (const [dx, dy] of [[-2, -11], [2, -12], [0, -13.4]]) p.parte(F.ov(x + dx, y + dy, 2.4, 2), P.blanco, { r: 2, sombra: 0 });
  const id = p.parte(F.pol(x - 5, y - 11, x + 5, y - 11, x + 4, y, x - 4, y), P.negro, { plano: 3, canto: 1, sombra: 2 });
  p.tono(F.rr(x - 4, y - 9, 8, 8, 0), 1, id, (i, j) => (i + j) % 2 === 0);
}
// la valla de obra: «EN CONSTRUCCIÓN», con sus franjas amarillas y negras y su luz naranja
function vallaObra(p, x, y) {
  const P = MAT, w = 104, t = tr('EN CONSTRUCCIÓN'), fuente = anchoTexto(t) > w - 18 ? 'mini' : 'normal';
  // las patas en aspa
  for (const cx of [x - w / 2 + 12, x + w / 2 - 12]) { p.parte(F.tr(cx - 5, y, cx + 3, y - 22, 1.3), P.acero, { plano: 2, sombra: 0 }); p.parte(F.tr(cx + 5, y, cx - 3, y - 22, 1.3), P.acero, { plano: 3, sombra: 1 }); }
  // el tablero de abajo (solo franjas) y el de arriba, con el letrero
  const b2 = F.rr(x - w / 2 + 4, y - 12, w - 8, 5, 0.5), id2 = p.parte(b2, P.valla, { plano: 3, canto: 1, sombra: 2 });
  p.tono(b2, -3, id2, (i, j) => (((i + j) % 10) + 10) % 10 < 5);
  const b1 = F.rr(x - w / 2, y - 29, w, 15, 1), id = p.parte(b1, P.valla, { plano: 3, canto: 1, sombra: 3 });
  for (const [a, b] of [[x - w / 2, 8], [x + w / 2 - 8, 8]]) p.tono(F.y(b1, F.rr(a, y - 29, b, 15, 0)), -3, id, (i, j) => (((i + j) % 8) + 8) % 8 < 4);
  p.letrero(t, x, y - (fuente === 'mini' ? 24 : 24.6), P.negro.c[1], fuente);
  // la baliza
  p.parte(F.rr(x - w / 2 + 3, y - 35, 6, 6, 2), P.capa, { r: 2.5, sombra: 0 }); p.tonoPx(x - w / 2 + 5.5, y - 33.5, 2);
  return id;
}
// un folio suelto. modo: 'suelo' (tirado, en perspectiva), 'aire' (volando, girado «a») o 'doblado'
function folio(p, x, y, modo = 'suelo', a = 0) {
  const P = MAT;
  if (modo === 'suelo') {
    const id = p.parte(F.pol(x - 5, y, x + 4, y, x + 6, y - 3, x - 3, y - 3), P.papel, { plano: 3, canto: [1, -1], linea: false, sombra: 0 });
    p.raya(x - 2, y - 1, x + 3, y - 1, null, -1);
    return id;
  }
  const f = modo === 'doblado' ? F.gira(F.pol(x - 3, y - 4, x + 3, y - 3, x + 2, y + 1, x + 3.6, y + 4, x - 3, y + 4), a, x, y) : F.gira(F.rr(x - 3, y - 4, 6, 8, 0), a, x, y);
  const id = p.parte(f, P.papel, { plano: 4, canto: [1, -2], linea: false, sombra: 0 });
  for (const d of [-1.6, 0.6]) { const [x1, y1] = giraP(x - 1.4, y + d, a, x, y), [x2, y2] = giraP(x + 1.6, y + d, a, x, y); p.raya(x1, y1, x2, y2, null, -2); }
  return id;
}
// el cartel amarillo de «suelo mojado» (alguien ha tirado el café): un caballete con su monigote que resbala
function cartelMojado(p, x, y) {
  const P = MAT;
  p.parte(F.pol(x + 1, y - 15, x + 6, y - 15, x + 9, y, x + 6, y), P.valla, { plano: 2, canto: [0, -1], sombra: 0 });
  const id = p.parte(F.pol(x - 3, y - 16, x + 3, y - 16, x + 6, y, x - 6, y), P.valla, { plano: 3, canto: 1, sombra: 1 });
  p.px(x + 0.5, y - 12.5, P.negro.c[1]);
  p.raya(x, y - 10, x - 1, y - 7, P.negro.c[1]); p.raya(x - 1, y - 7, x + 2, y - 5, P.negro.c[1]); p.raya(x - 2, y - 9, x + 2, y - 9, P.negro.c[1]); p.raya(x - 1, y - 7, x - 3, y - 4, P.negro.c[1]);
  p.tono(F.rr(x - 5, y - 3, 10, 1.4, 0), -3, id);
  return id;
}
// un mueble suelto en su propio dibujo. fn(p, x, y, …) lo dibuja con los pies en (0, 0)
function fotoMueble(w, h, ox, oy, fn, ...args) { const p = new Pincel(w, h, ox, oy); fn(p, 0, 0, ...args); return p.lienzo(); }
