// Fans of Zombies · LAS ESTACIONES EN PANTALLA (pantalla): cada estación cambia el color del suelo, la nieve de tejados, coches y montones
// (se tiñe de hierba, de hojas o de pizarra), lo que cae del cielo (nieve, lluvia, nada u hojas), las copas de los árboles (sin hojas en
// invierno, verdes en primavera y verano, naranjas en otoño), la niebla y la luz. Las reglas están en js/estaciones.js. ADR 076.
'use strict';
// lo que pinta cada estación (invierno = como está dibujado)
const ESTACION_VISTA = {
  invierno: { suelo: null, nieve: null, techo: null, cae: { color: 0xffffff, tam: 1.5, caida: 1, deriva: 1 }, hojas: null, niebla: 1, luz: 1 },
  primavera: { suelo: ['#789858', '#6a8a4a', '#8aa868', '#5a7a42', '#9a8a6a'], nieve: 0x7a9a5a, techo: 0x4a4e56, cae: { color: 0xa8c8e8, tam: 1, caida: 5, deriva: 0.3 }, hojas: 0x5a9a3a, niebla: 0.95, luz: 0.95 },
  verano: { suelo: ['#98a858', '#8a9848', '#aab868', '#7a8a40', '#b8a870'], nieve: 0x9aaa5a, techo: 0x4a4e56, cae: null, hojas: 0x4a8a2a, niebla: 1.25, luz: 1.12 },
  otono: { suelo: ['#9a7a42', '#8a6a3a', '#b88a4a', '#7a5a30', '#c89a4a'], nieve: 0x9a7240, techo: 0x5a4a3a, cae: { color: 0xd8782a, tam: 2.2, caida: 0.6, deriva: 0.6 }, hojas: 0xd8782a, niebla: 0.82, luz: 0.9 },
};
const ESTV = { actual: 'invierno', suelos: {}, sueloInvierno: null, hojas: null, nArboles: -1, verHojas: -1 };
// los colores de nieve que hay dibujados en las piezas (el último es la capa de los tejados)
const COLORES_NIEVE = [0xdfe6ee, 0xe6ecf2, 0xd6dee8, 0xeef2f6];
const TECHO_NIEVE = 3;

// cambiar de estación: suelo, nieve de las piezas, lo que cae y las copas
function aplicaEstacion(est) {
  ESTV.actual = est;
  const V = ESTACION_VISTA[est];
  ponSuelo(V);
  const salta = personajesEnEscena();
  for (const g of MOTOR.escena.children) if (!salta.has(g)) tine(g);
  MOTOR.nieveSi = !!V.cae;
  if (V.cae) { MOTOR.nieve.material.color.setHex(V.cae.color); MOTOR.tamCopo = V.cae.tam; MOTOR.caida = V.cae.caida; MOTOR.deriva = V.cae.deriva; }
  ESTV.verHojas = -1;
}
// en cada fotograma: si la partida ha cambiado de estación, se aplica; y las copas siguen a los árboles que haya
function vigilaEstacion(e) {
  const est = e ? ZOM.estacionDe(ZOM.AJ, e.min) : 'invierno';
  if (est !== ESTV.actual) aplicaEstacion(est);
  pintaHojas();
}
function personajesEnEscena() {
  const s = new Set();
  if (VISTA.jug) s.add(VISTA.jug.grupo);
  for (const v of VISTA.zombis.values()) s.add(v.mod.grupo);
  for (const v of RESCATES.vistas.values()) s.add(v.mod.grupo);
  return s;
}
function ponSuelo(V) {
  const m = MAPA.suelo.material;
  if (!ESTV.sueloInvierno) ESTV.sueloInvierno = m.map;
  m.map = V.suelo ? (ESTV.suelos[ESTV.actual] || (ESTV.suelos[ESTV.actual] = texturaSuelo(V.suelo))) : ESTV.sueloInvierno;
  m.needsUpdate = true;
}
function texturaSuelo(p) {
  const t = textura(32, 32, (g) => { g.fillStyle = p[0]; g.fillRect(0, 0, 32, 32); const r = semilla(5); for (let i = 0; i < 120; i++) { g.fillStyle = p[1 + (i % 4)]; g.fillRect(r() * 32 | 0, r() * 32 | 0, 1 + (r() * 2 | 0), 1); } });
  t.repeat.set(150, 150);
  return t;
}
// teñir la nieve de un grupo de piezas (los vértices de nieve se buscan una vez y se guardan en la geometría)
function tine(obj) {
  const V = ESTACION_VISTA[ESTV.actual];
  obj.traverse((m) => {
    const c = m.geometry && m.geometry.attributes && m.geometry.attributes.color;
    if (!c) return;
    const N = m.geometry.userData.nieve || (m.geometry.userData.nieve = buscaNieve(c.array));
    if (!N.idx.length) return;
    for (let k = 0; k < N.idx.length; k++) {
      const i = N.idx[k] * 3, hex = !V.nieve ? COLORES_NIEVE[N.que[k]] : N.que[k] === TECHO_NIEVE ? V.techo : V.nieve;
      c.array[i] = ((hex >> 16) & 255) / 255; c.array[i + 1] = ((hex >> 8) & 255) / 255; c.array[i + 2] = (hex & 255) / 255;
    }
    c.needsUpdate = true;
  });
}
function buscaNieve(a) {
  const rgb = COLORES_NIEVE.map((h) => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255]), idx = [], que = [];
  for (let i = 0; i < a.length; i += 3) {
    for (let q = 0; q < rgb.length; q++) if (Math.abs(a[i] - rgb[q][0]) < 0.003 && Math.abs(a[i + 1] - rgb[q][1]) < 0.003 && Math.abs(a[i + 2] - rgb[q][2]) < 0.003) { idx.push(i / 3); que.push(q); break; }
  }
  return { idx: Int32Array.from(idx), que: Uint8Array.from(que) };
}
// las copas de los árboles: una malla repetida (una copa por árbol de MAPA.arboles); se rehace si cambian los árboles o la estación
function pintaHojas() {
  const V = ESTACION_VISTA[ESTV.actual], A = MAPA.arboles || [];
  if (ESTV.verHojas === TROZOS.version && ESTV.nArboles === A.length) return;
  ESTV.verHojas = TROZOS.version; ESTV.nArboles = A.length;
  if (ESTV.hojas) { MOTOR.escena.remove(ESTV.hojas); ESTV.hojas.geometry.dispose(); ESTV.hojas.material.dispose(); ESTV.hojas = null; }
  if (!V.hojas || !A.length) return;
  const malla = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.3, 0), new THREE.MeshLambertMaterial({ color: V.hojas }), A.length), m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
  A.forEach((t, i) => { p.set(t.x, 3.5 * t.s, t.z); s.setScalar(t.s * (1 + (i % 3) * 0.15)); q.setFromAxisAngle(p.clone().set(0, 1, 0), i); m.compose(p, q, s); malla.setMatrixAt(i, m); });
  malla.castShadow = true; ESTV.hojas = malla; MOTOR.escena.add(malla);
}
// la luz y la niebla de la estación (se aplican después de las del día)
function luzEstacion() {
  const V = ESTACION_VISTA[ESTV.actual];
  MOTOR.escena.fog.near *= V.niebla; MOTOR.escena.fog.far *= V.niebla; MOTOR.hemi.intensity *= V.luz;
}
