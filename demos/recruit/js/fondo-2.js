// Fans of Recruit · EL FONDO de las Oficinas de Microblizz (2): la pared del fondo con sus ventanales, persianas y pilares,
// el techo con sus fluorescentes, los carteles de la empresa y el suelo de moqueta con la luz que entra por las ventanas
// (con la sombra de los marcos). Todo se pinta con el pincel, así que usa los mismos tonos y las mismas sombras que los
// personajes, solo que más frío y apagado. El escenario se pinta por trozos de pantalla, uno detrás de otro.
'use strict';

// las alturas de la oficina, en píxeles desde arriba: techo, ventana (de V0 a V1), rodapié y por dónde se anda
const OFI = { ALTO: 240, TECHO: 14, V0: 24, V1: 124, ZOCALO: 160, SUELO: 192, LUZ0: 164, LUZ1: 222, SESGO: 0.55 };

// un cristal reventado en (cx, cy): el boquete con su borde brillante y las rajas que salen de él
function cristalRoto(p, cx, cy, r, sem) {
  const C = '#e9f8fc', C2 = '#b9e0ee', pts = [], n = 9;
  for (let k = 0; k < n; k++) { const a = k / n * 6.283 + hash(sem + k) * 0.5, q = r * (0.55 + hash(sem * 3 + k) * 0.6); pts.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q * 0.9]); }
  for (let k = 0; k < n; k++) { const [x1, y1] = pts[k], [x2, y2] = pts[(k + 1) % n]; p.raya(x1, y1, x2, y2, C); }
  for (let k = 0; k < n; k += 1) {
    if (hash(sem * 7 + k) < 0.25) continue;
    const [x1, y1] = pts[k], a = Math.atan2(y1 - cy, x1 - cx) + (hash(sem + k * 5) - 0.5) * 0.5, l = r * (0.9 + hash(sem * 11 + k) * 1.5), x2 = x1 + Math.cos(a) * l, y2 = y1 + Math.sin(a) * l;
    p.raya(x1, y1, x2, y2, C2);
    if (hash(sem * 13 + k) < 0.5) p.raya(x1 + (x2 - x1) * 0.55, y1 + (y2 - y1) * 0.55, x1 + (x2 - x1) * 0.55 + Math.cos(a + 0.9) * l * 0.4, y1 + (y2 - y1) * 0.55 + Math.sin(a + 0.9) * l * 0.4, C2);
  }
}
// un ventanal. o: { persiana: cuánto baja (0 a 1), rota: true = con lamas caídas, agujero: [de 0 a 1 a lo ancho, a lo alto] = cristal roto }
function ventanaOficina(p, x, w, o) {
  const P = MAT, y0 = OFI.V0, y1 = OFI.V1, h = y1 - y0, mx = x + Math.round(w / 2) - 1;
  p.hueco(F.rr(x, y0, w, h, 0));
  // el marco, el parteluz y el travesaño
  p.parte(F.menos(F.rr(x - 3, y0 - 3, w + 6, h + 6, 1), F.rr(x, y0, w, h, 0)), P.marco, { plano: 3, canto: 1, sombra: 2 });
  p.parte(F.rr(mx, y0, 3, h, 0), P.marco, { plano: 2, canto: 1, linea: false, sombra: 0 });
  p.parte(F.rr(x, y0 + 34, w, 3, 0), P.marco, { plano: 2, canto: 1, linea: false, sombra: 0 });
  if (o.agujero) {
    const ax = x + w * o.agujero[0], ay = y0 + h * o.agujero[1];
    cristalRoto(p, ax, ay, 8, Math.round(o.xa === undefined ? x : o.xa));
    for (let k = 0; k < 6; k++) p.px(ax - 9 + k * 3.4 + hash(k) * 2, y1 - 0.5 - (k % 2), k % 2 ? '#e9f8fc' : '#b9e0ee');
  }
  // la persiana: el cajón, las lamas (cada una con su luz y su sombra; entre lama y lama se cuela la luz) y los cordones
  const fin = y0 + 4 + Math.round((h - 4) * (o.persiana || 0) / 3) * 3;
  p.parte(F.rr(x, y0, w, 4, 0), P.persiana, { plano: 2, canto: 1, linea: false, sombra: 0 });
  let k = 0;
  for (let y = y0 + 4; y < fin; y += 3, k++) {
    const quedan = (fin - y) / 3;
    let f = F.rr(x, y, w, 2, 0);
    if (o.rota && quedan <= 5) {
      // las últimas lamas, descolgadas de un lado: caen en abanico
      const cae = (6 - quedan) * 2.6;
      f = F.pol(x, y, x + w, y + cae, x + w, y + cae + 2, x, y + 2);
    } else if (o.rota && k >= 9 && k <= 11) {
      // un boquete: tres lamas dobladas
      const a = x + w * 0.2, b = x + w * 0.42;
      f = F.menos(f, F.rr(a, y - 1, b - a, 4, 0));
      p.parte(F.pol(a - 1, y, a + 7, y + 3 + (k - 9), a + 7, y + 5 + (k - 9), a - 1, y + 2), P.persiana, { plano: 2, canto: [1, -1], linea: false, sombra: 0 });
    }
    p.parte(f, P.persiana, { plano: 2, canto: [1, -1], linea: false, sombra: 0 });
  }
  if (fin > y0 + 8) for (const cx of [x + 12, x + w - 14]) p.raya(cx, y0 + 4, cx, fin - 1, null, -1);
  const tx = x + w - 6, ty = Math.min(y1 - 8, fin + 16);
  p.raya(tx, y0 + 4, tx, ty, P.persiana.c[1]); p.px(tx, ty + 1, P.persiana.c[4]); p.px(tx, ty + 2, P.persiana.c[2]);
  // el alféizar y, debajo, el radiador con su tubo
  p.parte(F.rr(x - 6, y1 + 1, w + 12, 4, 0.5), P.pilar, { plano: 4, canto: 1, sombra: 3 });
  const rx = x + 10, rw = w - 20, idR = p.parte(F.rr(rx, 134, rw, 17, 1.5), apagado(P.beige, '#445264', 0.42), { plano: 3, canto: 1, sombra: 2 });
  for (let i = rx + 3; i < rx + rw - 2; i += 3) p.raya(i, 136, i, 148, null, -1);
  p.tono(F.rr(rx + 1, 135, rw - 2, 1, 0), 1, idR);
  p.parte(F.rr(rx + rw - 1, 139, 4, 3, 1), P.oscuro, { plano: 4, canto: 1, sombra: 0 });
  p.raya(rx + rw + 3, 141, rx + rw + 3, 154, P.marco.c[2]);
}
// un pilar de hormigón. que: 'extintor', 'camara' o nada
function pilarOficina(p, x, que, X0 = 0) {
  const P = MAT, w = 20;
  const id = p.parte(F.rr(x, OFI.TECHO, w, OFI.ZOCALO - OFI.TECHO, 0), P.pilar, { plano: 3, canto: 1, sombra: 4 });
  p.parte(F.rr(x - 1, OFI.TECHO, w + 2, 6, 0), P.pilar, { plano: 2, canto: 1, sombra: 2 });
  p.parte(F.rr(x - 2, 148, w + 4, 12, 0), P.pilar, { plano: 2, canto: 1, sombra: 2 });
  // la arista achaflanada, la mugre de abajo (una mancha de borde irregular) y una grieta
  p.tono(F.rr(x + 3, 21, 1, 126, 0), 1, id); p.tono(F.rr(x + w - 4, 21, 1, 126, 0), -1, id);
  p.tono(F.rr(x + 1, 120, w - 2, 28, 0), -1, id, (i, j) => j > 141 - ruidoSuave(i + X0, 3, 5, 7) * 16);
  const gx = x + 6 + Math.floor(hash(x + X0) * 6);
  p.raya(gx, 56, gx + 2, 63, null, -1); p.raya(gx + 2, 63, gx + 1, 69, null, -1); p.raya(gx + 1, 69, gx + 4, 76, null, -1); p.tonoPx(gx + 3, 64, 1);
  if (que === 'extintor') {
    // el cartel y el extintor colgado
    p.parte(F.rr(x + 5, 92, 10, 9, 1), apagado(P.blanco, '#58687c', 0.2), { plano: 4, canto: 1, sombra: 1 });
    const R = apagado(P.rojo, '#445264', 0.35);
    for (const [a, b, n] of [[9.5, 94.5, 2], [10.5, 95.5, 2], [8.5, 96.5, 2], [9.5, 96.5, 3], [10.5, 96.5, 2], [9.5, 97.5, 2], [10.5, 97.5, 1], [8.5, 97.5, 1]]) p.px(x + a, b, R.c[n]);
    p.parte(F.rr(x + 6, 110, 8, 18, 3), R, { r: 3, sombra: 2 });
    p.parte(F.rr(x + 8, 106, 4, 4, 1), P.oscuro, { plano: 4, canto: 1, sombra: 0 });
    p.raya(x + 12, 107, x + 15, 109, P.oscuro.c[1]); p.raya(x + 15, 109, x + 15, 118, P.oscuro.c[1]);
    p.tono(F.rr(x + 7.5, 116, 5, 3, 0), 2);
  } else if (que === 'camara') {
    // la cámara que todo lo ve, con su piloto rojo, y un interfono más abajo
    p.parte(F.rr(x + 8, 30, 4, 5, 0), P.oscuro, { plano: 3, canto: 1, sombra: 1 });
    p.parte(F.pol(x - 4, 36, x + 12, 33, x + 13, 39, x - 3, 43), P.oscuro, { r: 2, sombra: 2 });
    p.plano(F.ov(x - 2.4, 39.6, 1.8, 2.4), P.cian.c[1]); p.px(x - 2.5, 38.5, P.cian.c[4]);
    p.px(x + 9.5, 35.5, P.rojo.c[3]);
    p.parte(F.rr(x + 6, 100, 8, 11, 1), apagado(P.beige, '#445264', 0.3), { plano: 3, canto: 1, sombra: 1 });
    for (const [a, b] of [[8.5, 102.5], [9.5, 102.5], [10.5, 102.5], [8.5, 104.5], [10.5, 104.5]]) p.px(x + a, b, P.oscuro.c[1]);
    p.px(x + 9.5, 107.5, P.tablon.c[4]);
  }
  return id;
}
// el tablón de seguridad de Microblizz: «DÍAS SIN CANCELAR UN JUEGO: 0»
function tablonDias(p, x, y) {
  const P = MAT, w = 108, h = 34, id = p.parte(F.rr(x, y, w, h, 2), P.tablon, { plano: 3, canto: 1, sombra: 3 });
  p.tono(F.rr(x + 2, y + 2, w - 4, 12, 0), -1, id);
  p.letrero(tr('DÍAS SIN CANCELAR'), x + w / 2, y + 5, '#d2e6da');
  p.letrero(tr('UN JUEGO:'), x + 69 - anchoTexto(tr('UN JUEGO:')) / 2, y + 21, '#d2e6da');
  // la casilla del número, con su cero bien gordo, y los tornillos
  p.parte(F.rr(x + 74, y + 16, 26, 14, 1), apagado(P.blanco, '#58687c', 0.15), { plano: 4, canto: 1, sombra: 0 });
  p.letrero('0', x + 87, y + 18.5, apagado(P.rojo, '#445264', 0.2).c[2], 'gorda');
  for (const [a, b] of [[3, 3], [w - 4, 3], [3, h - 4], [w - 4, h - 4]]) p.remache(x + a + 0.5, y + b + 0.5);
}
function relojPared(p, cx, cy) {
  const P = MAT;
  p.parte(F.ov(cx, cy, 9, 9), P.oscuro, { r: 2, sombra: 3 });
  p.plano(F.ov(cx, cy, 6.6, 6.6), '#c4cad6'); p.plano(F.ov(cx - 0.6, cy - 0.6, 5.4, 5.4), '#d8dde6');
  for (let k = 0; k < 12; k += 3) { const a = k * Math.PI / 6; p.px(cx + Math.cos(a) * 5.4, cy + Math.sin(a) * 5.4, P.marco.c[1]); }
  p.raya(cx, cy, cx + 3, cy - 2, P.marco.c[0]); p.raya(cx, cy, cx - 1, cy - 5, P.marco.c[0]); p.px(cx, cy, P.rojo.c[2]);
}
// el cartel de motivación: un amanecer y la palabra de moda
function cartelSinergia(p, x, y) {
  const P = MAT, w = 40, h = 33;
  p.parte(F.rr(x, y, w, h, 0), P.oscuro, { plano: 2, canto: 1, sombra: 3 });
  const C = ['#c98a4e', '#d6a868', '#e2c488'];
  for (let j = 0; j < 18; j++) for (let i = 0; i < w - 4; i++) p.px(x + 2.5 + i, y + 2.5 + j, C[Math.min(2, Math.floor(j / 6))]);
  p.plano(F.ov(x + 26, y + 15, 5, 5), '#f2e6c0');
  p.plano(F.y(F.pol(x + 2, y + 20, x + 13, y + 8, x + 20, y + 15, x + 26, y + 11, x + 38, y + 20), F.rr(x + 2, y + 2, w - 4, 18, 0)), '#3d4f7a');
  p.plano(F.y(F.pol(x + 10, y + 11, x + 13, y + 8, x + 16, y + 11, x + 14, y + 12, x + 12, y + 11), F.rr(x + 2, y + 2, w - 4, 18, 0)), '#dfe4ec');
  p.letrero(tr('SINERGIA'), x + w / 2, y + 24, '#cfd6e2', 'mini');
}
// la pizarra de la reunión: los beneficios suben, los juegos bajan
function pizarraReunion(p, x, y) {
  const P = MAT, w = 34, h = 28;
  p.parte(F.rr(x, y, w, h, 1), P.oscuro, { plano: 5, canto: 1, sombra: 3 });
  p.plano(F.rr(x + 2, y + 2, w - 4, h - 5, 0), '#d4dae4');
  p.raya(x + 5, y + 20, x + 5, y + 4, P.marco.c[2]); p.raya(x + 5, y + 20, x + 30, y + 20, P.marco.c[2]);
  // la raya verde que sube (con su flecha y su «$») y la roja que baja (con su mando de juego)
  const V = '#2f8a4c', R = '#b8424a';
  p.raya(x + 6, y + 17, x + 12, y + 14, V); p.raya(x + 12, y + 14, x + 17, y + 15, V); p.raya(x + 17, y + 15, x + 26, y + 6, V);
  p.px(x + 24.5, y + 5.5, V); p.px(x + 25.5, y + 5.5, V); p.px(x + 26.5, y + 5.5, V); p.px(x + 26.5, y + 6.5, V); p.px(x + 26.5, y + 7.5, V);
  p.raya(x + 6, y + 7, x + 13, y + 9, R); p.raya(x + 13, y + 9, x + 19, y + 15, R); p.raya(x + 19, y + 15, x + 27, y + 18, R);
  p.letrero('$', x + 30, y + 3, V, 'mini');
  for (const [a, b] of [[28, 14], [29, 14], [30, 14], [31, 14], [27, 15], [28, 15], [31, 15], [32, 15], [27, 16], [32, 16]]) p.px(x + a + 0.5, y + b + 0.5, R);
  p.parte(F.rr(x + 3, y + h - 3, w - 6, 2, 0), P.oscuro, { plano: 3, linea: false, sombra: 1 });
  p.px(x + 9.5, y + h - 3.5, R); p.px(x + 10.5, y + h - 3.5, R); p.px(x + 11.5, y + h - 3.5, P.oscuro.c[0]);
}
// letras grandes atornilladas a la pared (cada punto de la letra, un cuadrado de e × e). alReves: escritas en espejo, para
// los dibujos que el juego pinta mirando al otro lado
function letrasPared(p, txt, cx, y, e, M, nv = 4, alReves) {
  const t = preparaTexto(txt, 'normal'), W = anchoTexto(txt) * e, pts = [], pon = (c, r) => pts.push(F.rr(alReves ? cx + W / 2 - (u + c + 1) * e : cx - W / 2 + (u + c) * e, y + r * e, e, e, 0));
  let u = 0;
  for (const ch of t) {
    const g = glifo(ch, 'normal');
    g.forEach((fila, r) => { for (let c = 0; c < fila.length; c++) if (fila[c] === '#') pon(c, r); });
    if (g.marca) for (const [r, c] of g.marca) pon(c, r);
    u += g[0].length + 1;
  }
  for (let k = 0; k < pts.length; k += 12) p.parte(F.un(...pts.slice(k, k + 12)), M, { plano: nv, canto: [1, -1], linea: false, sombra: 1 });
}
// los valores de la empresa, en su marco
function cartelValores(p, x, y) {
  const P = MAT, w = 76, h = 46;
  p.parte(F.rr(x, y, w, h, 1), P.oscuro, { plano: 2, canto: 1, sombra: 3 });
  p.plano(F.rr(x + 2, y + 2, w - 4, h - 4, 0), '#cfd6e2');
  p.plano(F.rr(x + 2, y + 2, w - 4, 11, 0), apagado(P.pantalla, '#445264', 0.3).c[2]);
  p.letrero(tr('NUESTROS VALORES'), x + w / 2, y + 5, '#e4ecf8', 'mini');
  [tr('1. COMPRAR'), tr('2. CERRAR'), tr('3. REPETIR')].forEach((s, k) => p.letrero(s, x + 8 + anchoTexto(s) / 2, y + 17 + k * 9.4, P.marco.c[0]));
}
// el ascensor del final: solo para ejecutivos
function ascensorOficina(p, x) {
  const P = MAT, w = 56, y0 = 72;
  p.parte(F.rr(x - 5, y0 - 6, w + 10, OFI.ZOCALO - y0 + 6, 1), P.pilar, { plano: 2, canto: 1, sombra: 3 });
  const idA = p.parte(F.rr(x, y0, w, OFI.ZOCALO - y0, 0), P.oscuro, { plano: 4, canto: 1, sombra: 0 });
  p.raya(x + w / 2, y0 + 1, x + w / 2, OFI.ZOCALO - 2, null, -2); p.tono(F.rr(x + w / 2 + 1, y0 + 1, 1, OFI.ZOCALO - y0 - 2, 0), 1, idA);
  for (const dx of [6, w / 2 + 6]) p.tono(F.rr(x + dx, y0 + 6, w / 2 - 12, OFI.ZOCALO - y0 - 14, 1), -1, idA);
  // el indicador de planta, el botón y el letrero
  p.parte(F.rr(x + w / 2 - 9, y0 - 16, 18, 9, 1), P.oscuro, { plano: 1, canto: 1, sombra: 1 });
  p.letrero('99', x + w / 2, y0 - 14, '#ff5a5a', 'mini');
  p.parte(F.rr(x + w + 8, 112, 6, 9, 1), apagado(P.beige, '#445264', 0.3), { plano: 3, canto: 1, sombra: 1 }); p.px(x + w + 10.5, 115.5, P.rojo.c[3]);
  const s = tr('SOLO EJECUTIVOS'), sw = anchoTexto(s, 1, 'mini') + 8;
  p.parte(F.rr(x + w / 2 - sw / 2, y0 - 32, sw, 11, 1), apagado(P.oro, '#445264', 0.35), { plano: 3, canto: 1, sombra: 2 });
  p.letrero(s, x + w / 2, y0 - 29, P.marco.c[0], 'mini');
}
// un fluorescente del techo. roto: cuelga de un lado y está apagado
function fluorescente(p, x, roto, idPared) {
  const P = MAT;
  if (roto) {
    p.raya(x + 4, OFI.TECHO, x + 3, OFI.TECHO + 5, P.oscuro.c[0]);
    p.parte(F.pol(x, 18, x + 39, 30, x + 38, 35, x - 1, 23), P.pilar, { plano: 2, canto: 1, sombra: 2 });
    p.plano(F.pol(x + 2, 22.4, x + 36, 33, x + 36, 34.4, x + 2, 23.8), '#56687c');
    p.raya(x + 36, 30, x + 39, 26, P.oscuro.c[0]); p.raya(x + 39, 26, x + 38, 21, P.oscuro.c[0]);
    return;
  }
  p.parte(F.rr(x, OFI.TECHO - 5, 40, 7, 1), P.pilar, { plano: 3, canto: 1, sombra: 0 });
  p.plano(F.rr(x + 3, OFI.TECHO + 1, 34, 2, 0), '#d6f2f8'); p.plano(F.rr(x + 3, OFI.TECHO + 3, 34, 1, 0), '#9ccfe0');
  // la luz que cae sobre la pared: un abanico liso, un punto más claro
  p.tono(F.pol(x - 2, OFI.TECHO + 4, x + 42, OFI.TECHO + 4, x + 58, 74, x - 18, 74), 1, idPared);
}

