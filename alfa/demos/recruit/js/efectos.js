// Fans of Recruit · LOS EFECTOS, dibujados fotograma a fotograma: explosiones (destello, bola de fuego en franjas, humo que
// sube y chispas), el fogonazo del arma, las balas, los casquillos, las grapas de los becarios, las monedas de CAOS que giran,
// las chispas de los impactos y el polvo de las pisadas. Cada animación es una lista de dibujos ya hechos.
'use strict';

const suaveSale = t => 1 - (1 - t) * (1 - t);

/* ---------- explosión ----------
   t de 0 a 1 = el momento; R = el radio de la bola en píxeles; sem la hace distinta cada vez.
   Primero el destello, luego la bola (blanca por dentro, amarilla, naranja y roja por fuera, en franjas limpias) y, mientras
   se enfría, el humo: bolas grises con su luz y su sombra que suben y se deshacen. */
function explosion(p, t, R, sem) {
  const P = MAT, az = k => hash(sem * 97 + k);
  // el humo, por detrás
  if (t > 0.14) {
    const th = (t - 0.14) / 0.86, vida = Math.sin(Math.min(1, th * 1.12) * Math.PI);
    for (let k = 0; k < 10; k++) {
      const a = az(k * 3) * 6.283, d = R * (0.3 + 0.7 * az(k * 5)) * (0.5 + th * 0.95), r = R * (0.36 + 0.26 * az(k * 7)) * Math.pow(Math.max(0, vida), 0.55) * (1 - th * az(k * 11) * 0.5);
      if (r < 1.2) continue;
      p.parte(F.ov(Math.cos(a) * d, Math.sin(a) * d * 0.75 - th * R * 0.8, r, r * 0.92), P.humo, { r: r * 0.95, linea: false, sombra: 0, cortes: [-0.1, 0.36, 0.76, 2] });
    }
  }
  // la bola de fuego
  const tf = t / 0.72;
  if (tf < 1) {
    const esc = tf < 0.28 ? 0.35 + 0.65 * suaveSale(tf / 0.28) : 1 - Math.pow((tf - 0.28) / 0.72, 1.6) * 0.9, bolas = [];
    for (let k = 0; k < 7; k++) {
      const a = az(20 + k * 3) * 6.283, d = R * (k ? 0.34 + 0.44 * az(21 + k * 5) : 0) * (0.6 + tf * 0.6), r = R * (k ? 0.3 + 0.24 * az(22 + k * 7) : 0.64) * esc * (1 - tf * az(23 + k) * 0.6);
      if (r > 1) bolas.push(F.ov(Math.cos(a) * d, Math.sin(a) * d * 0.85 - tf * R * 0.28, r, r));
    }
    if (bolas.length) {
      const f = F.fun(R * 0.14, ...bolas), id = p.parte(f, P.fuego, { plano: 1, linea: false, sombra: 0 });
      // cada franja, más adentro y más caliente; al enfriarse las franjas se ensanchan y lo blanco desaparece
      const paso = R * (0.035 + 0.15 * tf * tf) + 0.6;
      for (let n = 1; n <= 4; n++) p.tono(F.mueve(F.gordo(f, -paso * n * (n === 1 ? 0.7 : 1)), -n * R * 0.022, -n * R * 0.03), 1, id);
    }
  } else if (t < 0.86) {
    // las últimas brasas dentro del humo
    for (let k = 0; k < 3; k++) { const a = az(40 + k) * 6.283, d = R * 0.3 * az(43 + k); p.parte(F.ov(Math.cos(a) * d, Math.sin(a) * d - R * 0.5, 2.2 - (t - 0.72) * 9, 1.8), P.fuego, { plano: 2, linea: false, sombra: 0 }); }
  }
  // la onda: un aro fino que se abre
  if (t > 0.04 && t < 0.3) {
    const r = R * (0.7 + (t - 0.04) * 4.2);
    const g = t < 0.18 ? 2.4 : 1.6, aro = F.menos(F.ov(0, 0, r, r * 0.9), F.ov(0, 0, r - g, (r - g) * 0.9));
    // solo tres trozos del aro, cada vez más cortos
    const trozo = k => { const a = az(90 + k) * 6.283, d = r * 1.4, ab = 0.9 - t * 1.6; return F.pol(0, 0, Math.cos(a - ab) * d, Math.sin(a - ab) * d, Math.cos(a) * d * 1.2, Math.sin(a) * d * 1.2, Math.cos(a + ab) * d, Math.sin(a + ab) * d); };
    p.parte(F.y(aro, F.un(trozo(0), trozo(1), trozo(2))), P.fuego, { plano: t < 0.12 ? 5 : t < 0.2 ? 4 : 3, linea: false, sombra: 0 });
  }
  // el destello del principio: una estrella blanca
  if (t < 0.12) {
    const r = R * (0.75 + t * 4.5), pts = [];
    for (let k = 0; k < 16; k++) { const a = k * 0.3927 + az(60) * 2, q = k % 2 ? r * 0.42 : r * (0.8 + 0.4 * az(61 + k)); pts.push(Math.cos(a) * q, Math.sin(a) * q); }
    const f = F.pol(...pts), id = p.parte(f, P.fuego, { plano: 4, linea: false, sombra: 0 });
    p.tono(F.gordo(f, -1.6), 1, id);
  }
  // las chispas: rayitas que salen disparadas y se apagan
  if (t > 0.05 && t < 0.62) {
    const q = (t - 0.05) / 0.57;
    for (let k = 0; k < 11; k++) {
      const a = az(70 + k * 3) * 6.283, v = 0.9 + az(71 + k * 5) * 1.3, d = R * (0.5 + q * v * 1.5), l = 2.6 * (1 - q) + 0.6, x = Math.cos(a) * d, y = Math.sin(a) * d * 0.9 + q * q * R * 0.5 - R * 0.1;
      p.raya(x, y, x - Math.cos(a) * l, y - Math.sin(a) * l, P.fuego.c[q < 0.4 ? 5 : q < 0.7 ? 4 : 3]);
    }
  }
}
// todos los fotogramas de una explosión de radio R
function creaExplosion(R, sem = 1, n = 14) {
  const m = Math.ceil(R * 2.9), out = [];
  for (let k = 0; k < n; k++) { const p = new Pincel(m * 2, m * 2 + Math.ceil(R), m, m + Math.ceil(R)); explosion(p, (k + 0.3) / n, R, sem); out.push(p.lienzo()); }
  return out;
}

