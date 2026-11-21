// Boceto 3D de Fans of Rumble · El escenario: el dibujante 3D, la cámara (inclinada como en Warcraft Rumble), las luces,
// el cielo del atardecer, el suelo pintado (hierba, caminos y la plaza de Microblizz), el río que se mueve y la ciudad
// del fondo. Las medidas salen del campo del juego (01-campo.js): 10 px del juego = 1 unidad en 3D, el río en z = 0,
// tu lado hacia +z (abajo en la pantalla) y Microblizz hacia -z (arriba).
'use strict';
import * as THREE from './three.min.js';
import { caja, unir } from './piezas.js';
import { sorteo } from './edificios.js';

export const CAMPO = { x0: -25.2, x1: 25.2, z0: -36.2, z1: 36.2, rio: 2.0, puentes: [-16, 16], puenteMedio: 2.7 };
export const CAMINOS = [-1, 1].map(s => [[0, 22.4], [s * 16, 15.5], [s * 16, -15.5], [0, -22.4]]);

export function crearDibujante(lienzo) {
  const r = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, powerPreference: 'high-performance' });
  r.outputColorSpace = THREE.SRGBColorSpace;
  return r;
}

export function crearEscena() {
  const escena = new THREE.Scene();
  // cielo: un degradado de atardecer (como el cielo morado detrás de la sede en el juego)
  const cv = document.createElement('canvas'); cv.width = 4; cv.height = 256;
  const c = cv.getContext('2d'), g = c.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#1d0f33'); g.addColorStop(0.55, '#4a2f72'); g.addColorStop(1, '#b8739a');
  c.fillStyle = g; c.fillRect(0, 0, 4, 256);
  const cielo = new THREE.CanvasTexture(cv); cielo.colorSpace = THREE.SRGBColorSpace;
  escena.background = cielo;
  escena.fog = new THREE.Fog(0x4a2f72, 120, 230);
  // luces: el cielo da una luz suave a todo y el sol (por delante y a la izquierda) marca los tres tonos del dibujo animado
  escena.add(new THREE.HemisphereLight(0xfff1e0, 0x6a5a86, 1.6));
  const sol = new THREE.DirectionalLight(0xfff4e0, 2.4);
  sol.position.set(-30, 60, 40); escena.add(sol);
  return escena;
}

