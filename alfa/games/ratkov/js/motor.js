// Fans of Ratkov · EL MOTOR 3D: three.js (el mismo de Terminal Shock). El mundo se pinta a poca resolución (unos 300 puntos de alto) y se
// amplía sin suavizar, con un contorno oscuro en los bordes de las cosas: así parece pixel art. La cámara es ortográfica (sin perspectiva),
// mira de frente y desde arriba, y sigue al jugador. Aquí también está la OBRA, que junta muchas cajas en una sola malla para que
// el móvil pinte la ciudad entera sin ahogarse, y los edificios que se vuelven transparentes cuando te tapan.
'use strict';
const MOTOR = { r: null, escena: null, cam: null, rt: null, post: null, postCam: null, postMat: null, W: 0, H: 0, RW: 0, RH: 0, vista: 24, x: 0, z: 0, sol: null, luces: [], nieve: null, tapan: [] };
const ELEV = 0.74;                   // la inclinación de la cámara (en radianes, desde el suelo)
const DIST_CAM = 60;

function iniciaMotor() {
  const r = new THREE.WebGLRenderer({ canvas: el('cv'), antialias: false, powerPreference: 'high-performance' });
  r.setPixelRatio(1); r.shadowMap.enabled = true; r.shadowMap.type = THREE.BasicShadowMap; r.autoClear = true;
  MOTOR.r = r;
  const e = new THREE.Scene(); e.background = new THREE.Color(0x7a8692); e.fog = new THREE.Fog(0x8a96a2, 50, 95); MOTOR.escena = e;
  MOTOR.cam = new THREE.OrthographicCamera(-10, 10, 10, -10, 1, 160);
  // luz: cielo gris de invierno y un sol pálido que hace sombras (la sombra sigue a la cámara)
  e.add(MOTOR.hemi = new THREE.HemisphereLight(0xc4d2e4, 0x4a5262, 0.68));
  const s = new THREE.DirectionalLight(0xeef0f8, 0.55); s.castShadow = true; s.shadow.mapSize.set(1024, 1024);
  Object.assign(s.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 120 }); s.shadow.bias = -0.002;
  e.add(s, s.target); MOTOR.sol = s;
  // luces que se mueven (fogonazos, explosiones, la salida): unas pocas y se reutilizan
  for (let i = 0; i < 4; i++) { const l = new THREE.PointLight(0xffa040, 0, 6, 2); e.add(l); MOTOR.luces.push({ l, t: 0, dura: 0, f: 0 }); }
  // el pintado a poca resolución y el retoque final
  MOTOR.rt = new THREE.WebGLRenderTarget(4, 4, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
  MOTOR.postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  MOTOR.postMat = new THREE.ShaderMaterial({
    uniforms: { t: { value: MOTOR.rt.texture }, res: { value: new THREE.Vector2(4, 4) }, frio: { value: 0 }, dano: { value: 0 }, lag: { value: 0 }, hora: { value: 0 }, blanco: { value: 0 } },
    vertexShader: 'varying vec2 v; void main(){ v=uv; gl_Position=vec4(position.xy,0.,1.); }',
    fragmentShader: [
      'varying vec2 v; uniform sampler2D t; uniform vec2 res; uniform float frio, dano, lag, hora, blanco;',
      'float L(vec3 c){ return dot(c,vec3(.3,.59,.11)); }',
      'float h1(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }',
      'void main(){ vec2 uv=v;',
      ' if(lag>0.){ float fila=floor(uv.y*res.y/6.); float s=step(0.86,h1(vec2(fila,floor(hora*12.)))); uv.x+=s*lag*0.04*(h1(vec2(fila,hora))-.5); }',
      ' vec2 px=1.0/res; vec2 q=(floor(uv*res)+0.5)/res; vec3 c=texture2D(t,q).rgb; float l=L(c);',
      ' float n=L(texture2D(t,q+vec2(0.,px.y)).rgb), e=L(texture2D(t,q+vec2(px.x,0.)).rgb);',
      ' if(max(abs(l-n),abs(l-e))>0.15) c*=0.72;',
      ' if(lag>0.){ c.r=mix(c.r,texture2D(t,q+vec2(px.x*2.,0.)).r,lag); c.b=mix(c.b,texture2D(t,q-vec2(px.x*2.,0.)).b,lag); }',
      ' c=mix(c,c*vec3(.93,.98,1.07),.5);',
      ' float vg=distance(v,vec2(.5));',
      ' c=mix(c,vec3(.82,.9,1.),frio*smoothstep(.35,.75,vg)*.7);',
      ' c=mix(c,vec3(.6,.02,.04),dano*smoothstep(.25,.75,vg));',
      ' c=mix(c,vec3(.9,.94,1.),blanco*(.25+.35*h1(floor(v*res/2.)+hora)));',
      ' c=floor(c*22.0+0.5)/22.0; c*=smoothstep(1.05,.5,vg)*.22+.78;',
      ' gl_FragColor=vec4(c,1.); }'].join('\n'),
  });
  MOTOR.post = new THREE.Scene(); MOTOR.post.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), MOTOR.postMat));
  // los copos que caen alrededor de la cámara
  const n = 900, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { pos[i * 3] = entre(-30, 30); pos[i * 3 + 1] = entre(0, 20); pos[i * 3 + 2] = entre(-30, 30); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  MOTOR.nieve = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, sizeAttenuation: false, transparent: true, opacity: 0.85, fog: false }));
  MOTOR.nieve.frustumCulled = false; e.add(MOTOR.nieve);
  ajustaTamano(); window.addEventListener('resize', ajustaTamano);
}
// cuántos puntos tiene de alto la imagen pequeña (según la calidad) y cuánto mundo se ve
function ajustaTamano() {
  const W = window.innerWidth, H = window.innerHeight; MOTOR.W = W; MOTOR.H = H;
  MOTOR.r.setSize(W, H, false);
  const corto = AJUSTES.calidad === 'baja' ? 220 : AJUSTES.calidad === 'alta' ? 360 : (Math.min(W, H) < 500 ? 260 : 300);
  const k = corto / Math.min(W, H);
  MOTOR.RW = Math.max(64, Math.round(W * k)); MOTOR.RH = Math.max(64, Math.round(H * k));
  MOTOR.rt.setSize(MOTOR.RW, MOTOR.RH); MOTOR.postMat.uniforms.res.value.set(MOTOR.RW, MOTOR.RH);
  // en vertical se ve algo más de mundo para no ir a ciegas
  const vista = W < H ? 21 : 25, ar = W / H;
  const c = MOTOR.cam;
  if (ar >= 1) { c.top = vista / 2; c.bottom = -vista / 2; c.left = -vista * ar / 2; c.right = vista * ar / 2; }
  else { c.left = -vista / 2; c.right = vista / 2; c.top = vista / ar / 2; c.bottom = -vista / ar / 2; }
  c.updateProjectionMatrix(); MOTOR.vista = vista;
}
// la cámara mira al punto (x, z) del suelo; se mueve a saltos de un punto de pantalla para que el pixel art no tiemble
function camaraEn(x, z) {
  const c = MOTOR.cam, tx = (c.right - c.left) / MOTOR.RW;
  const sx = Math.round(x / tx) * tx, sz = Math.round(z * Math.sin(ELEV) / tx) * tx / Math.sin(ELEV);
  MOTOR.x = sx; MOTOR.z = sz;
  c.position.set(sx, Math.sin(ELEV) * DIST_CAM, sz + Math.cos(ELEV) * DIST_CAM); c.lookAt(sx, 0, sz);
  const s = MOTOR.sol; s.position.set(sx - 18, 34, sz + 14); s.target.position.set(sx, 0, sz); s.target.updateMatrixWorld();
}
// de la pantalla (en puntos de la ventana) al suelo, y del suelo a la pantalla
const _v3 = new THREE.Vector3();
function pantallaASuelo(px, py) {
  const c = MOTOR.cam; _v3.set(px / MOTOR.W * 2 - 1, -(py / MOTOR.H) * 2 + 1, 0).unproject(c);
  const dir = new THREE.Vector3(); c.getWorldDirection(dir);
  const t = -_v3.y / dir.y; return { x: _v3.x + dir.x * t, z: _v3.z + dir.z * t };
}
function sueloAPantalla(x, y, z) { _v3.set(x, y, z).project(MOTOR.cam); return { x: (_v3.x + 1) / 2 * MOTOR.W, y: (1 - _v3.y) / 2 * MOTOR.H }; }

