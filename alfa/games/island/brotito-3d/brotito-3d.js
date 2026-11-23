// Fans of Island · prototipo Brotito 3D, vista 3D: el modelo de Yoshi (Trellis2, con el esqueleto de
// herramientas/blender/scripts/island_brotito_esqueleto.py) en three.js, movido por el mismo estado que el Brotito en lonchas (mundo.js):
// posición, giro y postura. Cada postura coloca los huesos con IS.Brotito3D.huesos (huesos.js). Lleva su trozo de isla, luz con sombra,
// contorno opcional (casco hinchado por detrás) y una cámara que se puede girar arrastrando. IS.Vista3D.crea(lienzo) → { pinta(proto, dt) }.
'use strict';
import * as T from './three.min.js';

const { CARRIL, D } = IS.MEDIDAS;
const BORDE = 0x2a1830, OBJETIVO = new T.Vector3(196, 42, 30), ELEV_JUEGO = Math.asin(IS.Lonchas.K);   // la cámara del juego: K = seno de la altura
const aGltf = v => new T.Vector3(v[0], v[2], -v[1]);   // unidades del dibujo (z arriba, cara a +y) → glTF (y arriba, cara a -z)

function isla(escena, tierra) {   // los 10 bloques, la hierba, el mar y la zanahoria
  const [c0, c1] = tierra, x0 = c0 * 32, x1 = (c1 + 1) * 32;
  const arena = new T.Mesh(new T.BoxGeometry(x1 - x0, 32, D), new T.MeshStandardMaterial({ color: 0xe8c27a, roughness: 0.95 }));
  arena.position.set((x0 + x1) / 2, 16, D / 2); arena.receiveShadow = true; escena.add(arena);
  const hierba = new T.Mesh(new T.BoxGeometry(x1 - x0 + 1, 3, D + 1), new T.MeshStandardMaterial({ color: 0x6cc24a, roughness: 0.9 }));
  hierba.position.set((x0 + x1) / 2, 31, D / 2); hierba.receiveShadow = true; escena.add(hierba);
  const mar = new T.Mesh(new T.PlaneGeometry(3000, 420), new T.MeshStandardMaterial({ color: 0x2f9fd6, roughness: 0.35, metalness: 0.1 }));
  mar.rotation.x = -Math.PI / 2; mar.position.set(196, -8, -100); mar.receiveShadow = true; escena.add(mar);
  const zana = new T.Mesh(new T.ConeGeometry(4, 14, 12), new T.MeshStandardMaterial({ color: 0xf47c20 }));
  zana.rotation.z = Math.PI; zana.castShadow = true; zana.visible = false; escena.add(zana);
  return zana;
}

function luces(escena) {
  escena.add(new T.HemisphereLight(0xdff6ff, 0x6a8f4a, 1.6));
  const sol = new T.DirectionalLight(0xfff2dd, 2.2);
  sol.position.set(120, 260, 220); sol.target.position.copy(OBJETIVO); sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  Object.assign(sol.shadow.camera, { left: -220, right: 220, top: 120, bottom: -120, near: 10, far: 700 });
  sol.shadow.bias = -0.0008; sol.shadow.normalBias = 0.4;
  escena.add(sol, sol.target);
}