// el suelo pintado en un lienzo, como buildBG del juego
export function crearSuelo(escena, caminoCerca) {
  const ESC = 12, AN = 60, LA = 92, W = AN * ESC, H = LA * ESC;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d'), r = sorteo(37), az = (a, b) => a + r() * (b - a);
  const px = x => (x + AN / 2) * ESC, pz = z => (z + LA / 2) * ESC;
  let g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#a7a77a'); g.addColorStop(0.24, '#9fae69'); g.addColorStop(0.45, '#84b452'); g.addColorStop(0.55, '#6cb04a'); g.addColorStop(0.78, '#55a040'); g.addColorStop(1, '#3f8a3a');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  for (let z = -46; z < 46; z += 4.4) { c.fillStyle = 'rgba(255,255,255,0.05)'; c.fillRect(0, pz(z), W, 2.2 * ESC); }
  c.lineWidth = 1.6; c.lineCap = 'round';
  for (let i = 0; i < 5200; i++) {
    const x = az(0, W), y = az(0, H);
    c.strokeStyle = y < H / 2 ? (r() < 0.5 ? '#8c9a55' : '#6f9a45') : ['#3f8f3a', '#5fae48', '#4a9a3f', '#7cc456'][(r() * 4) | 0];
    c.globalAlpha = az(0.3, 0.7); c.beginPath(); c.moveTo(x, y); c.lineTo(x + az(-2, 2), y - az(3, 7)); c.stroke();
  }
  c.globalAlpha = 1;
  // los caminos de tierra por donde van las tropas
  for (const camino of CAMINOS) for (const [ancho, color] of [[4.2, 'rgba(176,140,84,0.45)'], [2.6, 'rgba(214,184,128,0.55)']]) {
    c.beginPath(); camino.forEach(([x, z], i) => (i ? c.lineTo(px(x), pz(z)) : c.moveTo(px(x), pz(z))));
    c.strokeStyle = color; c.lineWidth = ancho * ESC; c.lineJoin = 'round'; c.stroke();
  }
  for (let i = 0; i < 260; i++) { const x = az(-25, 25), z = az(-36, 36); if (!caminoCerca(x, z, 1.8)) continue; c.fillStyle = `rgba(120,92,60,${az(0.2, 0.45)})`; c.beginPath(); c.ellipse(px(x), pz(z), az(2, 5), az(1.5, 3.5), az(0, 3), 0, Math.PI * 2); c.fill(); }
  // la plaza de oficinas de Microblizz «comiéndose» la pradera
  const borde = x => pz(-19.5 + Math.sin(x * 0.45) * 0.8 + Math.sin(x * 1.3) * 0.4 - (Math.abs(x) < 12 ? 3.4 * Math.cos((x / 12) * Math.PI / 2) : 0));
  c.save(); c.beginPath(); c.moveTo(0, 0); c.lineTo(W, 0);
  for (let x = 30; x >= -30; x -= 0.5) c.lineTo(px(x), borde(x));
  c.closePath(); c.fillStyle = '#a9b1bf'; c.fill(); c.clip();
  c.strokeStyle = 'rgba(70,80,100,0.25)'; c.lineWidth = 2; c.beginPath();
  for (let x = -30; x <= 30; x += 2.6) { c.moveTo(px(x), 0); c.lineTo(px(x), H); }
  for (let z = -46; z <= 0; z += 2.6) { c.moveTo(0, pz(z)); c.lineTo(W, pz(z)); }
  c.stroke();
  for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(60,70,95,${az(0.05, 0.14)})`; c.fillRect(px(-30 + Math.floor(az(0, 23)) * 2.6), pz(-46 + Math.floor(az(0, 12)) * 2.6), 2.6 * ESC, 2.6 * ESC); }
  c.strokeStyle = 'rgba(30,36,54,0.45)'; c.lineWidth = 3;
  for (let i = 0; i < 6; i++) { const x = az(-24, 24); c.beginPath(); c.moveTo(px(x), pz(-40)); c.bezierCurveTo(px(x + az(-8, 8)), pz(-33), px(x + az(-8, 8)), pz(-27), px(x + az(-6, 6)), pz(-20)); c.stroke(); }
  c.restore();
  c.beginPath(); for (let x = -30; x <= 30; x += 0.5) (x === -30 ? c.moveTo(px(x), borde(x)) : c.lineTo(px(x), borde(x)));
  c.strokeStyle = '#7d8597'; c.lineWidth = 4; c.stroke();
  // orillas del río
  c.fillStyle = '#c9ad74'; c.fillRect(0, pz(-2.7), W, 5.4 * ESC);
  // fuera del campo, un poco más oscuro
  const sombra = c.createLinearGradient(0, 0, W, 0);
  sombra.addColorStop(0, 'rgba(20,40,20,0.35)'); sombra.addColorStop(0.07, 'rgba(20,40,20,0)'); sombra.addColorStop(0.93, 'rgba(20,40,20,0)'); sombra.addColorStop(1, 'rgba(20,40,20,0.35)');
  c.fillStyle = sombra; c.fillRect(0, 0, W, H);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const suelo = new THREE.Mesh(new THREE.PlaneGeometry(AN, LA).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: tex }));
  escena.add(suelo);
  // más allá: hierba lisa hasta el horizonte
  const lejos = new THREE.Mesh(new THREE.PlaneGeometry(600, 600).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x3f7f3a }));
  lejos.position.y = -0.05; escena.add(lejos);
  // y detrás de la sede, la calle gris hasta la ciudad
  const calle = new THREE.Mesh(new THREE.PlaneGeometry(600, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x8d95a6 }));
  calle.position.set(0, -0.03, -64); escena.add(calle);
  // las orillas con relieve
  const orillas = [];
  for (const s of [-1, 1]) for (let x = -30; x < 30; x += 1.5) orillas.push(caja(s < 0 ? 0xd9c08a : 0xcdb27c, [x + 0.75, 0.06, s * 2.25], [1.55, 0.24, 0.7], [0, 0, (x % 3) * 0.01]));
  escena.add(new THREE.Mesh(unir(orillas), new THREE.MeshLambertMaterial({ vertexColors: true })));
}

// el agua: un dibujo que se mueve con el tiempo (ondas y espuma en las orillas)
export function crearRio(escena) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform float uT; varying vec2 vUv;
      void main(){
        vec2 p = vec2(vUv.x * 120.0, vUv.y);
        float orilla = min(vUv.y, 1.0 - vUv.y);
        vec3 hondo = vec3(0.16, 0.45, 0.78), claro = vec3(0.38, 0.74, 0.96);
        vec3 c = mix(claro, hondo, smoothstep(0.05, 0.45, orilla));
        float onda = sin(p.x * 1.3 - uT * 2.2 + sin(p.y * 9.0 + uT) * 1.4);
        c += smoothstep(0.86, 0.97, onda) * 0.22 * smoothstep(0.08, 0.3, orilla);
        float espuma = 1.0 - smoothstep(0.06, 0.14, orilla + sin(p.x * 2.0 + uT * 3.0) * 0.025);
        c = mix(c, vec3(0.93, 0.97, 1.0), espuma);
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const agua = new THREE.Mesh(new THREE.PlaneGeometry(240, 4.0).rotateX(-Math.PI / 2), mat);
  agua.position.y = 0.04; escena.add(agua);
  return mat.uniforms.uT;
}

// la ciudad de Microblizz al fondo, con ventanas encendidas
export function crearCiudad(escena) {
  const r = sorteo(11), p = [];
  for (let x = -70; x < 70; x += 4 + r() * 3) {
    const alto = 6 + r() * 20, ancho = 3 + r() * 3, z = -50 - r() * 12;
    p.push(caja(r() < 0.5 ? 0x3b2a5a : 0x4a3570, [x, alto / 2, z], [ancho, alto, 3]));
    for (let y = 2; y < alto - 1; y += 1.6) for (let wx = -ancho / 2 + 0.8; wx < ancho / 2 - 0.4; wx += 1.1) if (r() < 0.35) p.push(caja(r() < 0.8 ? 0xffd36b : 0x7df3ff, [x + wx, y, z + 1.55], [0.5, 0.6, 0.1]));
  }
  escena.add(new THREE.Mesh(unir(p), new THREE.MeshBasicMaterial({ vertexColors: true })));
}

/* ---------- la cámara ---------- */
// lo que tiene que caber: los dos carriles con sus torres (de la sede de Microblizz, con su cartel, a La Madriguera)
const ESQUINAS = [[-18.5, -26.5, 0], [18.5, -26.5, 0], [-18.5, 27, 0], [18.5, 27, 0], [0, -22.4, 12.5]].map(a => new THREE.Vector3(a[0], a[2], a[1]));
const _v = new THREE.Vector3();

// busca a qué distancia poner la cámara para que quepa todo el campo entre el marcador (arriba) y las cartas (abajo)
export function encuadre(camara, ancho, alto, arriba, abajo, modo) {
  camara.aspect = ancho / alto; camara.updateProjectionMatrix();
  if (modo === 'cerca') {   // de cerca: sigue a tu última unidad (ver principal.js)
    const objetivo = new THREE.Vector3(-14, 0, 4), inclina = 1.08, dist = ancho > alto ? 23 : 26;
    const desde = new THREE.Vector3(0, Math.sin(inclina), Math.cos(inclina)).multiplyScalar(dist);
    return { objetivo, desde, posicion: objetivo.clone().add(desde) };
  }
  const inclina = 0.84;   // unos 48 grados, como en Warcraft Rumble
  const dir = new THREE.Vector3(0, Math.sin(inclina), Math.cos(inclina));
  const yArriba = 1 - (2 * arriba) / alto, yAbajo = -1 + (2 * abajo) / alto, margen = 0.04;
  const objetivo = new THREE.Vector3(0, 0, 2);
  let dist = 80;
  const mide = () => {
    camara.position.copy(objetivo).addScaledVector(dir, dist); camara.lookAt(objetivo); camara.updateMatrixWorld();
    let x0 = 9, x1 = -9, y0 = 9, y1 = -9;
    for (const e of ESQUINAS) { _v.copy(e).project(camara); x0 = Math.min(x0, _v.x); x1 = Math.max(x1, _v.x); y0 = Math.min(y0, _v.y); y1 = Math.max(y1, _v.y); }
    return { x0, x1, y0, y1 };
  };
  for (let vuelta = 0; vuelta < 6; vuelta++) {
    let lo = 20, hi = 400;
    for (let i = 0; i < 30; i++) {
      dist = (lo + hi) / 2; const m = mide();
      const cabe = m.x0 >= -1 + margen && m.x1 <= 1 - margen && (m.y1 - m.y0) <= (yArriba - yAbajo) - margen;
      if (cabe) hi = dist; else lo = dist;
    }
    dist = hi;
    const m = mide();
    const centro = (m.y0 + m.y1) / 2, quiero = (yArriba + yAbajo) / 2;
    objetivo.z -= (centro - quiero) * dist * 0.35;   // mueve lo que mira hasta que el campo queda centrado en el hueco libre
  }
  return { objetivo, posicion: objetivo.clone().addScaledVector(dir, dist) };
}

// de un toque en la pantalla al punto del suelo donde cae
const _ray = new THREE.Raycaster(), _plano = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), _ndc = new THREE.Vector2();
export function sueloEn(camara, x, y, ancho, alto) {
  _ndc.set((x / ancho) * 2 - 1, -(y / alto) * 2 + 1);
  _ray.setFromCamera(_ndc, camara);
  return _ray.ray.intersectPlane(_plano, new THREE.Vector3());
}
