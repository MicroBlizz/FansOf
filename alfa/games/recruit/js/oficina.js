// Fans of Recruit · LOS MUEBLES de las Oficinas de Microblizz (1): monitores de tubo, mesas con sus trastos, sillas, la planta,
// el dispensador de agua y la fotocopiadora. Cada mueble se dibuja con (x, y) = donde toca el suelo, así se pueden juntar
// varios en un mismo dibujo y se hacen sombra unos a otros. Muchos se podrán romper a tiros.
'use strict';

// un monitor de tubo. que: 'azul' (pantallazo con carita triste), 'grafica', 'cancelado', 'roto' o 'apagado'
function monitorCrt(p, x, y, que = 'azul') {
  const P = MAT, B = P.beige;
  // el pie, el costado (se ve un poco) y la carcasa
  p.parte(F.rr(x - 6, y - 2, 12, 2, 0.6), B, { plano: 2, canto: 1, sombra: 1 });
  p.parte(F.rr(x - 3, y - 4, 6, 3, 0), B, { plano: 2, canto: 1, sombra: 0 });
  p.parte(F.pol(x - 9, y - 20, x - 13, y - 18, x - 13, y - 7, x - 9, y - 4), B, { plano: 2, canto: [0, -1], sombra: 0 });
  const id = p.parte(F.rr(x - 10, y - 21, 21, 18, 2), B, { r: 2, sombra: 2 });
  for (let k = 0; k < 3; k++) p.tonoPx(x - 11.5, y - 16 + k * 3, -1);
  // el marco de la pantalla y la pantalla
  const pant = F.rr(x - 8, y - 19, 15, 12, 1.5);
  p.parte(pant, P.negro, { plano: 2, canto: [-1, 1], sombra: 0 });
  const dentro = F.gordo(pant, -1.2);
  if (que === 'azul') {
    p.plano(dentro, P.pantalla.c[2]);
    // la carita triste del pantallazo y dos renglones
    p.px(x - 4.5, y - 16.5, '#eaf2ff'); p.px(x - 4.5, y - 14.5, '#eaf2ff'); p.px(x - 2.5, y - 16.5, '#eaf2ff'); p.px(x - 1.5, y - 15.5, '#eaf2ff'); p.px(x - 2.5, y - 14.5, '#eaf2ff');
    p.raya(x - 5, y - 12, x + 3, y - 12, P.pantalla.c[4]); p.raya(x - 5, y - 10, x, y - 10, P.pantalla.c[4]);
    p.px(x + 4.5, y - 17.5, P.pantalla.c[4]);
  } else if (que === 'grafica') {
    p.plano(dentro, '#0f2a1c');
    p.raya(x - 6, y - 10, x - 3, y - 12, '#7be04a'); p.raya(x - 3, y - 12, x - 1, y - 11, '#7be04a'); p.raya(x - 1, y - 11, x + 4, y - 16, '#7be04a'); p.px(x + 4.5, y - 16.5, '#d0f8a0');
  } else if (que === 'cancelado') {
    p.plano(dentro, P.rojo.c[1]);
    p.raya(x - 4, y - 16, x + 2, y - 10, '#ffe9d6'); p.raya(x + 2, y - 16, x - 4, y - 10, '#ffe9d6');
  } else {
    p.plano(dentro, '#10141e');
    if (que === 'roto') {
      // el cristal reventado: un boquete y las rajas
      p.plano(F.y(dentro, F.pol(x - 3, y - 17, x + 1, y - 16, x + 3, y - 13, x, y - 11, x - 4, y - 12, x - 2, y - 14)), '#04060c');
      for (const [a, b] of [[-6, -18], [5, -17], [5, -9], [-6, -9], [-7, -14]]) p.raya(x - 1, y - 14, x + a, y + b, '#8a94ac');
      p.px(x - 1.5, y - 14.5, '#e6eeff');
    } else { p.px(x - 5.5, y - 17.5, '#2a3040'); p.px(x - 4.5, y - 17.5, '#2a3040'); p.px(x - 5.5, y - 16.5, '#2a3040'); }
  }
  // el brillo del cristal, el piloto y los botones
  if (que !== 'roto') { p.tonoPx(x - 6.5, y - 17.5, 1); }
  p.px(x + 8.5, y - 5.5, que === 'apagado' || que === 'roto' ? P.negro.c[3] : '#7be04a'); p.tonoPx(x + 6.5, y - 5.5, -1); p.tonoPx(x + 4.5, y - 5.5, -1);
  return id;
}
// trastos de encima de la mesa. (x, y) = donde se apoyan
function teclado(p, x, y) {
  const id = p.parte(F.pol(x - 7, y, x + 6, y, x + 8, y - 3, x - 5, y - 3), MAT.beige, { plano: 4, canto: [1, -2], linea: false, sombra: 1 });
  for (let i = -4; i < 7; i += 2) p.tonoPx(x + i + 0.5, y - 1.5, -1);
  return id;
}
function monton(p, x, y, n = 3) {   // un montón de papeles
  for (let k = 0; k < n; k++) p.parte(F.rr(x - 5 + (k % 2), y - 2 - k * 2, 10, 2, 0), MAT.blanco, { plano: 5, canto: [0, -2], linea: false, sombra: k ? 0 : 1 });
}
function tazaMesa(p, x, y) {
  p.parte(F.rr(x - 2, y - 5, 5, 5, 1), MAT.blanco, { r: 1.5, sombra: 1 });
  p.px(x + 3.5, y - 3.5, MAT.blanco.c[2]); p.px(x + 3.5, y - 2.5, MAT.blanco.c[2]); p.raya(x - 1, y - 4.6, x + 2, y - 4.6, '#6b3a1c');
}
function flexo(p, x, y) {   // la lámpara de mesa
  const P = MAT;
  p.parte(F.rr(x - 3, y - 1.6, 6, 1.6, 0.5), P.negro, { plano: 3, sombra: 1, linea: false });
  p.raya(x, y - 2, x - 3, y - 9, P.negro.c[3]); p.raya(x - 3, y - 9, x + 3, y - 14, P.negro.c[3]);
  p.parte(F.pol(x + 1, y - 16, x + 6, y - 15, x + 8, y - 11, x + 2, y - 12), apagado(P.rojo, '#445264', 0.2), { r: 1.5, sombra: 1 });
  p.px(x + 5.5, y - 11.5, '#fff6b8'); p.px(x + 6.5, y - 11.5, '#fff6b8');
}
// una mesa de oficina de w de ancho, con su cajonera a la derecha. (x, y) = la esquina de abajo a la izquierda
function mesaOficina(p, x, y, w) {
  const P = MAT, alto = 21;
  // las patas, el faldón y la cajonera con sus tres cajones
  p.parte(F.rr(x + 2, y - alto, 2.4, alto, 0), P.acero, { plano: 2, canto: 1, linea: false, sombra: 0 });
  p.parte(F.rr(x + 5, y - alto + 2, w - 22, 9, 0), P.tela, { plano: 2, canto: [1, -1], sombra: 0 });
  const idC = p.parte(F.rr(x + w - 17, y - alto + 1, 15, alto - 1, 0.6), P.robot, { plano: 2, canto: 1, sombra: 1 });
  for (const j of [7, 13]) p.raya(x + w - 16, y - alto + j, x + w - 3.4, y - alto + j, null, -1);
  for (const j of [4, 10, 16]) { p.tonoPx(x + w - 10.5, y - alto + j + 0.5, 2); p.tonoPx(x + w - 9.5, y - alto + j + 0.5, 2); p.tonoPx(x + w - 8.5, y - alto + j + 0.5, 1); }
  // el tablero
  const idT = p.parte(F.rr(x, y - alto - 3, w, 3.4, 0.6), P.mesa, { plano: 4, canto: [1, -2], sombra: 2 });
  return { idT, idC, y: y - alto - 3 };
}
// una silla de oficina con ruedas, vista de lado. tumbada: caída en el suelo
function sillaOficina(p, x, y, tumbada) {
  const P = MAT, T = tumbada ? f => F.gira(f, 1.45, x, y - 3) : f => f;
  // la estrella con sus ruedas, la columna, el asiento, el respaldo y el reposabrazos
  for (const dx of [-7, 0, 7]) p.parte(T(F.ov(x + dx, y - 1.4, 1.5, 1.5)), P.negro, { plano: 2, sombra: 0 });
  p.parte(T(F.rr(x - 7, y - 4, 14, 1.6, 0.5)), P.negro, { plano: 3, canto: [1, -1], linea: false, sombra: 0 });
  p.parte(T(F.rr(x - 1, y - 11, 2.4, 8, 0)), P.acero, { plano: 3, canto: 1, linea: false, sombra: 0 });
  p.parte(T(F.rr(x - 8, y - 15, 16, 4.4, 2)), P.tela, { r: 2, sombra: 1 });
  p.parte(T(F.pol(x - 9, y - 31, x - 5, y - 32, x - 4, y - 16, x - 8, y - 15)), P.tela, { r: 2, sombra: 2 });
  p.parte(T(F.rr(x - 5, y - 20, 9, 1.6, 0.5)), P.negro, { plano: 3, linea: false, sombra: 1 });
  p.raya(...(tumbada ? [x + 14, y - 5, x + 17, y - 5] : [x + 3, y - 18, x + 3, y - 15]), P.negro.c[3]);
}
// el ficus de toda oficina. sem cambia las hojas; alto, cuánto sube
function plantaFicus(p, x, y, sem = 1, alto = 30) {
  const P = MAT;
  // el tiesto con su borde y la tierra
  p.parte(F.pol(x - 6, y - 10, x + 6, y - 10, x + 4.4, y, x - 4.4, y), P.maceta, { r: 2.5, sombra: 2 });
  p.parte(F.rr(x - 7, y - 12, 14, 3, 1), P.maceta, { r: 1.5, sombra: 1 });
  p.raya(x - 5, y - 12, x + 5, y - 12, P.cuero.c[0]);
  // el tronco y las hojas: las de detrás, más oscuras
  p.parte(F.tr(x, y - 12, x + 1, y - alto + 6, 1.3, 1), P.cuero, { plano: 2, sombra: 0 });
  const hojas = [];
  for (let k = 0; k < 22; k++) {
    const a = hash(sem * 31 + k) * Math.PI * 2, r = 3 + hash(sem * 17 + k * 3) * (alto * 0.36), cx = x + 1 + Math.cos(a) * r * 1.05, cy = y - alto + Math.sin(a) * r * 0.8;
    hojas.push([cy + (k < 8 ? -100 : 0), cx, cy, a, k]);
  }
  hojas.sort((u, v) => u[0] - v[0]);
  for (const [, cx, cy, a, k] of hojas) {
    const l = 4.4 + hash(sem + k * 7) * 2.4, id = p.parte(F.ov(cx, cy, l, 2.3, a * 0.5 + 0.6), P.planta, { r: 2.2, sombra: 1 });
    if (k < 8) p.tono(F.ov(cx, cy, l, 2.3, a * 0.5 + 0.6), -1, id);
    else if (hash(sem + k) < 0.5) { const [u, v] = [Math.cos(a * 0.5 + 0.6), Math.sin(a * 0.5 + 0.6)]; p.raya(cx - u * l * 0.6, cy - v * l * 0.6, cx + u * l * 0.6, cy + v * l * 0.6, null, 1); }
  }
}
// el dispensador de agua, con su garrafa azul y sus dos grifos
function enfriador(p, x, y) {
  const P = MAT, B = apagado(P.blanco, '#58687c', 0.12);
  const id = p.parte(F.rr(x - 7, y - 27, 14, 27, 1.5), B, { r: 2, sombra: 2 });
  // el hueco de los grifos, los grifos (frío y caliente) y la bandeja
  p.plano(F.rr(x - 5, y - 23, 10, 8, 1), P.blanco.c[1]);
  p.px(x - 2.5, y - 21.5, P.pantalla.c[4]); p.px(x - 2.5, y - 20.5, P.pantalla.c[2]); p.px(x + 2.5, y - 21.5, P.rojo.c[4]); p.px(x + 2.5, y - 20.5, P.rojo.c[2]);
  p.raya(x - 4, y - 16, x + 4, y - 16, P.blanco.c[0]);
  p.raya(x - 5, y - 9, x + 5, y - 9, null, -1); p.tonoPx(x + 4.5, y - 4.5, -1);
  // el cuello y la garrafa: se ve el agua, su nivel y el reflejo
  p.parte(F.rr(x - 4, y - 30, 8, 3.4, 1), P.blanco, { plano: 3, canto: 1, sombra: 1 });
  const garrafa = F.fun(2.4, F.rr(x - 6.5, y - 47, 13, 15, 3.4), F.rr(x - 2.6, y - 33, 5.2, 4, 1));
  const idG = p.parte(garrafa, P.agua, { r: 4.5, sombra: 0 });
  p.tono(F.y(garrafa, F.rr(x - 8, y - 48, 16, 5, 0)), 1, idG);
  p.raya(x - 5, y - 43, x + 5, y - 43, null, 1);
  p.tono(F.rr(x - 4.4, y - 41, 1.2, 7, 0), 2, idG); p.tonoPx(x + 2.5, y - 37.5, 1); p.tonoPx(x + 0.5, y - 40.5, 1);
  for (const j of [-45, -39]) p.raya(x - 6, y + j, x + 6, y + j, null, -1);
  return id;
}
// la fotocopiadora: la tapa levantada, el panel con sus pilotos y la bandeja que escupe folios (atascada, claro)
function fotocopiadora(p, x, y) {
  const P = MAT, B = P.beige;
  // la bandeja de salida con sus folios
  p.parte(F.pol(x - 18, y - 22, x - 28, y - 19, x - 28, y - 17, x - 18, y - 17), B, { plano: 2, canto: 1, sombra: 1 });
  p.parte(F.pol(x - 19, y - 23.4, x - 27, y - 21, x - 27, y - 19.6, x - 19, y - 22), P.blanco, { plano: 5, linea: false, sombra: 0 });
  // la tapa levantada (por detrás) y el cuerpo
  p.parte(F.gira(F.rr(x - 17, y - 35, 30, 3.4, 1), -0.42, x - 17, y - 32), B, { plano: 3, canto: 1, sombra: 0 });
  const id = p.parte(F.rr(x - 18, y - 31, 36, 30, 2), B, { r: 2.5, sombra: 2 });
  // el cristal, el panel, los cajones del papel y las ruedas
  p.parte(F.rr(x - 15, y - 30, 20, 2, 0), P.cian, { plano: 2, linea: false, sombra: 0 });
  p.parte(F.rr(x + 6, y - 30, 11, 6, 1), P.negro, { plano: 2, canto: [-1, 1], sombra: 0 });
  p.px(x + 8.5, y - 27.5, '#7be04a'); p.px(x + 10.5, y - 27.5, '#7be04a'); p.px(x + 12.5, y - 27.5, P.rojo.c[3]); p.px(x + 14.5, y - 27.5, P.rojo.c[4]);
  p.px(x + 8.5, y - 25.5, P.negro.c[4]); p.px(x + 10.5, y - 25.5, P.negro.c[4]); p.px(x + 12.5, y - 25.5, P.negro.c[4]);
  p.raya(x - 17, y - 22, x + 17, y - 22, null, -1);
  for (const j of [-16, -8]) { p.raya(x - 15, y + j, x + 15, y + j, null, -1); p.tono(F.rr(x - 4, y + j + 2, 8, 1.6, 0), -2, id); p.tono(F.rr(x - 4, y + j + 3.6, 8, 1, 0), 1, id); }
  p.tono(F.rr(x - 16, y - 20, 2, 18, 0), -1, id, (i, j) => j % 2 === 0);
  for (const dx of [-14, 14]) p.parte(F.ov(x + dx, y - 0.6, 1.8, 1.6), P.negro, { plano: 2, sombra: 0 });
  return id;
}
