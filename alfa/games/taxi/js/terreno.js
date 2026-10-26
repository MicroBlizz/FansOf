// Fans Of Taxi · TERRENO: la altura «natural» del mundo (sin carreteras): la montaña en medio, con su cima redondeada y sus crestas; las
// tres ciudades, cada una sobre su meseta ondulada (hay cuestas) que baja al terreno por su falda; colinas suaves fuera; y el mar donde
// no hay tierra. CIUDAD aplana el terreno bajo las carreteras a partir de esto. Sin DOM ni three: se prueba con Node.
'use strict';
const TERRENO = (() => {
  const M = TAXI.mundo, MO = M.montaña;
  const suave = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  // los rectángulos de las ciudades (centro a `distancia` de la montaña en su dirección)
  const ciudades = M.ciudades.map(c => {
    const mitadX = (c.nx * (M.manzana + M.calle) + M.calle) / 2, mitadZ = (c.nz * (M.manzana + M.calle) + M.calle) / 2;
    const cx = MO.x + c.dir[0] * M.distancia, cz = MO.z + c.dir[1] * M.distancia;
    return { ...c, cx, cz, x0: cx - mitadX, z0: cz - mitadZ, x1: cx + mitadX, z1: cz + mitadZ };
  });
  // distancia desde fuera de un rectángulo (0 dentro)
  const fuera = (c, x, z) => Math.hypot(Math.max(c.x0 - x, 0, x - c.x1), Math.max(c.z0 - z, 0, z - c.z1));
  // la meseta de una ciudad: su base más ondas (cuestas de verdad) más una inclinación general
  function meseta(c, x, z) {
    const u = (x - c.cx) / 400, v = (z - c.cz) / 400;
    return c.base + M.ondas * (Math.sin(u * 2.1 + 0.4) * Math.cos(v * 1.7 + 1.1) + 0.6 * Math.sin((u + v) * 3.3)) + M.ondas * 0.9 * (u * c.dir[1] - v * c.dir[0]);
  }
  function montaña(x, z) {
    const dx = x - MO.x, dz = z - MO.z, r = Math.hypot(dx, dz);
    if (r >= MO.radio) return 0;
    const t = 1 - r / MO.radio, a = Math.atan2(dz, dx);
    const crestas = 1 + 0.1 * Math.sin(a * 5 + 1) * (1 - t) + 0.05 * Math.sin(a * 11);
    return MO.alto * t * t * (3 - 2 * t) * crestas;
  }
  const colinas = (x, z) => M.colinas * (Math.sin(x / 230 + 1) * Math.sin(z / 190) + 0.5 * Math.sin(x / 90 + z / 110));
  // altura natural, con tierra o mar
  function natural(x, z) {
    let h = montaña(x, z) + colinas(x, z), peso = 0, hc = 0;
    for (const c of ciudades) { const w = 1 - suave(0, c.falda, fuera(c, x, z)); if (w > 0) { hc += meseta(c, x, z) * w; peso += w; } }
    if (peso > 0) h = lerp(h, hc / Math.max(1, peso), Math.min(1, peso));
    return h;
  }
  // ¿es tierra? 1 dentro de las ciudades (y su falda), en la montaña y cerca; 0 en el mar. Las carreteras añaden la suya en CIUDAD
  function tierra(x, z) {
    let t = 1 - suave(MO.radio + 40, MO.radio + 160, Math.hypot(x - MO.x, z - MO.z));
    for (const c of ciudades) t = Math.max(t, 1 - suave(c.falda * 0.5, c.falda * 0.5 + 90, fuera(c, x, z)));
    return t;
  }
  const ciudadEn = (x, z) => ciudades.find(c => x >= c.x0 && x <= c.x1 && z >= c.z0 && z <= c.z1) || null;
  return { ciudades, natural, tierra, montaña, suave, fuera, ciudadEn };
})();
