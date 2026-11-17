// Fans Of Taxi · GARAJE: los coches que puede llevar el jugador (el taxi de siempre y el deportivo) y la forma del deportivo, descrita
// con piezas sueltas: cajas, cilindros y «prismas» (un perfil lateral estirado a lo ancho, para el morro en cuña y la cabina tumbada).
// Aquí solo hay datos y cuentas: quien dibuja es escena.js. Solo cambia el aspecto: todos los coches se conducen igual.
// Dominio puro (sin DOM ni three), se prueba en Node.
'use strict';
const GARAJE = (() => {
  const COCHES = [
    { id: 'taxi', nombre: 'TAXI', color: 0xffcb3d },
    { id: 'deportivo', nombre: 'DEPORTIVO', color: 0xff7a1a },
  ];
  const de = id => COCHES.find(c => c.id === id) || COCHES[0];
  const siguiente = id => COCHES[(COCHES.indexOf(de(id)) + 1) % COCHES.length];

  // --- un prisma: el perfil (puntos [z, y], convexo; el morro mira a +z) estirado de -ancho/2 a +ancho/2. Devuelve triángulos sueltos
  // con su normal plana: { pos: [x, y, z, …], nor: [x, y, z, …] }
  function prisma(puntos, ancho) {
    const pos = [], nor = [], a = ancho / 2, n = puntos.length;
    const cz = puntos.reduce((s, p) => s + p[0], 0) / n, cy = puntos.reduce((s, p) => s + p[1], 0) / n;
    const cara = (v, normal) => { for (const p of orientada(v, normal)) { pos.push(p[0], p[1], p[2]); nor.push(normal[0], normal[1], normal[2]); } };
    for (let i = 1; i < n - 1; i++) for (const lado of [-1, 1]) cara([0, i, i + 1].map(k => [lado * a, puntos[k][1], puntos[k][0]]), [lado, 0, 0]);   // las dos tapas
    for (let i = 0; i < n; i++) {
      const p = puntos[i], q = puntos[(i + 1) % n], normal = haciaFuera(p, q, cz, cy);
      const A = [-a, p[1], p[0]], B = [a, p[1], p[0]], C = [a, q[1], q[0]], D = [-a, q[1], q[0]];
      cara([A, B, C], normal); cara([A, C, D], normal);
    }
    return { pos, nor };
  }
  // la normal del canto p-q, apuntando lejos del centro del perfil
  function haciaFuera(p, q, cz, cy) {
    const dz = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dz, dy) || 1;
    let ny = -dz / l, nz = dy / l;
    if (ny * ((p[1] + q[1]) / 2 - cy) + nz * ((p[0] + q[0]) / 2 - cz) < 0) { ny = -ny; nz = -nz; }
    return [0, ny, nz];
  }
  // los tres vértices en el orden que hace que el triángulo mire hacia su normal
  function orientada(v, normal) {
    const [p, q, r] = v, u = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], w = [r[0] - p[0], r[1] - p[1], r[2] - p[2]];
    const x = u[1] * w[2] - u[2] * w[1], y = u[2] * w[0] - u[0] * w[2], z = u[0] * w[1] - u[1] * w[0];
    return x * normal[0] + y * normal[1] + z * normal[2] >= 0 ? v : [p, r, q];
  }

  // --- el deportivo: bajo, ancho y en cuña. Mide casi lo mismo que el taxi (2,1 de ancho y 4,5 de largo) y la mitad de alto
  const OSCURO = 0x20242e, CRISTAL = 0x18304a, FARO = 0xfff1a8, PILOTO = 0xff4b5c, LLANTA = 0xffe9a8, RUEDA = 0x2a2438, LETRERO = 0xffcb3d;
  const CUESTA = Math.atan2(0.32, 1.4);   // la inclinación del capó
  const caja = (color, p, t, r) => ({ forma: 'caja', color, p, t, r });
  const cil = (color, p, radio, alto, lados) => ({ forma: 'cil', color, p, radio, alto, lados });
  const perfil = (color, puntos, ancho) => ({ forma: 'prisma', color, puntos, ancho });
  function carroceria(color) {
    return [
      perfil(color, [[-2.2, 0.28], [2.2, 0.28], [2.3, 0.42], [0.9, 0.74], [-1.5, 0.88], [-2.2, 0.84], [-2.26, 0.5]], 2.1),   // morro afilado, capó en cuesta y culo alto
      perfil(CRISTAL, [[-1.9, 0.7], [1.05, 0.7], [0.1, 1.08], [-0.7, 1.06], [-1.9, 0.84]], 1.56),   // la cabina, de cristal oscuro
      perfil(color, [[-0.7, 1.04], [0.12, 1.06], [0.12, 1.12], [-0.7, 1.1]], 1.2),   // el techo
      perfil(color, [[-1.9, 0.82], [-0.7, 1.04], [-0.7, 1.1], [-1.9, 0.88]], 1.2),   // la tapa del motor
      caja(color, [-0.9, 0.6, 1.42], [0.4, 0.4, 1.05], [CUESTA, 0, 0]), caja(color, [0.9, 0.6, 1.42], [0.4, 0.4, 1.05], [CUESTA, 0, 0]),   // aletas delanteras
    ];
  }
  function detalles() {
    const lamas = [[1.06, -1.0], [1.0, -1.3], [0.95, -1.6]].map(([y, z]) => caja(OSCURO, [0, y, z], [0.9, 0.04, 0.12], [-0.18, 0, 0]));
    return [
      ...lamas,
      caja(OSCURO, [0, 0.27, 2.18], [2.0, 0.07, 0.34]), caja(OSCURO, [-1.02, 0.31, 0], [0.12, 0.12, 2.1]), caja(OSCURO, [1.02, 0.31, 0], [0.12, 0.12, 2.1]),   // faldón y estribos
      caja(OSCURO, [0, 0.36, -2.2], [1.7, 0.2, 0.2]), caja(OSCURO, [0, 0.9, -2.1], [1.95, 0.05, 0.3]),   // difusor y alerón
      caja(OSCURO, [-1.05, 0.6, -0.95], [0.06, 0.2, 0.6]), caja(OSCURO, [1.05, 0.6, -0.95], [0.06, 0.2, 0.6]),   // tomas de aire
      caja(FARO, [-0.72, 0.515, 1.9], [0.46, 0.04, 0.3], [CUESTA, 0, 0]), caja(FARO, [0.72, 0.515, 1.9], [0.46, 0.04, 0.3], [CUESTA, 0, 0]),   // faros rasgados
      caja(PILOTO, [0, 0.7, -2.25], [1.8, 0.07, 0.06]),   // una sola tira de luz detrás
      caja(LETRERO, [0, 1.24, -0.3], [0.8, 0.24, 0.36]), caja(LETRERO, [-0.4, 1.12, 0.3], [0.16, 0.6, 0.1], [0.5, 0, 0]), caja(LETRERO, [0.4, 1.12, 0.3], [0.16, 0.6, 0.1], [0.5, 0, 0]),   // letrero y orejas de conejo
    ];
  }
  function ruedas() {
    const piezas = [];
    for (const x of [-1, 1]) for (const [z, r] of [[1.42, 0.37], [-1.45, 0.42]]) piezas.push(cil(RUEDA, [x * 0.92, r, z], r, 0.38, 14), cil(LLANTA, [x * 0.97, r, z], r * 0.57, 0.34, 8));
    return piezas;
  }
  const piezasDeportivo = color => [...carroceria(color), ...detalles(), ...ruedas()];

  return { COCHES, de, siguiente, prisma, piezasDeportivo };
})();
