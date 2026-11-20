// Tiny Fans · adaptador · VISTA 3D: el motor gráfico del boceto 4 con Three.js r128 (global THREE). Pinta una escena en una textura pequeña
// y la amplía con píxel entero; la cámara es ortográfica, no gira, va anclada a la rejilla de píxeles y sigue un punto. Un solo lienzo
// y un solo motor para todas las pantallas: cada pantalla trae su escena. Sin WebGL, `lista` es false y todo lo demás no hace nada.
'use strict';
TN.creaVista = (lienzo, reglas) => {
  const T = THREE, V = reglas.vista, caja = lienzo.parentElement;
  let renderer = null;
  try { renderer = new T.WebGLRenderer({ canvas: lienzo, antialias: false, powerPreference: 'low-power' }); } catch (e) { renderer = null; }   // sin WebGL: el juego avisa (lista = false)
  if (!renderer) return { lista: false, tamano() {}, escena: () => null, pinta() {}, sigue() {}, encuadre() {}, aPantalla: () => ({ x: 0, y: 0, visible: false }), deToque: () => ({ x: 0, z: 0 }), aSuelo: (x, y) => ({ x, z: -y }) };
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.BasicShadowMap;
  const pixel = TN.vistaPixel.crea(renderer, V.lejos), camara = TN.vistaCamara.crea(V, V.lejos);
  let dpr = 1;
  camara.encuadre('juego', 0, true);
  const medidas = () => [caja.clientWidth || 1, caja.clientHeight || 1];
  return {
    lista: true,
    tamano() {
      const [w, h] = medidas();
      dpr = Math.min(window.devicePixelRatio || 1, 3); renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
      pixel.tamano(Math.floor(w * dpr), Math.floor(h * dpr), V.anchoPixeles);
    },
    // una escena nueva con el cielo, la niebla y las luces del boceto 4. El sol sigue a la cámara para que las sombras lleguen a todo el mapa
    escena() {
      const e = new T.Scene();
      e.background = new T.Color(V.cielo); e.fog = new T.Fog(V.cielo, 96, 168);
      e.add(new T.AmbientLight(0xb6b0ea, .52)); e.add(new T.HemisphereLight(0xfff1dc, 0x8f9bd6, .12));
      const sol = new T.DirectionalLight(0xffe2b8, .56); sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024); sol.shadow.bias = -.0008; sol.shadow.normalBias = .03;
      Object.assign(sol.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 90 }); sol.shadow.camera.updateProjectionMatrix();
      e.add(sol); e.add(sol.target); e.userData.sol = sol;
      return e;
    },
    pinta(escena, dt) {
      if (!escena) return;
      const sub = camara.paso(Math.min(.05, dt || 0), pixel.ancho, pixel.alto, pixel.escala, dpr), c = camara.centro, sol = escena.userData.sol;
      if (sol) { sol.position.set(c.x - 22, 30, c.z + 16); sol.target.position.set(c.x, 0, c.z); sol.target.updateMatrixWorld(); }
      pixel.pinta(escena, camara.camara, sub.x, sub.y);
    },
    sigue: (x, z, salto) => camara.sigue(x, z, salto),
    encuadre: (nombre, segundos, salto) => camara.encuadre(nombre, segundos, salto),
    aPantalla(x, y, z) { const [w, h] = medidas(); return camara.aPantalla(x, y, z, w, h); },
    deToque(px, py) { const [w, h] = medidas(); return camara.deToque(px, py, w, h); },
    aSuelo: (vx, vy) => camara.aSuelo(vx, vy),
  };
};
