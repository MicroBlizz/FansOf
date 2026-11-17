// Fans of Wings · El mundo: el cielo en franjas y el mar pixelado (un rectángulo que calcula, píxel a píxel, a qué punto del mar
// se mira, con el píxel más gordo cuanto más lejos), las islas en terrazas (un mapa de alturas donde cada altura es una loncha) y
// los bancos de nubes (bolas de cubitos finos) con su sombra sobre el mar. El mundo se repite cada LADO metros en las dos
// direcciones, así que no se acaba. Cada cosa tiene dos tallas: fina de cerca y basta de lejos.
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  const GL = A.gl, M = GL.M, hex = GL.hex;
  const LADO = 16000, MU = A.mundo = { islas: [], nubes: [], LADO };
  let gl = null, pFondo = null, bufFondo = null, aP = 0;

  // ---------- islas ----------
  const COL = { honda: hex('#2f8fe0'), agua: hex('#46aee8'), espuma: hex('#a9e2f4'), arena: hex('#ecd9a0'), verde: ['#9bd23c', '#7cc63a', '#6dbb34', '#86cf45'].map(hex),
    arbol: ['#2f7d32', '#276e2c', '#348a37'].map(hex), roca: ['#8e8a86', '#7a7672', '#9a9690'].map(hex) };
  const PISO = 3.4, ANCHO_ISLA = 1600;

  // La altura (en pisos) de una isla en el punto (u, v) de −1 a 1: −9 mar abierto, de −4 a −1 los bajos de la orilla, 0 arena y de ahí hacia arriba.
  function nivelIsla(u, v, sem) {
    const a = Math.atan2(v, u), d = Math.hypot(u, v), R = 0.5 + 0.34 * GL.ruido(Math.cos(a) * 1.6 + 5, Math.sin(a) * 1.6 + 5, sem);
    const fbm = GL.ruido(u * 3 + 9, v * 3 + 9, sem + 3) * 0.55 + GL.ruido(u * 6.3 + 9, v * 6.3 + 9, sem + 10) * 0.3 + GL.ruido(u * 13 + 9, v * 13 + 9, sem + 16) * 0.15;
    const e = (1 - d / R) + (fbm - 0.5) * 0.4;
    if (e < 0) return e < -0.27 ? -9 : e < -0.2 ? -4 : e < -0.13 ? -3 : e < -0.06 ? -2 : -1;
    return Math.min(38, Math.floor(e * 44));
  }
  // El mapa de alturas de una isla con n casillas de lado: nivel de cada casilla y si lleva árbol.
  MU.mapaIsla = function (sem, n) {
    const N = new Int8Array(n * n), T = new Uint8Array(n * n), esc = 160 / n;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n * 2 - 1, v = (j + 0.5) / n * 2 - 1, l = nivelIsla(u, v, sem);
      N[i + j * n] = l;
      T[i + j * n] = l >= 4 && l <= 22 && GL.ruido(i * esc * 0.11, j * esc * 0.11, sem + 21) > 0.58 && GL.h2(i, j, sem) > 0.45 ? 1 + Math.floor(GL.h2(j, i, sem) * 3) : 0;
    }
    return { n, N, T, celda: ANCHO_ISLA / n };
  };
  const colorDe = (l, i, j) => (l <= 1 ? COL.arena : l >= 28 ? COL.roca[(i + j) % 3] : COL.verde[(l + ((i >> 2) + (j >> 2)) % 2) % 4]);
  function bajo(m, l, caja, k, rnd) {
    const [x0, x1, z0, z1] = caja, y = 0.2 + (l + 4) * 0.15, c = l === -4 ? COL.honda : l === -3 ? COL.agua : l === -2 ? (rnd() < 0.2 ? COL.espuma : COL.agua) : (rnd() < 0.35 ? COL.arena : COL.espuma);
    m.cara([x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], c, k);
  }
  // La malla de una isla a partir de su mapa: el techo de cada casilla y las paredes hacia las vecinas más bajas.
  MU.mallaIsla = function (mapa, sem) {
    const { n, N, T, celda } = mapa, rnd = GL.azar(sem), m = new GL.Malla();
    const nivel = (i, j) => (i < 0 || j < 0 || i >= n || j >= n ? -9 : N[i + j * n]);
    const alto = (i, j) => { const l = nivel(i, j); return l < 0 ? 0 : (l === 0 ? 1.2 : l * PISO) + (T[i + j * n] ? 3 + T[i + j * n] * 2.5 : 0); };
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const l = nivel(i, j);
      if (l < -4) continue;
      const x0 = (i - n / 2) * celda, x1 = x0 + celda, z0 = (j - n / 2) * celda, z1 = z0 + celda, k = 0.95 + rnd() * 0.1;
      if (l < 0) { bajo(m, l, [x0, x1, z0, z1], k, rnd); continue; }
      const y = alto(i, j), c = T[i + j * n] ? COL.arbol[(i * 7 + j * 3) % 3] : colorDe(l, i, j);
      m.cara([x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], c, k);
      const lado = (ya, p, q, s) => { if (ya < y) m.cara([p[0], ya, p[1]], [q[0], ya, q[1]], [q[0], y, q[1]], [p[0], y, p[1]], c, s * k); };
      lado(alto(i + 1, j), [x1, z0], [x1, z1], 0.74); lado(alto(i - 1, j), [x0, z0], [x0, z1], 0.56);
      lado(alto(i, j + 1), [x0, z1], [x1, z1], 0.64); lado(alto(i, j - 1), [x0, z0], [x1, z0], 0.82);
    }
    return m.subir();
  };

  // ---------- nubes ----------
  // Un banco de nubes: varias bolas achatadas, con la panza plana. `k` = 1 la talla fina, 3 la basta (un tercio de cubitos por lado).
  function mallaBanco(sem, k) {
    const rnd = GL.azar(sem), nx = 144 / k, ny = 33 / k, nz = 96 / k, bolas = [], n = 4 + Math.floor(rnd() * 5);
    for (let i = 0; i < n; i++) bolas.push([22 + rnd() * 100, 5 + rnd() * 6, 18 + rnd() * 60, 8 + rnd() * 10]);
    const blanco = hex('#ffffff'), panza = hex('#d5e3f5');
    return GL.cubitos(nx, ny, nz, { vox: [4 * k, 2.1 * k, 4 * k], color(x, y, z) {
      const X = (x + 0.5) * k, Y = (y + 0.5) * k, Z = (z + 0.5) * k;
      if (Y < 3) return null;
      for (const b of bolas) { const dx = X - b[0], dy = (Y - b[1] - 3) * 1.3, dz = Z - b[2]; if (dx * dx + dy * dy + dz * dz < b[3] * b[3]) return Y < 5 ? panza : blanco; }
      return null;
    } });
  }

  // ---------- el fondo: cielo y mar ----------
  function programaFondo() {
    return GL.programa(
      'attribute vec2 aP; varying vec2 vN; void main(){ vN=aP; gl_Position=vec4(aP,0.0,1.0); }',
      'precision ' + GL.alta + ' float; varying vec2 vN; uniform vec3 uOjo,uR,uU,uF; uniform float uTan,uAsp,uT;' + GL.NIEBLA +
      'float h(vec2 p){ p=mod(p,1024.0); return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }' +
      'float vn(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(h(i),h(i+vec2(1.0,0.0)),f.x),mix(h(i+vec2(0.0,1.0)),h(i+vec2(1.0,1.0)),f.x),f.y); }' +
      'vec3 mar(vec2 p,float t){' +
      ' float lod=clamp(floor(log2(max(t,1.0)/230.0)),0.0,7.0), s=2.0*exp2(lod); vec2 c=floor(p/s), q=c*s;' +   // el píxel del mar crece con la distancia
      ' vec2 qt=floor(p/min(s,16.0))*min(s,16.0);' +                                                              // las manchas grandes no se cuadriculan de lejos
      ' float b=vn(qt/760.0)+(h(c)-0.5)*0.07*step(lod,3.0);' +
      ' vec3 col = b<0.36 ? vec3(0.09,0.36,0.72) : (b<0.62 ? vec3(0.13,0.45,0.83) : vec3(0.18,0.52,0.89));' +
      ' float bajo=vn(qt/540.0+31.7)+(h(c+7.0)-0.5)*0.05*step(lod,3.0);' +                                                     // bajos de arena bajo el agua
      ' if(bajo>0.78) col=vec3(0.22,0.60,0.91); if(bajo>0.83) col=vec3(0.36,0.73,0.92); if(bajo>0.88 && (lod>3.0 || h(c+3.0)>0.4)) col=vec3(0.88,0.85,0.64);' +
      ' vec2 c2=floor(vec2(p.x/(s*4.0),p.y/s)); float fase=floor(uT*1.2+h(c2)*7.0);' +                           // rayitas de espuma que van y vienen
      ' if(lod<4.0 && h(c2+fase*17.0)>0.985) col=vec3(0.80,0.92,1.0);' +
      ' return col; }' +
      'void main(){ vec3 d=normalize(uF+vN.x*uAsp*uTan*uR+vN.y*uTan*uU); vec3 col;' +
      ' if(d.y>=-0.0005){ float k=floor(clamp(d.y*1.7,0.0,1.0)*11.0)/11.0; col=mix(BRUMA,vec3(0.30,0.57,0.93),k); }' +
      ' else { float t=-uOjo.y/d.y; col=mix(mar(uOjo.xz+d.xz*t,t),BRUMA,niebla(t)); }' +
      ' gl_FragColor=vec4(col,1.0); }');
  }

  // ---------- crear y colocar ----------
  MU.crear = function () {
    gl = GL.gl; pFondo = programaFondo(); aP = gl.getAttribLocation(pFondo.p, 'aP');
    bufFondo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bufFondo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW);
    const rnd = GL.azar(2026), formas = [31, 57, 83, 109].map((s) => ({ fina: MU.mallaIsla(MU.mapaIsla(s, 208), s), basta: MU.mallaIsla(MU.mapaIsla(s, 72), s) }));
    const bancos = [1, 2, 3, 4, 5, 6].map((s) => ({ fina: mallaBanco(s * 97, 1), basta: mallaBanco(s * 97, 3) }));
    MU.islas = [{ x: 500, z: -2600, forma: formas[0], giro: 1, e: 1.3 }];
    for (let i = 0; i < 13; i++) MU.islas.push({ x: (rnd() - 0.5) * LADO, z: (rnd() - 0.5) * LADO, forma: formas[i % 4], giro: Math.floor(rnd() * 4), e: 0.7 + rnd() * 1.1 });
    MU.nubes = [];
    for (let i = 0; i < 520; i++) MU.nubes.push({ x: (rnd() - 0.5) * LADO, z: (rnd() - 0.5) * LADO, y: 200 + rnd() * rnd() * 1500, forma: bancos[Math.floor(rnd() * 6)], giro: Math.floor(rnd() * 4), e: 0.4 + rnd() * 0.5 });
  };

  // Todas las copias de (x, z) del mundo repetido que quedan a menos de `max` del ojo.
  const cerca = MU.cerca = (v, c) => v + LADO * Math.round((c - v) / LADO);
  function copias(x, z, ojo, max, f) {
    const bx = cerca(x, ojo[0]), bz = cerca(z, ojo[2]);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { const px = bx + i * LADO, pz = bz + j * LADO, d = Math.hypot(px - ojo[0], pz - ojo[2]); if (d < max) f(px, pz, d); }
  }
  MU.copias = copias;

  // ---------- dibujar ----------
  // cam = { ojo, ejes: { s, u, f }, VP, fov, asp }. Deja el programa de mallas puesto y la profundidad encendida.
  MU.dibujar = function (cam, t) {
    const ojo = cam.ojo;
    gl.disable(gl.DEPTH_TEST); gl.depthMask(false);
    gl.useProgram(pFondo.p); gl.bindBuffer(gl.ARRAY_BUFFER, bufFondo); gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(pFondo.u.uOjo, ojo); gl.uniform3fv(pFondo.u.uR, cam.ejes.s); gl.uniform3fv(pFondo.u.uU, cam.ejes.u); gl.uniform3fv(pFondo.u.uF, cam.ejes.f);
    gl.uniform1f(pFondo.u.uTan, Math.tan(cam.fov / 2)); gl.uniform1f(pFondo.u.uAsp, cam.asp); gl.uniform1f(pFondo.u.uT, t);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    GL.empiezaMallas(cam.VP, ojo);
    const vistas = [];
    for (const n of MU.nubes) copias(n.x, n.z, ojo, 6200, (x, z, d) => vistas.push([n, x, z, d]));
    for (const [n, x, z, d] of vistas) if (d < 3600) GL.malla(n.forma.basta, M.varias(M.T(x, 1.2, z), M.RY(n.giro * Math.PI / 2), M.S(n.e, 0, n.e)), true);   // sombras sobre el mar
    return vistas;
  };
  // Lo sólido del mundo (después de las sombras, ya con profundidad).
  MU.dibujarSolido = function (cam, vistas) {
    const ojo = cam.ojo;
    gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.clear(gl.DEPTH_BUFFER_BIT);
    for (const i of MU.islas) copias(i.x, i.z, ojo, 10500, (x, z, d) => GL.malla(d < 2600 * i.e ? i.forma.fina : i.forma.basta, M.varias(M.T(x, 0, z), M.RY(i.giro * Math.PI / 2), M.S(i.e, i.e, i.e))));
    GL.tinte(1.3, 1.3, 1.32);   // las nubes, más blancas por los lados
    for (const [n, x, z, d] of vistas) GL.malla(d < 1500 ? n.forma.fina : n.forma.basta, M.varias(M.T(x, n.y, z), M.RY(n.giro * Math.PI / 2), M.S(n.e, n.e, n.e)));
    GL.tinte(1, 1, 1);
  };
})(WINGS);