// un destello de luz que se apaga solo (fogonazo, explosión)
function destello(x, y, z, color, fuerza, dura, alcance = 6) {
  let m = MOTOR.luces.find(l => l.t <= 0) || MOTOR.luces.reduce((a, b) => (a.t < b.t ? a : b));
  m.l.position.set(x, y, z); m.l.color.setHex(color); m.l.distance = alcance; m.f = fuerza; m.t = dura; m.dura = dura;
}
function avanzaMotor(dt, hora) {
  for (const m of MOTOR.luces) { m.t -= dt; m.l.intensity = m.t > 0 ? m.f * (m.t / m.dura) : 0; }
  // la nieve cae con viento y se recoloca alrededor de la cámara
  const p = MOTOR.nieve.geometry.attributes.position, a = p.array, v = (RAID.ventisca || 0), cx = MOTOR.x, cz = MOTOR.z;
  for (let i = 0; i < a.length; i += 3) {
    a[i] += dt * (1.2 + v * 9) + Math.sin(hora + i) * dt * 0.4; a[i + 1] -= dt * (2.2 + v * 3); a[i + 2] += dt * (0.4 + v * 3);
    if (a[i + 1] < 0) a[i + 1] += 20;
    if (a[i] > cx + 30) a[i] -= 60; else if (a[i] < cx - 30) a[i] += 60;
    if (a[i + 2] > cz + 30) a[i + 2] -= 60; else if (a[i + 2] < cz - 30) a[i + 2] += 60;
  }
  p.needsUpdate = true;
  MOTOR.nieve.material.size = 1.5 + v * 1.5;
}
function pintaEscena() {
  const r = MOTOR.r;
  r.setRenderTarget(MOTOR.rt); r.render(MOTOR.escena, MOTOR.cam);
  r.setRenderTarget(null); r.render(MOTOR.post, MOTOR.postCam);
}