/* La pared y el suelo de un trozo de oficina de W píxeles de ancho que empieza en X0.
   tramos: lo que hay de izquierda a derecha, con su x de verdad →
   { t: 'ventana', x, w, persiana, rota, agujero } · { t: 'pilar', x, que } · { t: 'pared', x, w, que: 0 | 1 | 2 } · { t: 'ascensor', x } */
function pintaOficina(W, tramos, X0 = 0) {
  const P = MAT, p = new Pincel(W, OFI.ALTO, 0, 0), Z = OFI.ZOCALO, T = tramos.map(t => Object.assign({}, t, { x: t.x - X0, xa: t.x })).filter(t => t.x < W + 80 && t.x + (t.w || 60) > -80);
  /* ---------- el suelo: moqueta ---------- */
  const suelo = F.rr(0, Z, W, OFI.ALTO - Z, 0), idS = p.parte(suelo, P.moqueta, { plano: 2, linea: false, sombra: 0 });
  // más oscuro pegado a la pared y, con el borde irregular, en la parte de abajo
  p.tono(F.rr(0, Z, W, 3, 0), -1, idS);
  p.tono(F.rr(0, 206, W, OFI.ALTO - 206, 0), -1, idS, (i, j) => j > 214 - ruidoSuave(i + X0, 0, 14, 31) * 6);
  // la luz de cada ventana: el dibujo de la ventana tumbado en el suelo, con la sombra del parteluz y del travesaño
  const largo = OFI.LUZ1 - OFI.LUZ0;
  for (const t of T) if (t.t === 'ventana') {
    const mid = t.x + Math.round(t.w / 2), cubre = t.persiana || 0;
    // ¿le da el sol a este punto del suelo? m = margen: con 2 sale un poco más grande (la penumbra del borde)
    const sol = m => (i, j) => {
      const v = (j - OFI.LUZ0) / largo, u = i - (j - OFI.LUZ0) * OFI.SESGO;
      if (u < t.x - m || u > t.x + t.w + m || j < OFI.LUZ0 - m || v > 1 - cubre + m * 0.02) return false;
      return !(Math.abs(u - mid) < 2.2 - m || Math.abs(v - 0.66) < 0.05 - m * 0.012);
    };
    const zona = F.rr(t.x - 4, OFI.LUZ0 - 3, t.w + largo * OFI.SESGO + 10, largo + 6, 0);
    p.tono(zona, 1, idS, sol(1.6));
    p.tono(zona, 1, idS, sol(0));
  }
  // las juntas de las losetas de moqueta (las de lado a lado se juntan con la distancia) y el pelillo
  for (const y of [166, 173, 182, 194, 209, 227]) p.tono(F.rr(0, y, W, 1, 0), -1, idS, (i, j) => hash2((i + X0) >> 3, j, 5) < 0.86);
  for (let x0 = -(((X0 % 34) + 34) % 34) - 34; x0 < W + 80; x0 += 34) for (let j = Z + 1; j < OFI.ALTO; j++) if (hash2(x0 + X0, j >> 2, 3) < 0.8) p.tonoPx(x0 - (j - Z) * 0.5 + 0.5, j + 0.5, -1);
  p.tono(suelo, -1, idS, (i, j) => hash2(i + X0, j, 21) < 0.03);
  p.tono(suelo, 1, idS, (i, j) => hash2(i + X0, j, 22) < 0.015);
  /* ---------- la pared ---------- */
  const pared = F.rr(0, OFI.TECHO, W, Z - OFI.TECHO, 0), idP = p.parte(pared, P.pared, { plano: 3, linea: false, sombra: 0 });
  // manchas de humedad (lisas, de borde recortado), la sombra del techo y la mugre que sube desde el rodapié
  p.tono(pared, -1, idP, (i, j) => ruidoSuave(i + X0, j, 24, 3) * 0.7 + ruidoSuave(i + X0, j, 7, 4) * 0.3 > 0.63);
  p.tono(pared, 1, idP, (i, j) => ruidoSuave(i + X0, j, 28, 5) < 0.24);
  p.tono(pared, -1, idP, (i, j) => hash2(i + X0, j, 9) < 0.006);
  p.tono(F.rr(0, OFI.TECHO, W, 3, 0), -1, idP);
  p.tono(F.rr(0, 136, W, 20, 0), -1, idP, (i, j) => j > 151 - ruidoSuave(i + X0, 1, 11, 13) * 12);
  const luces = [];
  for (const t of T) {
    if (t.t === 'ventana') {
      ventanaOficina(p, t.x, t.w, t);
      // los churretes que bajan del alféizar
      for (let k = 0; k < 5; k++) { const cx = t.x + 6 + Math.floor(hash((t.x + X0) * 7 + k) * (t.w - 12)), l = 4 + Math.floor(hash(t.x + X0 + k * 3) * 14); if (cx < t.x + 10 || cx > t.x + t.w - 10) p.raya(cx, 130, cx, 130 + l, null, -1); }
      luces.push([t.x + Math.round(t.w / 2) - 20, t.rota]);
    } else if (t.t === 'pared') {
      // el zócalo azul de la empresa a la altura de los alféizares y la rejilla del aire
      p.parte(F.rr(t.x, 125, t.w, 3, 0), apagado(P.pantalla, '#445264', 0.5), { plano: 3, canto: [1, -1], linea: false, sombra: 0 });
      p.parte(F.rr(t.x + 6, 20, 26, 9, 1), P.marco, { plano: 3, canto: 1, sombra: 1 });
      for (let j = 23; j < 28; j += 2) p.raya(t.x + 9, j, t.x + 28, j, P.marco.c[0]);
      if (!t.que) { tablonDias(p, t.x + 8, 47); relojPared(p, t.x + 20, 100); pizarraReunion(p, t.x + 38, 88); cartelSinergia(p, t.x + 80, 87); }
      else if (t.que === 1) {
        // el nombre de la casa en letras de chapa y su lema
        letrasPared(p, 'MICROBLIZZ', t.x + t.w / 2, 52, 2, apagado(P.pantalla, '#58687c', 0.35), 4);
        p.letrero(tr('COMPRAMOS TU JUEGO FAVORITO'), t.x + t.w / 2, 74, P.pared.c[5], 'mini');
        p.letrero(tr('(PARA CERRARLO)'), t.x + t.w / 2, 82, P.pared.c[1], 'mini');
        relojPared(p, t.x + t.w - 18, 102);
      } else if (t.que === 2) { cartelValores(p, t.x + 10, 50); cartelSinergia(p, t.x + t.w - 46, 62); }
      luces.push([t.x + t.w - 46, false]);
    } else if (t.t === 'ascensor') ascensorOficina(p, t.x);
  }
  for (const t of T) if (t.t === 'pilar') pilarOficina(p, t.x, t.que, X0);
  // el rodapié
  p.parte(F.rr(0, Z - 5, W, 5, 0), P.marco, { plano: 2, canto: [1, -1], linea: false, sombra: 0 });
  /* ---------- el techo, con sus placas y sus fluorescentes ---------- */
  const idT = p.parte(F.rr(0, 0, W, OFI.TECHO, 0), P.techo, { plano: 3, linea: false, sombra: 0 });
  for (let x = 12 - (((X0 % 24) + 24) % 24); x < W; x += 24) p.raya(x, 0, x, OFI.TECHO - 2, null, -1);
  p.tono(F.rr(0, OFI.TECHO - 2, W, 1, 0), 1, idT); p.tono(F.rr(0, OFI.TECHO - 1, W, 1, 0), -2, idT);
  for (const [x, roto] of luces) fluorescente(p, x, roto, idP);
  return p.lienzo().c;
}
// el reflejo de los cristales: dos franjas lisas en diagonal en cada ventana que se ve (camX = por dónde va la cámara)
function pintaReflejos(g, tramos, camX, W) {
  g.save(); g.globalAlpha = 0.16; g.fillStyle = '#ffffff';
  for (const t of tramos) {
    if (t.t !== 'ventana' || t.x - camX > W || t.x + t.w - camX < 0) continue;
    const x = Math.round(t.x - camX), h = OFI.V1 - OFI.V0;
    g.save(); g.beginPath(); g.rect(x, OFI.V0, t.w, h); g.clip();
    for (const [d, a] of [[t.w * 0.62, 11], [t.w * 0.62 + 16, 4]]) { g.beginPath(); g.moveTo(x + d, OFI.V0); g.lineTo(x + d + a, OFI.V0); g.lineTo(x + d + a - h * 0.7, OFI.V1); g.lineTo(x + d - h * 0.7, OFI.V1); g.fill(); }
    g.restore();
  }
  g.restore();
}
