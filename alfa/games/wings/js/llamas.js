// Fans of Wings · El fuego de los reactores: en vez de un cono fijo, un chorro de cubitos translúcidos que se comporta como fuego de
// verdad. Nace en el fondo de la tobera (que es hueca) y tiene tres capas: un resplandor tenue, un halo naranja que acaba en rojo y
// un centro claro (azulado al salir, blanco, amarillo). Crece con los gases (de crucero casi no asoma, con el turbo es largo),
// parpadea trozo a trozo y se dobla cuando el caza gira, porque cada trozo sale de donde estaba la tobera un instante antes. Los enemigos llevan la misma llama, recta. La vista llama a pintar() al final, con
// transparencia, para que el centro brille a través del halo.
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  const GL = A.gl, V = GL.V, L = A.llamas = { gas: 1 };
  // Metros y segundos. largo = la llama con los gases a 1; gases = cuánto de esa llama hay frenando, de crucero y con turbo (de crucero
  // casi no asoma de la tobera: se ve el resplandor de dentro); las tres capas (resplandor, halo y centro) y lo opaca que es cada una.
  const AJ = { largo: 4.6, ancho: 1.0, cola: 0.15, paso: 0.22, capas: [0.13, 0.3, 0.85], gases: { freno: 0.3, crucero: 0.6, turbo: 2.7 } };
  const AZUL = [0.8, 0.93, 1], BLANCO = [1, 0.98, 0.84], AMARILLO = [1, 0.84, 0.3], NARANJA = [1, 0.5, 0.1], ROJO = [0.78, 0.14, 0.05], BRASA = [1, 0.42, 0.08];
  let capas = [[], [], []], rastros = {};
  const mezcla = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const tiembla = (t, i) => 1 + Math.sin(t * 47 + i * 1.7) * 0.1 + Math.sin(t * 31 + i) * 0.07;
  // Un número entre 0 y 1 que cambia 30 veces por segundo y es distinto en cada trozo: el parpadeo del fuego (quieto en la pausa).
  const chispa = (t, i) => { const v = Math.sin(Math.floor(t * 30) * 12.9898 + i * 78.233) * 43758.5453; return v - Math.floor(v); };
  // El color del centro a lo largo de la llama: azulado al salir, blanco, amarillo y naranja en la punta.
  function colorCentro(u) {
    if (u < 0.12) return mezcla(AZUL, BLANCO, u / 0.12);
    if (u < 0.45) return mezcla(BLANCO, AMARILLO, (u - 0.12) / 0.33);
    return mezcla(AMARILLO, NARANJA, (u - 0.45) / 0.55);
  }

  L.reiniciar = function () { rastros = {}; L.gas = AJ.gases.crucero; };

  // Un trozo de llama en p: su resplandor (grande y muy tenue), su halo y, hasta el 80 %, su centro. u = de 0 (fondo de la tobera) a
  // 1 (punta). La llama es estrecha al salir, engorda un poco y acaba en punta; cada trozo baila y cambia de tamaño a su aire.
  function trozo(p, u, ancho, t, i) {
    const forma = (0.7 + 0.45 * Math.sin(Math.PI * Math.min(1, u * 1.5))) * Math.pow(1 - u, 0.55), vivo = 0.82 + 0.36 * chispa(t, i);
    const baile = ancho * 0.22 * u, q = [p[0] + (chispa(t, i + 31) - 0.5) * baile, p[1] + (chispa(t, i + 57) - 0.5) * baile, p[2] + (chispa(t, i + 83) - 0.5) * baile];
    capas[0].push([q, ancho * (1.9 * forma + 0.25) * vivo, BRASA]);
    capas[1].push([q, ancho * (1.15 * forma + 0.1) * vivo, mezcla(NARANJA, ROJO, u)]);
    if (u < 0.8) capas[2].push([q, ancho * 0.62 * forma * vivo, colorCentro(u / 0.8)]);
  }

  // Una llama recta (enemigos): sale de p hacia `atras` (vector unitario) con `largo` metros.
  L.recta = function (p, atras, largo, ancho, t) {
    const n = Math.max(5, Math.ceil(largo / AJ.paso)), l = largo * tiembla(t, p[0]);
    for (let i = 0; i < n; i++) { const u = i / (n - 1); trozo(V.suma(p, V.por(atras, u * l)), u, ancho, t, i); }
  };

  // La llama de una tobera de tu caza. p = la tobera ahora, atras = hacia dónde sopla, vel = la velocidad del caza (vector),
  // gases = 'freno' | 'crucero' | 'turbo'. Guarda por dónde ha pasado la tobera y dibuja cada trozo desde donde salió.
  L.tobera = function (clave, p, atras, vel, t, dt) {
    const r = rastros[clave] || (rastros[clave] = []);
    if (dt > 0) { r.push({ t, p: p.slice(), atras: atras.slice() }); while (r.length > 2 && t - r[0].t > AJ.cola * 2) r.shift(); }
    const largo = AJ.largo * L.gas * tiembla(t, clave.length), n = Math.max(8, Math.min(60, Math.ceil(largo / AJ.paso))), sopla = largo / AJ.cola;
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1), edad = u * AJ.cola, h = antes(r, t - edad) || { p, atras };
      trozo(V.suma(V.suma(h.p, V.por(vel, edad)), V.por(h.atras, sopla * edad)), u, AJ.ancho * (0.9 + 0.12 * Math.min(2.5, L.gas)), t, i + clave.length * 7);
    }
  };
  // Dónde estaba la tobera (y hacia dónde soplaba) en el instante `cuando`, mezclando las dos muestras que lo rodean.
  function antes(r, cuando) {
    if (!r.length) return null;
    let k = r.length - 1;
    while (k > 0 && r[k].t > cuando) k--;
    const a = r[k], b = r[Math.min(r.length - 1, k + 1)], m = b.t > a.t ? Math.max(0, Math.min(1, (cuando - a.t) / (b.t - a.t))) : 0;
    return { p: mezcla(a.p, b.p, m), atras: mezcla(a.atras, b.atras, m) };
  }

  // Los gases cambian poco a poco, para que la llama crezca y encoja en vez de saltar.
  L.gases = function (cual, dt) { L.gas += ((AJ.gases[cual] || AJ.gases.crucero) - L.gas) * Math.min(1, dt * 7); };

  // Al final de la imagen, de fuera adentro: el resplandor, muy tenue; el halo, translúcido; y el centro, casi opaco.
  L.pintar = function () {
    capas.forEach((capa, k) => { for (const [p, lado, col] of capa) GL.cubo(p, lado, col, true); GL.pintaLote(AJ.capas[k]); });
    capas = [[], [], []];
  };
})(WINGS);