/* ---------- materiales y texturas ---------- */
const MATS = {};
function matColor(c, e) { const k = c + ':' + (e || 0); return MATS[k] || (MATS[k] = new THREE.MeshLambertMaterial({ color: c, emissive: e || 0 })); }
function matBasico(c) { const k = 'b' + c; return MATS[k] || (MATS[k] = new THREE.MeshBasicMaterial({ color: c })); }
const MAT_VC = new THREE.MeshLambertMaterial({ vertexColors: true });
function textura(w, h, dibuja) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; dibuja(c.getContext('2d'));
  const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

/* ---------- la OBRA: junta muchas piezas en pocas mallas ---------- */
// piezas de color (cajas, cilindros, conos) → una malla con colores por vértice; piezas con textura → una malla por textura
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1), _col = new THREE.Color();
class Obra {
  constructor() { this.color = []; this.tex = new Map(); }
  _pon(geo, x, y, z, rx, ry, rz, destino, color) {
    _e.set(rx || 0, ry || 0, rz || 0); _q.setFromEuler(_e); _p.set(x, y, z); _m4.compose(_p, _q, _s);
    const g = (geo.index ? geo.toNonIndexed() : geo); g.applyMatrix4(_m4);
    if (color != null) { _col.setHex(color); const n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = _col.r; a[i * 3 + 1] = _col.g; a[i * 3 + 2] = _col.b; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); }
    destino.push(g); return g;
  }
  caja(w, h, d, color, x, y, z, ry, rx, rz) { this._pon(new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz, this.color, color); }
  cil(r1, r2, h, n, color, x, y, z, rx, ry, rz) { this._pon(new THREE.CylinderGeometry(r1, r2, h, n), x, y, z, rx, ry, rz, this.color, color); }
  cono(r, h, n, color, x, y, z, rx, ry, rz) { this._pon(new THREE.ConeGeometry(r, h, n), x, y, z, rx, ry, rz, this.color, color); }
  // un plano con textura (repetida rx × ry veces), de pie mirando hacia +z (o tumbado si tumbado = true)
  plano(w, h, tex, rx, ry, x, y, z, giro = 0, tumbado = false) {
    const g = new THREE.PlaneGeometry(w, h); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * rx, uv.getY(i) * ry);
    if (!this.tex.has(tex)) this.tex.set(tex, []);
    this._pon(g, x, y, z, tumbado ? -Math.PI / 2 : 0, giro, 0, this.tex.get(tex), null);
  }
  // termina: devuelve un grupo con las mallas (y lo añade a la escena si se pide)
  hecha(sombra = true, transparente = false) {
    const grupo = new THREE.Group();
    if (this.color.length) grupo.add(this._malla(this.color, transparente ? MAT_VC.clone() : MAT_VC, sombra, true));
    for (const [tex, geos] of this.tex) { const m = new THREE.MeshLambertMaterial({ map: tex }); grupo.add(this._malla(geos, m, sombra, false)); }
    this.color = []; this.tex = new Map();
    return grupo;
  }
  _malla(geos, mat, sombra, conColor) {
    let n = 0; for (const g of geos) n += g.attributes.position.count;
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), extra = new Float32Array(n * (conColor ? 3 : 2));
    let i = 0, j = 0;
    for (const g of geos) {
      pos.set(g.attributes.position.array, i * 3); nor.set(g.attributes.normal.array, i * 3);
      const ex = conColor ? g.attributes.color : g.attributes.uv; extra.set(ex.array, j); j += ex.array.length; i += g.attributes.position.count;
      g.dispose();
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    geo.setAttribute(conColor ? 'color' : 'uv', new THREE.BufferAttribute(extra, conColor ? 3 : 2)); geo.computeBoundingSphere();
    const m = new THREE.Mesh(geo, mat); m.castShadow = sombra; m.receiveShadow = true; return m;
  }
}

/* ---------- los edificios que te tapan se vuelven transparentes ---------- */
// cada uno: { grupo, x0, x1, z0, z1, h }. Te tapa si estás detrás (más al norte) y dentro de lo que su altura cubre en pantalla
function apuntaTapa(grupo, x0, x1, z0, z1, h) {
  const mats = []; grupo.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; mats.push(o.material); } });
  MOTOR.tapan.push({ grupo, x0, x1, z0, z1, h, mats, op: 1 });
}
function avanzaTapan(px, pz, dt) {
  const fondo = 1 / Math.tan(ELEV);
  for (const t of MOTOR.tapan) {
    const tapa = px > t.x0 - 0.8 && px < t.x1 + 0.8 && pz < t.z1 && pz > t.z0 - t.h * fondo - 0.5;
    const quiere = tapa ? 0.28 : 1;
    if (Math.abs(t.op - quiere) < 0.01) continue;
    t.op += (quiere - t.op) * Math.min(1, dt * 8);
    for (const m of t.mats) { m.opacity = t.op; m.depthWrite = t.op > 0.95; }
  }
}