function contorno(malla, grosor) {   // el mismo cuerpo, hinchado por sus normales y pintado solo por detrás: la raya oscura de la serie
  const mat = new T.MeshBasicMaterial({ color: BORDE, side: T.BackSide });
  mat.onBeforeCompile = s => { s.vertexShader = s.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\ntransformed += normal * ${grosor.toFixed(2)};`); };
  const casco = new T.SkinnedMesh(malla.geometry, mat);
  casco.bind(malla.skeleton, malla.bindMatrix);
  return casco;
}

function preparaHuesos(raiz) {   // guarda la colocación de reposo de cada hueso para mover desde ella
  const h = {};
  raiz.traverse(o => { if (o.isBone) h[o.name] = { o, pos: o.position.clone(), rot: o.quaternion.clone(), esc: o.scale.clone() }; });
  return h;
}

function colocaBrazo(b, reposo, ahora) {   // gira el brazo para que vaya del hombro a la mano y lo alarga si hace falta
  const d0 = aGltf(reposo.mano).sub(aGltf(reposo.hombro)), d1 = aGltf(ahora.mano).sub(aGltf(ahora.hombro));
  const q = new T.Quaternion().setFromUnitVectors(d0.clone().normalize(), d1.clone().normalize());
  b.o.quaternion.copy(q.multiply(b.rot));
  b.o.position.copy(b.pos).add(aGltf(ahora.hombro).sub(aGltf(reposo.hombro)));
  b.o.scale.set(b.esc.x, b.esc.y * d1.length() / d0.length(), b.esc.z);
}

function colocaHuesos(h, reposo, ahora) {
  if (h.cuerpo) h.cuerpo.o.scale.set(ahora.cuerpo.escala[0], ahora.cuerpo.escala[2], ahora.cuerpo.escala[1]);   // el hueso del cuerpo mira hacia arriba
  for (const n of ['brazo_I', 'brazo_D']) if (h[n]) colocaBrazo(h[n], reposo[n], ahora[n]);
  for (const n of ['pie_I', 'pie_D']) if (h[n]) h[n].o.position.copy(h[n].pos).add(aGltf(ahora[n]).sub(aGltf(reposo[n])));
}

function camara(lienzo) {   // arrastrar gira alrededor del Brotito; vuelve a la del juego con «Vista del juego»
  const cam = new T.PerspectiveCamera(18, 2.4, 20, 4000), vista = { yaw: 0, elev: ELEV_JUEGO, dist: 480, sigue: false }, mira = OBJETIVO.clone();
  const pon = () => {
    const c = Math.cos(vista.elev);
    cam.position.set(mira.x + Math.sin(vista.yaw) * c * vista.dist, mira.y + Math.sin(vista.elev) * vista.dist, mira.z + Math.cos(vista.yaw) * c * vista.dist);
    cam.lookAt(mira);
  };
  let arrastre = null;
  lienzo.addEventListener('pointerdown', ev => { arrastre = { x: ev.clientX, y: ev.clientY, movido: false }; lienzo.setPointerCapture(ev.pointerId); });
  lienzo.addEventListener('pointermove', ev => {
    if (!arrastre) return;
    const dx = ev.clientX - arrastre.x, dy = ev.clientY - arrastre.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) arrastre.movido = true;
    vista.yaw -= dx * 0.008; vista.elev = Math.min(1.35, Math.max(0.02, vista.elev + dy * 0.006));
    arrastre.x = ev.clientX; arrastre.y = ev.clientY; pon();
  });
  lienzo.addEventListener('pointerup', () => { arrastre = null; });
  lienzo.addEventListener('wheel', ev => { ev.preventDefault(); vista.dist = Math.min(2200, Math.max(120, vista.dist * (1 + Math.sign(ev.deltaY) * 0.1))); pon(); }, { passive: false });
  pon();
  const sigue = (x, z, dt) => {   // de cerca, la cámara va detrás del Brotito
    if (!vista.sigue) return;
    const k = 1 - Math.exp(-6 * dt);
    mira.x += (x - mira.x) * k; mira.y += (z + 14 - mira.y) * k; pon();
  };
  const deJuego = () => { Object.assign(vista, { yaw: 0, elev: ELEV_JUEGO, dist: 480, sigue: false }); mira.copy(OBJETIVO); pon(); };
  const cerca = () => { Object.assign(vista, { dist: 170, sigue: true }); pon(); };
  return { cam, deJuego, cerca, sigue };
}

async function crea(lienzo, ruta) {
  const r = new T.WebGLRenderer({ canvas: lienzo, antialias: true });
  r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  r.shadowMap.enabled = true; r.shadowMap.type = T.PCFShadowMap;
  const escena = new T.Scene();
  escena.background = new T.Color(0xaee4ff);
  luces(escena);
  const zana = isla(escena, IS.Prototipo3D.TIERRA);
  const vista = camara(lienzo);
  const gltf = await new T.GLTFLoader().loadAsync(ruta);
  const modelo = gltf.scene, EB = IS.arte.EB;
  modelo.scale.set(EB, EB, -EB);   // el dibujo en lonchas usa ejes de mano izquierda: el espejo en z lo deja igual que en el juego
  const brotito = new T.Group(); brotito.add(modelo); escena.add(brotito);
  let malla = null;
  modelo.traverse(o => { if (o.isSkinnedMesh) malla = o; if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  const casco = malla ? contorno(malla, 0.55) : null;
  if (casco) malla.parent.add(casco);
  const huesos = preparaHuesos(modelo), reposo = IS.Brotito3D.huesos({ sx: 1, sz: 1, a: 0 });
  const opciones = { suave: true, contorno: true };
  let postura = { sx: 1, sz: 1, a: 0 };

  function ajusta() {
    const w = lienzo.clientWidth, h = lienzo.clientHeight;
    if (lienzo.width !== Math.floor(w * r.getPixelRatio()) || lienzo.height !== Math.floor(h * r.getPixelRatio())) { r.setSize(w, h, false); vista.cam.aspect = w / h; vista.cam.updateProjectionMatrix(); }
  }
  function pinta(proto, dt) {
    ajusta();
    const e = proto.estado.e, objetivo = IS.arte.BROTO_POSTURAS[proto.postura()];
    postura = IS.Brotito3D.sigue(postura, objetivo, dt, opciones.suave ? 28 : 0);
    colocaHuesos(huesos, reposo, IS.Brotito3D.huesos(postura));
    brotito.visible = proto.visible();
    brotito.position.set(e.x, e.z, CARRIL);
    brotito.rotation.y = -e.giro;
    vista.sigue(e.x, e.z, dt);
    if (casco) casco.visible = opciones.contorno;
    zana.visible = proto.estado.siguiendo;
    zana.position.set(proto.estado.J.x, 39, CARRIL + 6);
    r.render(escena, vista.cam);
  }
  return { pinta, opciones, vista, huesos: Object.keys(huesos) };
}

IS.Vista3D = Object.freeze({ crea });