/* ---------- el fogonazo del arma: una llamarada con picos (k = 0, 1 o 2: tres dibujos distintos). Sale hacia la derecha desde (0, 0) ---------- */
function fotoFogonazo(k) {
  const p = new Pincel(30, 22, 4, 11), P = MAT, L = [15, 20, 11][k], A = [5.4, 7, 4][k];
  const pts = [-2, 0, 2, -A * 0.5, 4.4, -A, 6.4, -A * 0.42, L * 0.62, -A * 0.74, L * 0.56, -A * 0.26, L, -0.6 + (k - 1), L * 0.58, A * 0.3, L * 0.7, A * 0.84, 6.4, A * 0.46, 4, A, 2, A * 0.5];
  const f = F.pol(...pts), id = p.parte(f, P.fuego, { plano: 3, linea: false, sombra: 0 });
  p.tono(F.gordo(f, -1), 1, id); p.tono(F.gordo(f, -2.1), 1, id);
  // el corazón blanco, pegado a la boca del cañón
  p.parte(F.ov(3, 0, 3.4 + k * 0.3, 2.3), P.fuego, { plano: 5, linea: false, sombra: 0 });
  return p.lienzo();
}
// la bala de la ametralladora: un trazo de luz (hacia la derecha)
function fotoBala() {
  const p = new Pincel(17, 6, 1, 2), C = MAT.fuego.c;
  p.plano(F.rr(0, -1, 15, 4, 2), C[2]); p.plano(F.rr(4, -1, 11, 4, 2), C[3]); p.plano(F.rr(3, 0, 12, 2, 1), C[4]); p.plano(F.rr(8, 0, 7, 2, 1), C[5]);
  return p.lienzo();
}
// el chispazo de una bala al dar en algo: una llamita con picos (2 dibujos)
function fotoImpacto(k) {
  const p = new Pincel(15, 15, 7, 7), C = MAT.fuego, r = k ? 5.6 : 3.6, pts = [];
  for (let n = 0; n < 10; n++) { const a = n * 0.628 + k * 0.3, q = n % 2 ? r * 0.4 : r * (0.75 + hash(n + k * 9) * 0.4); pts.push(0.5 + Math.cos(a) * q, 0.5 + Math.sin(a) * q); }
  const f = F.pol(...pts), id = p.parte(f, C, { plano: 3, linea: false, sombra: 0 });
  p.tono(F.gordo(f, -1), 1, id); p.tono(F.ov(0.5, 0.5, r * 0.3, r * 0.3), 1, id);
  return p.lienzo();
}
// un casquillo que da vueltas (4 dibujos)
function fotoCasquillo(k) {
  const p = new Pincel(5, 5, 2, 2), O = MAT.oro.c, d = [[1, 0], [1, 1], [0, 1], [-1, 1]][k];
  p.px(0.5 - d[0], 0.5 - d[1], O[2]); p.px(0.5, 0.5, O[4]); p.px(0.5 + d[0], 0.5 + d[1], O[5]);
  return p.lienzo();
}
// una grapa: lo que disparan los becarios (hacia la izquierda; el juego la gira)
function fotoGrapa() {
  const p = new Pincel(11, 9, 5, 4), A = MAT.acero.c, f = F.menos(F.rr(-3, -2, 7, 5, 0), F.rr(-2, -1, 5, 4, 0));
  p.plano(F.gordo(f, 1), A[0]); p.plano(f, A[4]); p.plano(F.rr(-3, -2, 7, 1, 0), A[5]); p.px(3.5, 1.5, A[3]); p.px(3.5, 2.5, A[3]);
  return p.lienzo();
}
/* ---------- la moneda de CAOS: de oro, con la espiral del ojo de CrazyBunny. Gira en 8 dibujos ---------- */
function fotoMoneda(k) {
  const p = new Pincel(13, 13, 6, 6), P = MAT, an = [5.4, 4.6, 3, 1.3, 0.6, 1.3, 3, 4.6][k], f = F.ov(0.5, 0.5, an, 5.4);
  if (an < 1) { p.plano(F.rr(-0.5, -5, 2, 11, 0.6), P.oro.c[0]); p.plano(F.rr(0, -4, 1, 9, 0), P.oro.c[k === 4 ? 4 : 2]); return p.lienzo(); }
  const id = p.parte(f, P.oro, { r: 3.2, sombra: 0 });
  if (an > 2.6) {
    // el canto (un aro más oscuro) y la espiral grabada
    p.tono(F.menos(F.gordo(f, -1), F.gordo(f, -2)), -1, id);
    const s = an / 5.4;
    for (let a = 0.4; a < 7; a += 0.5) { const r = 0.5 + a * 0.36; p.tonoPx(0.5 + Math.cos(a) * r * s, 0.5 + Math.sin(a) * r, -2); }
  }
  if (k === 0 || k === 7) { p.tonoPx(-2.5, -3.5, 2); p.tonoPx(-1.5, -4.5, 2); }
  return p.lienzo();
}
// el destello de una moneda o de un golpe: una estrellita de 4 puntas (3 tamaños)
function fotoChispa(k, color = '#ffffff', borde = '#ffe56e') {
  const r = [1, 2, 3.4][k], p = new Pincel(11, 11, 5, 5);
  for (let d = -Math.ceil(r); d <= Math.ceil(r); d++) { if (Math.abs(d) <= r) { p.px(0.5 + d, 0.5, Math.abs(d) > r - 1.2 && k ? borde : color); p.px(0.5, 0.5 + d, Math.abs(d) > r - 1.2 && k ? borde : color); } }
  if (k === 2) for (const [a, b] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) p.px(0.5 + a, 0.5 + b, borde);
  return p.lienzo();
}
// una nubecilla de polvo o de humo que se deshace (t de 0 a 1; r = tamaño). humo: gris en vez de polvo claro
function fotoNubecilla(t, r, sem = 1, humo) {
  const m = Math.ceil(r * 2.4), p = new Pincel(m * 2, m * 2, m, m), M = humo ? MAT.humo : MAT.polvo, vida = Math.sin(Math.min(1, 0.25 + t * 0.8) * Math.PI);
  for (let k = 0; k < 4; k++) {
    const a = hash(sem * 7 + k) * 6.283, d = r * (0.3 + t * 0.9) * (0.4 + hash(sem + k * 3) * 0.6), q = r * (0.5 + 0.3 * hash(sem + k * 5)) * Math.pow(Math.max(0, vida), 0.6);
    if (q > 0.9) p.parte(F.ov(Math.cos(a) * d, Math.sin(a) * d * 0.6 - t * r * 0.6, q, q * 0.9), M, { r: q, linea: false, sombra: 0 });
  }
  return p.lienzo();
}
// trocitos que saltan cuando revienta un robot: tornillo, tuerca, chapa y muelle (k = 0 a 3), girados «a»
function fotoTrozo(k, a = 0) {
  const p = new Pincel(13, 13, 6, 6), P = MAT, G = f => F.gira(f, a, 0, 0);
  if (k === 0) { p.parte(G(F.rr(-3, -1, 6, 2.2, 0.4)), P.acero, { plano: 4, canto: [1, -2], linea: false, sombra: 0 }); p.parte(G(F.rr(-4.4, -2, 2.4, 4.2, 0.6)), P.acero, { plano: 3, canto: 1, sombra: 0 }); }
  else if (k === 1) { p.parte(F.menos(F.ov(0, 0, 3.4, 3.4), F.ov(0, 0, 1.2, 1.2)), P.robot, { r: 1.5, sombra: 0 }); }
  else if (k === 2) { p.parte(G(F.pol(-4, -2, 3, -3, 4, 1, -1, 3, -3, 1)), P.robot, { plano: 3, canto: 1, sombra: 0 }); }
  else { for (let i = -3; i <= 3; i++) p.px(0.5 + i, 0.5 + (i % 2 ? -1 : 1), P.acero.c[i % 2 ? 5 : 3]); }
  return p.lienzo();
}
