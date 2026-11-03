// Fans Of Pets · MUÑECO kawaii por código (docs/pets/animacion-2d.md, «muñeco por código»; tarjeta de Arkioner del 3-11-2026). Con una
// pose (muneco-poses.js) y una piel (pieles.js) dice QUÉ formas pintar y en qué capas, sin dibujar nada: elipses, «tubos» (curvas gruesas
// del hombro a la mano, brazos y orejas de goma que se doblan solos) y líneas. Cada capa con contorno se pinta como una silueta unida
// (todos los contornos y luego todos los rellenos), así las juntas no se ven nunca. Unidades del muñeco: pies en y = 0, arriba negativo.
'use strict';
PT.muneco = (() => {
  const CUELLO = [0, -215], HOMBRO = [70, -170], CADERA = [45, -90];
  const CABEZA = { rx: 165, ry: 140, y: -70 };
  const ALTO = 570;
  const MANO_ALTA = -190;   // por encima de esta altura, la mano va por delante de la cabeza   // de los pies a la punta de las orejas largas, en reposo
  const rota = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
  const suma = (a, b) => [a[0] + b[0], a[1] + b[1]];

  // lleva una forma de las coordenadas de la cabeza (origen en el cuello) a las del muñeco, con el giro y lo que baja la cabeza
  function enCabeza(f, pose) {
    const pon = p => suma(CUELLO, rota([p[0], p[1] + 10 * pose.baja], pose.giro));
    if (f.t === 'elipse') {
      const [x, y] = pon([f.x, f.y]);
      return { ...f, x, y, g: (f.g || 0) + pose.giro };
    }
    return { ...f, p: f.p.map(pon) };
  }
  // un brazo de goma: del hombro a la mano, con el codo un poco hacia fuera para que la curva sea suave
  function brazo(lado, mano, color) {
    const h = [lado * HOMBRO[0], HOMBRO[1]], medio = [(h[0] + mano[0]) / 2, (h[1] + mano[1]) / 2];
    const dx = mano[0] - h[0], dy = mano[1] - h[1], largo = Math.hypot(dx, dy) || 1;
    const signo = lado * dy >= 0 ? 1 : -1;   // de las dos perpendiculares, la que va hacia fuera del cuerpo
    const codo = [medio[0] + signo * 28 * dy / largo, medio[1] - signo * 28 * dx / largo];
    return { t: 'tubo', p: [h, codo, mano], w: 46, c: color };
  }
  function pierna(lado, pie, color) {
    const c = [lado * CADERA[0], CADERA[1]];
    return { t: 'tubo', p: [c, [(c[0] + pie[0]) / 2 + lado * 4, (c[1] + pie[1]) / 2], pie], w: 52, c: color };
  }
  function cola(piel) {
    if (piel.cola === 'rayas') {
      // una cadena de bolas de color alterno: dentro de la silueta unida salen las rayas
      return [[90, -70, 34], [128, -96, 32], [160, -128, 30], [184, -164, 28], [196, -200, 24]]
        .map(([x, y, r], i) => ({ t: 'elipse', x, y, rx: r, ry: r, c: i % 2 ? piel.raya : piel.pelo }));
    }
    return [{ t: 'elipse', x: 92, y: -100, rx: 30, ry: 28, c: piel.pelo }];
  }
  // las orejas en coordenadas de la cabeza: largas (tubos que se caen con «orejas» y se mecen con el muelle) o redondas
  function orejas(piel, pose, muelle) {
    const caida = pose.orejas + muelle;
    if (piel.orejas === 'largas') {
      return [-1, 1].map(lado => {
        const base = [lado * 60, -150], a = lado * -0.9 * caida;
        const p = [[0, 0], [lado * 22, -100], [lado * 10, -180]].map(q => suma(base, rota(q, -a)));
        return { t: 'tubo', p, w: 58, c: piel.pelo, interior: piel.interior };
      });
    }
    return [-1, 1].map(lado => {
      const [x, y] = rota([lado * 118, -180 - CABEZA.y], lado * 0.35 * caida);
      return { t: 'elipse', x, y: y + CABEZA.y, rx: 50, ry: 46, c: piel.pelo, interior: piel.interior };
    });
  }
  // lo de dentro de las orejas (el rosa del conejo, lo oscuro del hurón): sin contorno, y luego la cabeza lo tapa por abajo
  function interiorOrejas(lista) {
    return lista.map(o => (o.t === 'tubo'
      ? { t: 'linea', p: o.p.map((q, i) => (i === 0 ? suma(q, [0, -18]) : q)), w: 22, c: o.interior }
      : { t: 'elipse', x: o.x, y: o.y + 4, rx: o.rx * 0.55, ry: o.ry * 0.55, c: o.interior }));
  }
  // los detalles de la piel que van dentro de la cabeza (recortados a ella) y los que salen por fuera (con contorno)
  function detallesCabeza(piel) {
    const dentro = [], fuera = [];
    if (piel.hocico) dentro.push({ t: 'elipse', x: 0, y: 10, rx: 150, ry: 92, c: piel.hocico });
    if (piel.detalles.includes('antifaz')) dentro.push({ t: 'poli', p: [[-180, -98], [180, -98], [180, -22], [80, -14], [0, -26], [-80, -14], [-180, -22]], c: piel.antifaz });
    if (piel.detalles.includes('cinta')) {
      dentro.push({ t: 'poli', p: [[-180, -150], [180, -150], [180, -112], [-180, -112]], c: piel.cinta });
      fuera.push({ t: 'tubo', p: [[150, -132], [200, -150], [236, -118]], w: 30, c: piel.cinta }, { t: 'tubo', p: [[150, -132], [196, -110], [216, -70]], w: 28, c: piel.cinta });
    }
    if (piel.detalles.includes('corona')) {
      fuera.push({ t: 'poli', p: [[-58, -198], [-66, -262], [-32, -226], [0, -270], [32, -226], [66, -262], [58, -198]], c: '#ffd84a' });
    }
    return { dentro, fuera };
  }
  const OSCURO = '#1b1020';
  // el trazo de los ojos cerrados y las cejas: oscuro, o claro sobre un antifaz (si no, no se vería)
  const trazoOjo = piel => (piel.antifaz ? '#fdf6ea' : OSCURO);
  // los ojos, según la cara que toque, en coordenadas de la cabeza (dx: mirar a los lados; dy: mirar abajo)
  function ojos(tipo, piel, dx, dy) {
    const sal = [], c = trazoOjo(piel);
    for (const s of [-1, 1]) {
      const x = s * 62 + dx, y = -58 + dy;
      if (tipo === 'cerrados') sal.push({ t: 'linea', p: [[x - 24, y + 2], [x, y + 14], [x + 24, y + 2]], w: 8, c });
      else if (tipo === 'feliz') sal.push({ t: 'linea', p: [[x - 24, y + 8], [x, y - 14], [x + 24, y + 8]], w: 8, c });
      else if (tipo === 'apretados') sal.push({ t: 'linea', p: [[x - s * 20, y - 14], [x + s * 18, y], [x - s * 20, y + 14]], w: 8, c });
      else sal.push(...ojoAbierto(tipo, piel, x, y, s));
    }
    return sal;
  }
  function ojoAbierto(tipo, piel, x, y, s) {
    const r = tipo === 'sorpresa' ? 0.8 : 1, brillo = tipo === 'abajo' ? 10 : 0, sal = [];
    if (piel.antifaz) sal.push({ t: 'elipse', x, y, rx: 31 * r, ry: 37 * r, c: '#fdf6ea' });   // sobre el antifaz, el ojo lleva un aro claro
    sal.push({ t: 'elipse', x, y, rx: 27 * r, ry: 33 * r, c: OSCURO },
      { t: 'elipse', x: x - 9, y: y - 12 + brillo, rx: 10 * r, ry: 12 * r, c: '#ffffff' }, { t: 'elipse', x: x + 10, y: y + 13, rx: 5, ry: 5, c: '#ffffff' });
    if (tipo === 'sueno') sal.push({ t: 'elipse', x, y: y - 22, rx: 34, ry: 26, c: piel.antifaz || piel.pelo });
    if (tipo === 'triste') sal.push({ t: 'linea', p: [[x + s * 26, y - 38], [x + s * 6, y - 46], [x - s * 18, y - 52]], w: 7, c: trazoOjo(piel) });
    if (tipo === 'enfado') sal.push({ t: 'poli', p: [[x - 34, y - 40], [x + 34, y - 40], [x + 34, y + (s < 0 ? -12 : -34)], [x - 34, y + (s < 0 ? -34 : -12)]], c: piel.antifaz || piel.pelo },
      { t: 'linea', p: [[x + s * 30, y - 34], [x, y - 24], [x - s * 30, y - 12]], w: 8, c: trazoOjo(piel) });
    return sal;
  }
  // las bocas, en coordenadas de la cabeza
  const BOCAS = {
    base: (x, y) => [{ t: 'linea', p: [[x - 16, y], [x - 8, y + 12], [x, y + 2], [x + 8, y + 12], [x + 16, y]], w: 6, c: OSCURO }],
    sonrisa: (x, y) => [{ t: 'linea', p: [[x - 22, y - 2], [x, y + 18], [x + 22, y - 2]], w: 7, c: OSCURO }],
    abierta: (x, y) => [{ t: 'poli', p: [[x - 22, y - 4], [x + 22, y - 4], [x + 14, y + 16], [x, y + 22], [x - 14, y + 16]], c: '#7a2236' }, { t: 'elipse', x, y: y + 14, rx: 10, ry: 6, c: '#ff8fa8' }],
    masca: (x, y, t) => [{ t: 'elipse', x, y: y + 6, rx: 12 + 4 * Math.sin(t * 14), ry: 7 + 3 * Math.cos(t * 14), c: '#7a2236' }],
    triste: (x, y) => [{ t: 'linea', p: [[x - 18, y + 14], [x, y], [x + 18, y + 14]], w: 7, c: OSCURO }],
    enfado: (x, y) => [{ t: 'linea', p: [[x - 18, y + 12], [x - 6, y + 4], [x + 6, y + 10], [x + 18, y + 4]], w: 7, c: OSCURO }],
    o: (x, y) => [{ t: 'elipse', x, y: y + 8, rx: 9, ry: 11, c: '#7a2236' }],
    bostezo: (x, y) => [{ t: 'elipse', x, y: y + 12, rx: 22, ry: 26, c: '#7a2236' }, { t: 'elipse', x, y: y + 26, rx: 12, ry: 7, c: '#ff8fa8' }],
    dientes: (x, y) => [{ t: 'poli', p: [[x - 24, y - 2], [x + 24, y - 2], [x + 18, y + 18], [x - 18, y + 18]], c: '#7a2236' }, { t: 'poli', p: [[x - 20, y], [x + 20, y], [x + 18, y + 8], [x - 18, y + 8]], c: '#ffffff' }],
    apretada: (x, y) => [{ t: 'linea', p: [[x - 16, y + 6], [x - 8, y + 2], [x, y + 6], [x + 8, y + 2], [x + 16, y + 6]], w: 6, c: OSCURO }],
    oculta: () => [],
  };
  // la cara entera: mejillas, ojos y boca (moviéndose dentro de la cabeza al mirar o al bajar la vista)
  function cara(pose, piel, t) {
    const dx = 38 * pose.mira, dy = 14 * Math.max(0, pose.baja), rojo = pose.boca === 'apretada' || pose.ojos === 'enfado';
    const mejillas = [-1, 1].map(s => ({ t: 'elipse', x: s * 100 + dx, y: -20 + dy, rx: 30, ry: 18, c: rojo ? '#ff7a8a' : piel.mejillas, a: 0.8 }));
    return [...mejillas, ...ojos(pose.ojos, piel, dx, dy), ...(BOCAS[pose.boca] || BOCAS.base)(dx, -18 + dy, t)];
  }

  // las capas del muñeco con esa pose y esa piel: { cuerpo, cabeza, brazos: { detras, delante } } (listas de { contorno, formas,
  // recorte? }), que se pintan así: cuerpo, objetos delante del cuerpo, brazos de detrás, cabeza, brazos de delante. muelle: lo que se mecen las orejas (lo lleva quien pinta, que guarda
  // el estado). anclas: dónde quedan la boca, los ojos y lo alto de la cabeza, para los objetos y los efectos
  function capas(pose, piel, muelle = 0, t = 0) {
    const cab = { t: 'elipse', x: 0, y: CABEZA.y, rx: CABEZA.rx, ry: CABEZA.ry, c: piel.pelo };
    const enC = f => enCabeza(f, pose), ors = orejas(piel, pose, muelle), det = detallesCabeza(piel), cabeza = enC(cab);
    const cuerpo = [
      { contorno: true, formas: [...cola(piel), pierna(-1, pose.pies.i, piel.pelo), pierna(1, pose.pies.d, piel.pelo), { t: 'elipse', x: 0, y: -125, rx: 95, ry: 88, c: piel.pelo }] },
      { contorno: false, formas: [{ t: 'elipse', x: 0, y: -112, rx: 56, ry: 52, c: piel.barriga }] },
    ];
    const laCabeza = [
      { contorno: true, formas: [...ors.map(enC), cabeza] },
      { contorno: false, formas: [...interiorOrejas(ors).map(enC), cabeza] },   // el interior y otra vez la cabeza: las orejas salen de detrás
      { contorno: false, recorte: cabeza, formas: det.dentro.map(enC) },
      { contorno: true, formas: det.fuera.map(enC) },
      { contorno: false, formas: cara(pose, piel, t).map(enC) },
    ].filter(c => c.formas.length);
    // un brazo con la mano abajo va detrás de la cabeza (así el hombro no tapa la barbilla); levantado, por delante
    const brazos = { detras: [], delante: [] };
    for (const [lado, mano] of [[-1, pose.manos.i], [1, pose.manos.d]]) {
      brazos[mano[1] < MANO_ALTA ? 'delante' : 'detras'].push({ contorno: true, formas: [brazo(lado, mano, piel.pelo)] });
    }
    const anclas = { boca: enC({ t: 'linea', p: [[0, -18]] }).p[0], cima: enC({ t: 'linea', p: [[0, CABEZA.y - CABEZA.ry]] }).p[0],
      ojos: [-1, 1].map(s => enC({ t: 'linea', p: [[s * 62, -58]] }).p[0]) };
    return { cuerpo, cabeza: laCabeza, brazos, anclas };
  }
  // el muelle de las orejas: sigue a su objetivo con retraso y rebote. estado { x, v } → el nuevo (puro: quien pinta lo guarda)
  function muelle(estado, objetivo, dt) {
    const v = (estado.v + (objetivo - estado.x) * 120 * dt) * Math.pow(0.002, dt);
    return { x: estado.x + v * dt, v };
  }
  return { capas, muelle, ALTO, CUELLO };
})();
