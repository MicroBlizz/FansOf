// Fans of Rally · dominio · PISTA: convierte los puntos de un tramo en una carretera de verdad: una curva cerrada y suave (Catmull-Rom)
// partida en muestras cada `paso` píxeles, con su ángulo, su curvatura, la distancia desde la salida y el suelo de cada una.
// También dice cuál es la muestra más cercana a un punto (buscando cerca de la última, que es lo normal en una carrera) y si ese
// punto está dentro de la carretera. Pura: sin pantalla ni reloj.
'use strict';
RA.Pista = (() => {
  function curvaCerrada(puntos, porTramo) {
    const n = puntos.length, out = [];
    for (let i = 0; i < n; i++) {
      const a = puntos[(i - 1 + n) % n], b = puntos[i], c = puntos[(i + 1) % n], d = puntos[(i + 2) % n];
      for (let k = 0; k < porTramo; k++) {
        const t = k / porTramo, t2 = t * t, t3 = t2 * t;
        const q = j => 0.5 * (2 * b[j] + (-a[j] + c[j]) * t + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * t2 + (-a[j] + 3 * b[j] - 3 * c[j] + d[j]) * t3);
        out.push([q(0), q(1)]);
      }
    }
    return out;
  }
  // reparte la curva en muestras a la misma distancia unas de otras
  function remuestrea(curva, paso) {
    const out = [curva[0]];
    let resto = 0;
    for (let i = 0; i < curva.length; i++) {
      const [x0, y0] = curva[i], [x1, y1] = curva[(i + 1) % curva.length];
      const largo = Math.hypot(x1 - x0, y1 - y0);
      let d = paso - resto;
      while (d <= largo) { out.push([x0 + (x1 - x0) * d / largo, y0 + (y1 - y0) * d / largo]); d += paso; }
      resto = largo - (d - paso);
    }
    if (Math.hypot(out[out.length - 1][0] - out[0][0], out[out.length - 1][1] - out[0][1]) < paso * 0.5) out.pop();
    return out;
  }
  function sueloEn(suelos, fraccion) {
    let s = suelos[0][1];
    for (const [desde, nombre] of suelos) if (fraccion >= desde) s = nombre;
    return s;
  }
  function crea(tramo, paso = 4) {
    const pts = remuestrea(curvaCerrada(tramo.puntos, 40), paso), n = pts.length;
    const x = new Float32Array(n), y = new Float32Array(n), ang = new Float32Array(n), curv = new Float32Array(n), suelo = [];
    for (let i = 0; i < n; i++) { x[i] = pts[i][0]; y[i] = pts[i][1]; }
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; ang[i] = Math.atan2(y[j] - y[i], x[j] - x[i]); }
    for (let i = 0; i < n; i++) { curv[i] = RA.difAngulo(ang[(i - 1 + n) % n], ang[i]) / paso; suelo.push(sueloEn(tramo.suelos, i / n)); }
    return RA.congela({ id: tramo.id, n, paso, largo: n * paso, ancho: tramo.ancho, x, y, ang, curv, suelo });
  }
  // la muestra más cercana a (px, py), buscando alrededor de `pista`, la que se usó la última vez (-1 = buscar en toda la pista)
  function cercana(p, px, py, pista = -1) {
    let mejor = 0, dm = Infinity;
    const desde = pista < 0 ? 0 : pista - 25, hasta = pista < 0 ? p.n : pista + 60;
    for (let k = desde; k < hasta; k++) {
      const i = ((k % p.n) + p.n) % p.n, d = (p.x[i] - px) ** 2 + (p.y[i] - py) ** 2;
      if (d < dm) { dm = d; mejor = i; }
    }
    return { i: mejor, distancia: Math.sqrt(dm) };
  }
  const dentro = (p, distancia) => distancia <= p.ancho / 2;
  // el suelo que pisa un coche: el de la carretera o «fuera»
  const sueloBajo = (p, i, distancia) => (dentro(p, distancia) ? p.suelo[i] : 'fuera');
  return { crea, cercana, dentro, sueloBajo };
})();
