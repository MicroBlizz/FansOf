// Fans Of Taxi · ADAPTADOR de la física a Rapier: el mundo físico. Convierte lo sólido de cada trozo (js/fisica/formas.js, datos
// puros) en colisionadores fijos de Rapier, carga los trozos cercanos al coche y descarga los lejanos, y avanza la simulación.
//
// Es la única pieza (con coche-rapier.js) que conoce Rapier: si mañana se cambia de motor, solo cambian estas dos.
'use strict';
const FISICA_RAPIER = (() => {
  const F = TAXI.fisica, TR = TAXI.mundo.trozo;
  let R = null, mundo = null;
  const cargados = new Map();   // índice del trozo -> sus colisionadores

  const disponible = () => typeof RAPIER !== 'undefined' && !!RAPIER.World;

  function crear() {
    R = RAPIER;
    mundo = new R.World({ x: 0, y: -TAXI.coche.gravedad, z: 0 });
    mundo.timestep = TAXI.paso;
    bordes();
    return { R, mundo };
  }
  // cuatro muros en el borde del mundo (más allá, el mar): nadie se sale del mapa
  function bordes() {
    const A = CIUDAD.ancho, L = CIUDAD.largo, fijo = mundo.createRigidBody(R.RigidBodyDesc.fixed());
    for (const [x, z, mx, mz] of [[-1, L / 2, 1, L], [A + 1, L / 2, 1, L], [A / 2, -1, A, 1], [A / 2, L + 1, A, 1]]) mundo.createCollider(R.ColliderDesc.cuboid(mx, 400, mz).setTranslation(x, 0, z), fijo);
  }

  // un giro alrededor del eje vertical (ang) y una inclinación a lo largo (incl), como cuaternión
  function giro(ang, incl) {
    const cy = Math.cos(ang / 2), sy = Math.sin(ang / 2), cx = Math.cos(-incl / 2), sx = Math.sin(-incl / 2);
    return { x: cy * sx, y: sy * cx, z: -sy * sx, w: cy * cx };   // primero el giro y luego la inclinación (orden YXZ)
  }

  function montaTrozo(t) {
    const formas = FORMAS.deTrozo(t), cuerpo = mundo.createRigidBody(R.RigidBodyDesc.fixed());
    for (const p of formas.mallas) {
      const vertices = Float32Array.from(p), indices = new Uint32Array(vertices.length / 3);
      for (let i = 0; i < indices.length; i++) indices[i] = i;
      mundo.createCollider(R.ColliderDesc.trimesh(vertices, indices).setFriction(1), cuerpo);
    }
    for (const c of formas.cajas) mundo.createCollider(R.ColliderDesc.cuboid(c.mx, c.my, c.mz).setTranslation(c.x, c.y, c.z).setRotation(giro(c.ang, c.incl)).setFriction(0.3), cuerpo);
    for (const c of formas.cilindros) mundo.createCollider(R.ColliderDesc.cylinder(c.medio, c.radio).setTranslation(c.x, c.y, c.z).setFriction(0.3), cuerpo);
    return cuerpo;
  }

  // los trozos sólidos alrededor de (x, z): el que se pisa se monta enseguida; los demás, uno por llamada
  function actualizar(x, z) {
    const quiero = new Set();
    let pendiente = null, mejor = Infinity;
    for (const t of CIUDAD.trozos) {
      const d = Math.hypot(Math.max(t.x0 - x, 0, x - t.x1), Math.max(t.z0 - z, 0, z - t.z1));   // distancia al borde del trozo
      if (d > F.radioCarga) continue;
      const k = t.i * CIUDAD.NTZ + t.j; quiero.add(k);
      if (!cargados.has(k) && d < mejor) { mejor = d; pendiente = t; }
    }
    if (pendiente) cargados.set(pendiente.i * CIUDAD.NTZ + pendiente.j, montaTrozo(pendiente));
    if (pendiente && mejor === 0) return actualizar(x, z);   // estaba encima: que no falte ninguno de los que se pisan
    for (const [k, cuerpo] of cargados) if (!quiero.has(k)) { mundo.removeRigidBody(cuerpo); cargados.delete(k); }
  }

  const paso = () => mundo.step();
  const estado = () => ({ trozos: cargados.size, colisionadores: mundo ? mundo.colliders.len() : 0 });

  return { disponible, crear, actualizar, paso, estado, TR };
})();
