// Fans of Spy · ADAPTADORES · El escenario: convierte el mapa de una planta en UNA malla fija con todo lo que no se mueve: el
// suelo con sus baldosas y las rayas de las plazas, las paredes de alrededor, los pilares, los coches aparcados (y el cochazo
// dorado del CEO), la barrera, la garita, los postes de las cámaras y la puerta verde de la meta. También dice dónde cuelgan los
// focos que hacen los charcos de luz. Todo por código, con las formas de gl/formas.js. Una casilla mide 1; el centro de la
// casilla (x, y) del mapa está en el punto (x + 0,5, y + 0,5) del suelo.
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
(function (S) {
  const GL = S.gl, M = GL.M, F = S.formas;
  const COCHES = ['#5b6d92', '#8795b3', '#42517a', '#8f5a63', '#4f8088', '#b7bfcd', '#6d7c9b'];
  const PARED = '#2b3350', ZOCALO = '#f2c230', NEGRO = '#11131c', GARITA = '#0e7c8c', LUNA = '#16233d';
  const ALTO = 1.7;

  function suelo(b, pl) {
    F.plano(b, { x0: -8, z0: -8, x1: pl.ancho + 8, z1: pl.alto + 8, y: 0, color: '#10162a' });
    for (let y = 0; y < pl.alto; y++) {
      for (let x = 0; x < pl.ancho; x++) {
        const t = pl.tipo(x, y);
        if (t === '#') continue;
        const color = t === 'M' ? '#1fa85a' : t === 'G' ? '#17404a' : 'CX'.includes(t) ? '#191f33' : (x + y) % 2 ? '#232a40' : '#1f2539';
        F.plano(b, { x0: x + 0.03, z0: y + 0.03, x1: x + 0.97, z1: y + 0.97, y: 0.004, color, emi: t === 'M' ? 0.55 : 0 });
        if ('CX'.includes(t)) for (const lx of [x + 0.02, x + 0.94]) F.plano(b, { x0: lx, z0: y + 0.04, x1: lx + 0.04, z1: y + 0.96, y: 0.008, color: '#cfd6e8', emi: 0.2 });
      }
    }
    // el recuadro amarillo de la entrada, pintado en el suelo de la casilla de salida
    const s = pl.salida, g = 0.07;
    for (const [x0, z0, x1, z1] of [[0.1, 0.1, 0.9, 0.1 + g], [0.1, 0.9 - g, 0.9, 0.9], [0.1, 0.1, 0.1 + g, 0.9], [0.9 - g, 0.1, 0.9, 0.9]]) {
      F.plano(b, { x0: s.x + x0, z0: s.y + z0, x1: s.x + x1, z1: s.y + z1, y: 0.008, color: '#ffd23f', emi: 0.35 });
    }
  }

  function pared(b, x, z, alto = ALTO) {
    F.caja(b, { x: x + 0.5, y: 0, z: z + 0.5, sx: 1, sy: alto, sz: 1, color: PARED });
    F.caja(b, { x: x + 0.5, y: 0, z: z + 0.5, sx: 1.03, sy: 0.14, sz: 1.03, color: '#3d476b' });
    F.caja(b, { x: x + 0.5, y: alto - 0.12, z: z + 0.5, sx: 1.03, sy: 0.12, sz: 1.03, color: '#3d476b' });
  }
  // Las paredes que rodean la planta: a los lados, altas; por abajo (del lado de la cámara), un bordillo bajo para no tapar la vista.
  function contorno(b, pl) {
    for (let y = -1; y < pl.alto; y++) { pared(b, -1, y); pared(b, pl.ancho, y); }
    F.caja(b, { x: pl.ancho / 2, y: 0, z: pl.alto + 0.08, sx: pl.ancho + 2, sy: 0.1, sz: 0.16, color: '#3d476b' });
  }
  // Un pilar: más bajo que las paredes, para que no tape las casillas de detrás (tapa la vista de los guardias igual).
  function pilar(b, x, z) {
    F.caja(b, { x: x + 0.5, y: 0, z: z + 0.5, sx: 0.56, sy: 1, sz: 0.56, color: '#39425f' });
    F.caja(b, { x: x + 0.5, y: 1, z: z + 0.5, sx: 0.64, sy: 0.08, sz: 0.64, color: '#4a5479' });
    F.caja(b, { x: x + 0.5, y: 0, z: z + 0.5, sx: 0.6, sy: 0.16, sz: 0.6, color: ZOCALO });
    F.caja(b, { x: x + 0.5, y: 0.3, z: z + 0.5, sx: 0.6, sy: 0.12, sz: 0.6, color: NEGRO });
    F.caja(b, { x: x + 0.5, y: 0.42, z: z + 0.5, sx: 0.6, sy: 0.12, sz: 0.6, color: ZOCALO });
  }

  // Un coche aparcado en su casilla, mirando al norte o, del revés, al sur. El del CEO es dorado, más bajo y con alerón.
  function coche(b, x, z, color, alReves, ceo) {
    F.con(b, M.une(M.traslada(x + 0.5, 0, z + 0.5), M.rotaY(alReves ? Math.PI : 0)), () => {
      F.caja(b, { x: 0, y: 0.1, z: 0, sx: 0.72, sy: ceo ? 0.22 : 0.27, sz: 0.92, color, arriba: [0.95, 0.96] });
      F.caja(b, { x: 0, y: ceo ? 0.32 : 0.37, z: 0.06, sx: 0.62, sy: ceo ? 0.17 : 0.22, sz: 0.5, color: LUNA, arriba: [0.84, 0.72] });
      F.caja(b, { x: 0, y: ceo ? 0.49 : 0.59, z: 0.06, sx: 0.53, sy: 0.03, sz: 0.37, color });
      for (const lx of [-0.33, 0.33]) for (const lz of [-0.28, 0.3]) F.con(b, M.une(M.traslada(lx, 0.115, lz), M.rotaZ(Math.PI / 2)), () => F.cilindro(b, { x: 0, y: -0.055, z: 0, r: 0.115, h: 0.11, color: NEGRO, lados: 10 }));
      for (const lx of [-0.22, 0.22]) {
        F.caja(b, { x: lx, y: 0.22, z: -0.462, sx: 0.15, sy: 0.07, sz: 0.02, color: '#ffe9a8', emi: 1 });
        F.caja(b, { x: lx * 1.1, y: 0.22, z: 0.462, sx: 0.13, sy: 0.06, sz: 0.02, color: '#ff3b3b', emi: 0.9 });
      }
      F.caja(b, { x: 0, y: 0.1, z: -0.465, sx: 0.5, sy: 0.07, sz: 0.02, color: NEGRO });
      if (!ceo) return;
      F.caja(b, { x: 0, y: 0.4, z: 0.42, sx: 0.66, sy: 0.03, sz: 0.12, color: NEGRO });
      for (const lx of [-0.26, 0.26]) F.caja(b, { x: lx, y: 0.3, z: 0.42, sx: 0.04, sy: 0.1, sz: 0.04, color: NEGRO });
      F.caja(b, { x: 0, y: 0.325, z: -0.2, sx: 0.12, sy: 0.006, sz: 0.5, color: NEGRO });
    });
  }

  // Los tramos seguidos de una misma letra en cada fila: [{ x0, x1, y }] (x1 sin incluir).
  function tramos(pl, letra) {
    const lista = [];
    for (let y = 0; y < pl.alto; y++) {
      for (let x = 0; x < pl.ancho; x++) {
        if (pl.tipo(x, y) !== letra) continue;
        const x0 = x;
        while (x < pl.ancho && pl.tipo(x, y) === letra) x++;
        lista.push({ x0, x1: x, y });
      }
    }
    return lista;
  }
  // La barrera: un poste en el extremo que toca la garita (o el izquierdo) y el brazo a rayas rojas y blancas.
  function barrera(b, pl, t) {
    const poste = pl.tipo(t.x1, t.y) === 'G' ? t.x1 - 0.1 : t.x0 + 0.1, z = t.y + 0.5;
    F.caja(b, { x: poste, y: 0, z, sx: 0.18, sy: 0.82, sz: 0.18, color: ZOCALO });
    F.caja(b, { x: poste, y: 0.82, z, sx: 0.2, sy: 0.06, sz: 0.2, color: NEGRO });
    const n = Math.round((t.x1 - t.x0) / 0.25);
    for (let i = 0; i < n; i++) F.caja(b, { x: t.x0 + (i + 0.5) * 0.25, y: 0.62, z, sx: 0.25, sy: 0.07, sz: 0.07, color: i % 2 ? '#f4f1ea' : '#e5484d' });
  }
  // La garita: una tarima, dos muretes (norte y sur), cuatro postes y el marco del techo, sin tejado para que se vea al vigilante.
  function garita(b, t) {
    const cx = (t.x0 + t.x1) / 2, largo = t.x1 - t.x0 - 0.08, z = t.y + 0.5;
    F.caja(b, { x: cx, y: 0, z, sx: largo, sy: 0.03, sz: 0.92, color: '#17404a' });
    for (const lz of [-0.44, 0.44]) {
      F.caja(b, { x: cx, y: 0, z: z + lz, sx: largo, sy: 0.4, sz: 0.06, color: GARITA });
      F.caja(b, { x: cx, y: 1.28, z: z + lz, sx: largo + 0.06, sy: 0.07, sz: 0.09, color: GARITA });
      for (const lx of [t.x0 + 0.07, t.x1 - 0.07]) F.caja(b, { x: lx, y: 0, z: z + lz, sx: 0.08, sy: 1.3, sz: 0.08, color: '#0a5c68' });
    }
    for (const lx of [t.x0 + 0.07, t.x1 - 0.07]) F.caja(b, { x: lx, y: 1.28, z, sx: 0.09, sy: 0.07, sz: 0.94, color: GARITA });
    F.cilindro(b, { x: t.x1 - 0.07, y: 1.35, z: z + 0.44, r: 0.06, h: 0.1, color: '#ffb400', emi: 1, lados: 8 });
  }
  function poste(b, x, z) {
    F.cilindro(b, { x: x + 0.5, y: 0, z: z + 0.5, r: 0.12, h: 0.06, color: NEGRO, lados: 10 });
    F.cilindro(b, { x: x + 0.5, y: 0, z: z + 0.5, r: 0.045, h: 1.45, color: '#39425f', lados: 8 });
  }
  // La puerta de la meta, en la pared de arriba: el hueco con las hojas del ascensor al fondo, el dintel y el cartel verde encendido.
  function puerta(b, x, z) {
    F.caja(b, { x: x + 0.5, y: 1.25, z: z + 0.5, sx: 1, sy: ALTO - 1.25, sz: 1, color: PARED });
    for (const lx of [0.04, 0.96]) F.caja(b, { x: x + lx, y: 0, z: z + 0.5, sx: 0.08, sy: 1.25, sz: 1, color: '#39425f' });
    for (const lx of [0.29, 0.71]) F.caja(b, { x: x + lx, y: 0, z: z + 0.12, sx: 0.4, sy: 1.25, sz: 0.08, color: '#51628f' });
    F.caja(b, { x: x + 0.5, y: 1.3, z: z + 1.0, sx: 0.72, sy: 0.14, sz: 0.04, color: '#3dff9a', emi: 1 });
  }

  // Los focos del techo: dos filas a lo largo de la planta, cada 3 casillas. Cada uno es [x, z, radio de su charco de luz].
  function focos(pl) {
    const lista = [];
    for (let z = 1.5; z < pl.alto; z += 3) for (const k of [0.25, 0.75]) lista.push([pl.ancho * k, z, 3.3]);
    return lista;
  }

  // Un color de coche que depende solo de su casilla (siempre el mismo en la misma planta).
  const colorDe = (x, y) => COCHES[(x * 7 + y * 13) % COCHES.length];
  const PIEZAS = {
    '#': (b, pl, x, y) => pared(b, x, y),
    P: (b, pl, x, y) => pilar(b, x, y),
    C: (b, pl, x, y) => coche(b, x, y, colorDe(x, y), (x + y) % 2 === 1, false),
    X: (b, pl, x, y) => coche(b, x, y, '#f5b82e', false, true),
    K: (b, pl, x, y) => poste(b, x, y),
    M: (b, pl, x, y) => puerta(b, x, y),
  };

  function construye(pl) {
    const b = F.nueva();
    suelo(b, pl);
    contorno(b, pl);
    for (let y = 0; y < pl.alto; y++) for (let x = 0; x < pl.ancho; x++) { const pieza = PIEZAS[pl.tipo(x, y)]; if (pieza) pieza(b, pl, x, y); }
    for (const t of tramos(pl, '=')) barrera(b, pl, t);
    for (const t of tramos(pl, 'G')) garita(b, t);
    return { malla: GL.malla(F.datos(b)), focos: focos(pl) };
  }

  S.escenario = Object.freeze({ construye, tramos });
})(SPY);
