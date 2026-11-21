// Fans of Zombies · EFECTOS DE PELEA (pantalla): que cada golpe se sienta. El barrido del brazo con la palanca y su estela, el retroceso
// de la escopeta con sus perdigones, el empujón (el cuerpo se lanza adelante), la sangre que salta y se queda en la nieve, el zombi
// que da un respingo al recibir y el temblor de la cámara. Todo con piezas que se reutilizan (no se crea nada nuevo en cada golpe).
'use strict';
const EFECTOS = { golpe: null, estela: null, trazas: null, tTrazas: 0, gotas: [], manchas: [], iMancha: 0, temblor: 0 };
const MAX_GOTAS = 90, MAX_MANCHAS = 160;

function preparaEfectos() {
  const e = MOTOR.escena;
  EFECTOS.estela = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.9, 16, 1, -1.15, 2.3), new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  EFECTOS.estela.rotation.x = -Math.PI / 2; e.add(EFECTOS.estela);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(7 * 2 * 3), 3));
  EFECTOS.trazas = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xffd890, transparent: true, opacity: 0, fog: false }));
  EFECTOS.trazas.frustumCulled = false; e.add(EFECTOS.trazas);
  const geo = new THREE.BoxGeometry(0.12, 0.12, 0.12), mat = new THREE.MeshBasicMaterial({ color: 0x9a1420 });
  for (let i = 0; i < MAX_GOTAS; i++) { const m = new THREE.Mesh(geo, mat); m.visible = false; e.add(m); EFECTOS.gotas.push({ m, vx: 0, vy: 0, vz: 0, vivo: false }); }
  const geoM = new THREE.CircleGeometry(0.22, 6), matM = new THREE.MeshLambertMaterial({ color: 0x7a1018 });
  for (let i = 0; i < MAX_MANCHAS; i++) { const m = new THREE.Mesh(geoM, matM); m.rotation.x = -Math.PI / 2; m.visible = false; e.add(m); EFECTOS.manchas.push(m); }
}
function limpiaEfectos() { for (const g of EFECTOS.gotas) { g.vivo = false; g.m.visible = false; } for (const m of EFECTOS.manchas) m.visible = false; EFECTOS.golpe = null; EFECTOS.temblor = 0; }

// lo que pide cada evento
function efectoGolpe(arma) { EFECTOS.golpe = { arma, t: 0, dura: arma === 'escopeta' ? 0.18 : arma === 'empujon' ? 0.28 : 0.26 }; }
function efectoTrazas(J) {
  const p = EFECTOS.trazas.geometry.attributes.position, a = p.array, W = ZOM.AJ.armas.escopeta;
  const bx = J.x + Math.sin(J.a) * 1.1, bz = J.z + Math.cos(J.a) * 1.1;
  for (let i = 0; i < 7; i++) {
    const ang = J.a + (Math.random() - 0.5) * W.cono * 1.6, l = W.alcance * (0.6 + Math.random() * 0.4);
    a.set([bx, 1.15, bz, bx + Math.sin(ang) * l, 1.0, bz + Math.cos(ang) * l], i * 6);
  }
  p.needsUpdate = true; EFECTOS.tTrazas = 0.09; EFECTOS.temblor = Math.max(EFECTOS.temblor, 0.18);
}
function sangre(x, z, n, desdeX, desdeZ) {
  const d = Math.hypot(x - desdeX, z - desdeZ) || 1, dx = (x - desdeX) / d, dz = (z - desdeZ) / d;
  for (let k = 0; k < n; k++) {
    const g = EFECTOS.gotas.find((q) => !q.vivo); if (!g) return;
    g.vivo = true; g.m.visible = true; g.m.position.set(x, 1.1 + Math.random() * 0.4, z);
    g.vx = dx * (2 + Math.random() * 3) + (Math.random() - 0.5) * 2; g.vz = dz * (2 + Math.random() * 3) + (Math.random() - 0.5) * 2; g.vy = 1.5 + Math.random() * 2.5;
  }
}
function zombiRespingo(id) { const v = VISTA.zombis.get(id); if (v) v.respingo = 0.14; }

// cada fotograma
function avanzaEfectos(J, dt) {
  const G = EFECTOS.golpe;
  if (G) { G.t += dt; if (G.t >= G.dura) EFECTOS.golpe = null; }
  const est = EFECTOS.estela, f = G && esMelee(G.arma) ? G.t / G.dura : 1;
  est.visible = f < 1;
  if (est.visible) { est.position.set(J.x, 1.05, J.z); est.rotation.z = J.a - Math.PI / 2 + (0.6 - f * 1.2); est.material.opacity = 0.85 * (1 - f); }
  EFECTOS.tTrazas -= dt; EFECTOS.trazas.material.opacity = Math.max(0, EFECTOS.tTrazas / 0.09);
  for (const g of EFECTOS.gotas) {
    if (!g.vivo) continue;
    g.vy -= 14 * dt; g.m.position.x += g.vx * dt; g.m.position.y += g.vy * dt; g.m.position.z += g.vz * dt;
    if (g.m.position.y > 0.05) continue;
    g.vivo = false; g.m.visible = false;                                   // al caer, se queda como mancha en la nieve
    const m = EFECTOS.manchas[EFECTOS.iMancha++ % MAX_MANCHAS]; m.visible = true; m.position.set(g.m.position.x, 0.025 + Math.random() * 0.01, g.m.position.z); m.scale.setScalar(0.5 + Math.random());
  }
  EFECTOS.temblor = Math.max(0, EFECTOS.temblor - dt);
}
// la postura del jugador mientras golpea: barrido con la palanca, culatazo de la escopeta o el empujón con el cuerpo
function posturaGolpe(v) {
  const G = EFECTOS.golpe;
  v.mano.rotation.set(0, 0, 0); v.cuerpo.rotation.y = 0; v.mano.position.z = 0.22; v.empuje = 0;
  if (!G) return;
  const f = G.t / G.dura, ida = Math.sin(Math.PI * f);
  if (esMelee(G.arma)) { const e2 = 1 - Math.pow(1 - f, 3); v.mano.rotation.y = 1.4 - e2 * 2.8; v.mano.rotation.x = -0.5 * ida; v.cuerpo.rotation.y = 0.5 - e2; }
  else if (G.arma === 'escopeta' || G.arma === 'pistola') { v.mano.position.z = 0.22 - 0.25 * ida; v.mano.rotation.x = -0.35 * ida; }
  else { v.empuje = 0.45 * ida; v.mano.rotation.x = -0.9 * ida; }
}
const esMelee = (a) => a !== 'empujon' && ZOM.AJ.armas[a] && !ZOM.AJ.armas[a].municion;
// el temblor que se suma a la cámara
const tiembla = () => (EFECTOS.temblor > 0 ? (Math.random() - 0.5) * EFECTOS.temblor * 1.6 : 0);
