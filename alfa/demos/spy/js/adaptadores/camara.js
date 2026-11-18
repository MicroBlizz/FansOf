// Fans of Spy · ADAPTADORES · La cámara: inclinada, desde detrás del agente, y lo sigue (decisión 49). Además tiene vista libre:
// arrastrando se mira el escenario, con dos dedos o la rueda se acerca y se aleja, y un botón la gira de lado en lado; al centrar
// (o al jugar una carta) vuelve con el agente. El punto al que mira no sale en el centro de la pantalla sino en el centro del
// hueco que dejan libre la barra de arriba y las cartas de abajo (`encuadra`), y `alcance` dice cuánto suelo cabe en ese hueco.
// También pasa de un toque en la pantalla a una casilla del suelo y de un punto del mundo a la pantalla.
// No toca el DOM ni WebGL: solo hace cuentas (se puede probar con node). El mundo: x = columna, z = fila, y = altura.
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
(function (S) {
  const M = S.gl.M;
  // dist es la distancia normal; en una pantalla estrecha se aleja lo justo para que quepan `lado` casillas a cada lado (distPara)
  const AJ = { fov: 46 * Math.PI / 180, inclina: 45 * Math.PI / 180, dist: 15, distMin: 8, distMax: 26, lado: 3.4, sube: 0.3, alto: 0.45, suave: 7 };

  function nueva() {
    return { x: 0, z: 0, dist: AJ.dist, giro: 0, giroVa: 0, libre: false, dx: 0, dz: 0, aspecto: 0.5, vp: M.ident(), inv: M.ident(), ojo: [0, 0, 0], tope: null,
      sube: AJ.sube, subeVa: AJ.sube, hueco: { arriba: 0.1, abajo: 0.65 } };
  }
  // Qué trozo de la pantalla queda libre entre lo de arriba y lo de abajo (de 0 a 1 desde arriba): lo que mira la cámara se centra ahí.
  function encuadra(cam, arriba, abajo) { cam.hueco = { arriba, abajo }; cam.subeVa = 1 - (arriba + abajo); }
  // La distancia a la que caben AJ.lado casillas a cada lado del punto al que se mira, según lo estrecha que sea la pantalla.
  const distPara = (aspecto) => Math.max(AJ.dist, Math.min(AJ.distMax - 4, AJ.lado / (Math.tan(AJ.fov / 2) * aspecto)));
  // Hasta dónde se puede arrastrar la vista libre: los bordes de la planta.
  function limites(cam, ancho, alto) { cam.tope = { ancho, alto }; }

  // Coloca la cámara de golpe sobre un punto (al empezar una planta).
  function salta(cam, x, z) { cam.x = x; cam.z = z; cam.dx = 0; cam.dz = 0; cam.libre = false; }

  // Avanza la cámara: sigue al punto (x, z) con suavidad (más el arrastre de la vista libre) y recalcula sus matrices.
  function paso(cam, dt, x, z, aspecto) {
    const k = Math.min(1, dt * AJ.suave);
    if (!cam.libre) { cam.dx += (0 - cam.dx) * k; cam.dz += (0 - cam.dz) * k; }
    cam.x += (x - cam.x) * k; cam.z += (z - cam.z) * k;
    cam.giro += (cam.giroVa - cam.giro) * k;
    cam.sube += (cam.subeVa - cam.sube) * k;
    cam.aspecto = aspecto;
    calcula(cam);
  }
  function calcula(cam) {
    const cx = cam.x + cam.dx, cz = cam.z + cam.dz, ci = Math.cos(AJ.inclina), si = Math.sin(AJ.inclina);
    cam.ojo = [cx + Math.sin(cam.giro) * ci * cam.dist, AJ.alto + si * cam.dist, cz + Math.cos(cam.giro) * ci * cam.dist];
    const sube = M.ident();
    sube[13] = cam.sube;   // lo que mira la cámara sube en la pantalla: abajo están las cartas
    cam.vp = M.une(sube, M.perspectiva(AJ.fov, cam.aspecto, 0.5, 90), M.mira(cam.ojo, [cx, AJ.alto, cz]));
    cam.inv = M.invierte(cam.vp);
  }

  // De un punto de la pantalla (0 a 1 desde la esquina de arriba a la izquierda) al punto del suelo que hay debajo. null si mira al cielo.
  function alSuelo(cam, px, py) {
    const nx = px * 2 - 1, ny = 1 - py * 2;
    const a = M.punto(cam.inv, nx, ny, -1), b = M.punto(cam.inv, nx, ny, 1);
    const p0 = [a[0] / a[3], a[1] / a[3], a[2] / a[3]], p1 = [b[0] / b[3], b[1] / b[3], b[2] / b[3]];
    if (Math.abs(p1[1] - p0[1]) < 1e-6) return null;
    const t = -p0[1] / (p1[1] - p0[1]);
    return t < 0 ? null : { x: p0[0] + (p1[0] - p0[0]) * t, z: p0[2] + (p1[2] - p0[2]) * t };
  }
  // La casilla del suelo que hay bajo un punto de la pantalla.
  function casilla(cam, px, py) {
    const s = alSuelo(cam, px, py);
    return s ? { x: Math.floor(s.x), y: Math.floor(s.z) } : null;
  }
  // De un punto del mundo a la pantalla (0 a 1). `delante` es false si queda detrás de la cámara.
  function aPantalla(cam, x, y, z) {
    const p = M.punto(cam.vp, x, y, z);
    return { x: (p[0] / p[3] + 1) / 2, y: (1 - p[1] / p[3]) / 2, delante: p[3] > 0 };
  }

  // Cuánto suelo cabe en el hueco libre, contado desde el punto al que mira la cámara: hacia arriba (norte), hacia abajo (sur) y
  // hacia un lado. Solo vale con la cámara sin girar (mirando al norte); girada() dice si lo está.
  function alcance(cam) {
    const h = cam.hueco, cx = cam.x + cam.dx, cz = cam.z + cam.dz;
    const norte = alSuelo(cam, 0.5, h.arriba), sur = alSuelo(cam, 0.5, h.abajo), lado = alSuelo(cam, 1, (h.arriba + h.abajo) / 2);
    return { norte: norte ? cz - norte.z : 99, sur: sur ? sur.z - cz : 0, lado: lado ? lado.x - cx : 0 };
  }
  const girada = (cam) => Math.abs(Math.sin(cam.giro / 2)) > 0.02 || Math.abs(Math.sin(cam.giroVa / 2)) > 0.02;

  // Vista libre: arrastrar mueve la vista (dx y dy, en partes de la pantalla), sin salirse de la planta.
  function arrastra(cam, dx, dy) {
    const c = Math.cos(cam.giro), s = Math.sin(cam.giro), t = 2 * Math.tan(AJ.fov / 2) * cam.dist;
    const ancho = t * cam.aspecto, fondo = t / Math.sin(AJ.inclina);   // lo que mide en el suelo la pantalla entera, a lo ancho y a lo alto
    cam.libre = true;
    cam.dx -= dx * ancho * c + dy * fondo * s;
    cam.dz -= -dx * ancho * s + dy * fondo * c;
    if (!cam.tope) return;
    cam.dx = Math.max(-cam.x - 1, Math.min(cam.tope.ancho + 1 - cam.x, cam.dx));
    cam.dz = Math.max(-cam.z - 1, Math.min(cam.tope.alto + 1 - cam.z, cam.dz));
  }
  function acerca(cam, factor) { cam.dist = Math.max(AJ.distMin, Math.min(AJ.distMax, cam.dist * factor)); }
  // Gira un cuarto de vuelta alrededor del agente (lo que se hubiera arrastrado la vista se deshace: si no, giraría alrededor de otro punto).
  function gira(cam) { cam.giroVa += Math.PI / 2; cam.libre = true; cam.dx = 0; cam.dz = 0; }
  function centra(cam) { cam.libre = false; cam.giroVa = Math.round(cam.giroVa / (Math.PI * 2)) * Math.PI * 2; }

  S.camara = Object.freeze({ AJ, nueva, distPara, limites, encuadra, salta, paso, calcula, alSuelo, casilla, aPantalla, alcance, girada, arrastra, acerca, gira, centra });
})(SPY);
