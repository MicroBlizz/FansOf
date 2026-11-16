// Fans of Wings · Maquetas: las piezas con las que se montan los aviones chibi (fuselaje, cabina, cuerpo plano, alas, derivas,
// motores, misiles, hélices…). Cada pieza es una función que, dado un punto (medido en «unidades» desde el eje del avión, con el
// morro en z = 0), dice qué parte toca o null. Un avión es una lista de piezas por orden de prioridad más unos retoques de pintura;
// cortar() lo convierte en una rejilla de cubitos muy finos (lonchas más finas en altura). No dibuja nada: solo calcula formas.
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  const MQ = A.maquetas = { ky: 4 };   // ky = lonchas por unidad de altura del avión que se está cortando (para el grosor mínimo)
  const entre = (v, a, b) => Math.max(a, Math.min(b, v));

  // Línea quebrada: puntos [z, a, b, c…] → función de z que devuelve [a, b, c…] interpolados (recuerda la última z pedida).
  MQ.perfil = function (pts) {
    let ultZ = NaN, ult = null;
    return function (z) {
      if (z === ultZ) return ult;
      let i = 1;
      while (i < pts.length - 1 && z > pts[i][0]) i++;
      const p = pts[i - 1], q = pts[i], t = entre((z - p[0]) / (q[0] - p[0]), 0, 1);
      ultZ = z; ult = p.slice(1).map((v, n) => v + (q[n + 1] - v) * t);
      return ult;
    };
  };

  // El fuselaje: en cada corte a lo largo, una elipse (o casi una caja, con exp alto) de radios y centro pts = [z, rx, ry, yc].
  function zonaFuselaje(o, ax, dy, z, rx, ry) {
    if (z < o.morro) return 'morro';
    if (o.anti && z >= o.anti[0] && z <= o.anti[1] && dy > ry * 0.55 && ax < rx * 0.6) return 'antirreflejo';
    if (dy < -ry * 0.3) return 'panza';
    return dy > ry * 0.5 && ax < rx * 0.5 ? 'lomo' : 'cuerpo';
  }
  MQ.fuselaje = function (pts, o) {
    const pf = MQ.perfil(pts), e = o.exp || 2, z0 = pts[0][0], z1 = pts[pts.length - 1][0];
    return function (ax, y, z) {
      if (z < z0 || z > z1) return null;
      const [rx, ry, yc] = pf(z), dy = y - yc;
      if (rx <= 0.05 || Math.pow(ax / rx, e) + Math.pow(Math.abs(dy) / ry, e) > 1) return null;
      return zonaFuselaje(o, ax, dy, z, rx, ry);
    };
  };

  // La cabina: una burbuja de cristal grande sobre el lomo, con el marco abajo, un arco en medio y el brillo delante.
  MQ.cabina = function (pts, z0, z1, ancho, alto) {
    const pf = MQ.perfil(pts), zm = (z0 + z1) / 2, zr = (z1 - z0) / 2;
    return function (ax, y, z) {
      const tb = (z - zm) / zr;
      if (tb < -1 || tb > 1) return null;
      const [rx, ry, yc] = pf(z), a = ax / (rx * ancho), b = (y - (yc + ry * 0.45)) / (ry * alto), d = a * a + b * b + tb * tb;
      if (d > 1 || y <= yc + ry * 0.4) return null;
      if ((d > 0.78 && y < yc + ry * 0.4 + 0.7) || Math.abs(tb) < 0.06 || (ax < 0.2 && d > 0.8)) return 'marco';
      return tb < -0.25 && a < 0.6 && b > 0.35 ? 'brillo' : 'cristal';
    };
  };

  // Un ala (o un timón de cola): de la raíz s0 a la punta s1 (media envergadura), con el borde de delante de le0 a le1 y el de
  // atrás de te0 a te1 (o.atras(ax) lo recorta, para dientes de sierra); gruesa en la raíz y afilada en la punta y los bordes.
  function zonaAla(o, ax, c, dy) {
    if (o.punta && ax > o.s1 - o.punta) return 'punta';
    if (c < 0.1) return 'borde';
    if (o.franja && ax > o.franja[0] && ax < o.franja[1] && dy >= 0) return 'franja';
    return dy < 0 ? 'panza' : 'ala';
  }
  MQ.ala = function (o) {
    const g0 = o.g0 || 0.9, g1 = o.g1 || 0.35;
    return function (ax, y, z) {
      if (ax < o.s0 - 0.5 || ax > o.s1) return null;
      const s = entre((ax - o.s0) / (o.s1 - o.s0), 0, 1), le = o.le0 + (o.le1 - o.le0) * s;
      const te = o.te0 + (o.te1 - o.te0) * s - (o.atras ? o.atras(ax) : 0), c = (z - le) / Math.max(te - le, 0.001);
      if (c < 0 || c > 1) return null;
      const g = (g0 + (g1 - g0) * s) * Math.pow(entre(4 * c * (1 - c), 0, 1), 0.35), dy = y - o.y;
      if (Math.abs(dy) > Math.max(g / 2, 0.51 / MQ.ky)) return null;
      return zonaAla(o, ax, c, dy);
    };
  };

  // Un emblema: un dibujo de 7 puntos de ancho (filas de 'X' y '.') pintado a escala `esc` (tercios de unidad por punto).
  MQ.punto = function (bits, esc, col, fila) {
    const c = Math.floor(col * 3 / esc), f = Math.floor(fila * 3 / esc);
    return f >= 0 && f < bits.length && c >= 0 && c < 7 && bits[f][c] === 'X';
  };

  // Una deriva: una pared fina en |x| = o.x (inclinada hacia fuera con o.inclina), de base a0..b0 a la altura y0 y de punta
  // a1..b1 a la altura y1, con una banda de color arriba y, si se pide, el emblema del piloto: o.emblema = [bits, esc, z, y].
  function zonaDeriva(o, y, z, za) {
    const e = o.emblema;
    if (e && MQ.punto(e[0], e[1], z - e[2], e[3] - y)) return 'emblema';
    if (o.banda && y > o.y1 - o.banda) return 'punta';
    if (o.banda && y > o.y1 - o.banda - 0.45) return 'franja';
    return z < za + 0.5 ? 'borde' : 'deriva';
  }
  MQ.deriva = function (o) {
    return function (ax, y, z) {
      if (y < o.y0 || y > o.y1 || Math.abs(ax - o.x - (o.inclina || 0) * (y - o.y0)) > 0.34) return null;
      const u = (y - o.y0) / (o.y1 - o.y0), za = o.a0 + (o.a1 - o.a0) * u;
      if (z < za || z > o.b0 + (o.b1 - o.b0) * u) return null;
      return zonaDeriva(o, y, z, za);
    };
  };

  // Un motor: un tubo a lo largo en |x| = o.x, con la boca oscura delante (o.labio la rodea de color), la tobera detrás y, con
  // o.fuego, el fondo encendido. o.inclina corta la boca en bisel.
  function zonaTubo(o, d, z, z0, dy) {
    const tobera = o.tobera === undefined ? 2.6 : o.tobera;
    if (o.labio && d > 0.6 && z < z0 + o.labio) return 'aro';
    if (o.boca !== 0 && z < z0 + (o.boca || 1.2) && d < 0.6) return 'toma';
    if (z > o.z1 - tobera) return o.fuego && d < 0.3 && z > o.z1 - 1.4 ? 'fuego' : (d < 0.5 ? 'toma' : 'tobera');
    if (z > o.z1 - tobera - 0.5) return 'aro';
    return dy < -o.r * 0.35 ? 'panza' : 'motor';
  }
  MQ.tubo = function (o) {
    const e = o.exp || 3, rx = o.rx || o.r;
    return function (ax, y, z) {
      const dy = y - o.y, z0 = o.z0 + (o.inclina || 0) * dy;
      if (z < z0 || z > o.z1) return null;
      const d = Math.pow(Math.abs(ax - o.x) / rx, e) + Math.pow(Math.abs(dy) / o.r, e);
      return d > 1 ? null : zonaTubo(o, d, z, z0, dy);
    };
  };

  // El cuerpo plano que une el fuselaje con las alas: de ancho w(z) (pts = [z, w]), entre las alturas y0 e y1, con el canto de
  // color y, si se piden, galones pintados en flecha (o.galones = [z…], o.pend = cuánto se retrasan al alejarse del centro).
  MQ.plano = function (pts, o) {
    const pf = MQ.perfil(pts), z0 = pts[0][0], z1 = pts[pts.length - 1][0];
    return function (ax, y, z) {
      if (z < z0 || z > z1 || y < o.y0) return null;
      const w = pf(z)[0];
      if (ax > w || y > o.y1 - 0.06 * Math.max(ax - 3, 0)) return null;
      if (y < o.y0 + (o.panza || 0.6)) return 'panza';
      if (ax > w - 0.55) return 'borde';
      for (const g of o.galones || []) if (Math.abs(z - g - o.pend * ax) < 0.78) return 'galon';
      return 'cuerpo';
    };
  };

  // Un misil (o una bomba, si es gordo) colgado en |x| = x: tubo con la punta de color y cuatro aletas detrás.
  MQ.misil = function (x, y, z0, z1, r) {
    return function (ax, Y, z) {
      if (z < z0 || z > z1) return null;
      const dx = Math.abs(ax - x), dy = Math.abs(Y - y);
      if (Math.hypot(dx, dy) <= r * entre((z - z0) / 1.6, 0.25, 1)) return z < z0 + 1.3 ? 'misilpunta' : 'misil';
      return z > z1 - 1.6 && ((dx <= 0.2 && dy <= r + 0.6) || (dy <= 0.2 && dx <= r + 0.6)) ? 'misilpunta' : null;
    };
  };

  MQ.caja = (x0, x1, y0, y1, z0, z1, parte) => (ax, y, z) => (ax >= x0 && ax <= x1 && y >= y0 && y <= y1 && z >= z0 && z <= z1 ? parte : null);
  MQ.bola = (y, z, r, parte) => (ax, Y, Z) => (ax * ax + (Y - y) * (Y - y) + (Z - z) * (Z - z) < r * r ? parte : null);
  // Una antena de aleta en el lomo, y una hélice de cuatro palas con su buje.
  MQ.antena = (z, alto) => (ax, y, Z) => (ax < 0.2 && Z > z && Z < z + 1.6 && y > 0.5 && y < alto ? 'detalle' : null);
  MQ.helice = function (x, y, z, r) {
    return function (ax, Y, Z) {
      const dx = Math.abs(ax - x), dy = Math.abs(Y - y), d = Math.hypot(dx, dy);
      if (d < 0.7 && Math.abs(Z - z) < 0.8) return 'buje';
      return d < r && (dx < 0.3 || dy < 0.3) && Math.abs(Z - z) < 0.35 ? 'pala' : null;
    };
  };

  // Qué parte hay en un punto: la primera pieza que lo toque, y después los retoques de pintura (emblemas en las alas, luces…).
  MQ.parte = function (d, x, y, z) {
    const ax = Math.abs(x);
    let p = null;
    for (let i = 0; i < d.piezas.length && !p; i++) p = d.piezas[i](ax, y, z, x);
    if (!p) return null;
    for (const f of d.pintas || []) p = f(p, ax, y, z, x) || p;
    return p;
  };

  // La rejilla de un avión: d = { k, ky, u (metros por unidad), ancho (media anchura), alto [abajo, arriba], largo, pal, piezas }.
  MQ.rejilla = (d) => ({ nx: Math.round(d.ancho * 2 * d.k), ny: Math.round((d.alto[1] - d.alto[0]) * d.ky), nz: Math.round(d.largo * d.k) });

  // Corta un avión en cubitos. La chapa lleva una junta cada siete unidades, es algo más clara por arriba y tiene un grano fino.
  MQ.cortar = function (d, sem) {
    const GL = A.gl, r = MQ.rejilla(d), rnd = GL.azar(sem), pal = {};
    for (const n of Object.keys(d.pal)) pal[n] = GL.hex(d.pal[n]);
    MQ.ky = d.ky;
    return GL.cubitos(r.nx, r.ny, r.nz, { vox: [d.u / d.k, d.u / d.ky, d.u / d.k], dy: d.alto[0] * d.u, color(x, y, z) {
      const p = MQ.parte(d, (x + 0.5) / d.k - d.ancho, (y + 0.5) / d.ky + d.alto[0], (z + 0.5) / d.k);
      if (!p) return null;
      return GL.tono(pal[p] || pal.cuerpo, (z % (7 * d.k) === 0 ? 0.87 : 1) * (0.9 + 0.1 * y / r.ny) * (0.975 + rnd() * 0.05));
    } });
  };

  // Dónde están las toberas y la punta del ala en metros desde el centro del modelo (para las llamas y las estelas).
  MQ.medidas = function (d) {
    const m = (p) => [p[0] * d.u, p[1] * d.u, (p[2] - d.largo / 2) * d.u];
    return { toberas: d.toberas.map(m), punta: m(d.punta), largo: d.largo * d.u };
  };
})(WINGS);
