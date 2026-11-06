// Fans of Zombies · LA VISTA 3D (pantalla): pone en la ciudad de Ratkov lo que dicen las reglas. Tu animal y los fans (un modelo por
// zombi, que se crea al aparecer y se tumba al caer), los anillos del ruido, las huellas en la nieve, la luz del día y de la noche
// (más oscura sin luz en el distrito) y la cámara que te sigue un poco por delante de donde apuntas.
'use strict';
const VISTA = { jug: null, zombis: new Map(), anillos: [], huellas: [], cx: null, cz: null, arma: null, linterna: null };
const MAT_HUELLA = new THREE.MeshLambertMaterial({ color: 0x5a6478 });
const GEO_HUELLA = new THREE.PlaneGeometry(0.24, 0.38);
const GEO_ANILLO = new THREE.RingGeometry(0.93, 1, 48);

function limpiaVista() {
  if (VISTA.jug) MOTOR.escena.remove(VISTA.jug.grupo);
  for (const v of VISTA.zombis.values()) MOTOR.escena.remove(v.mod.grupo);
  for (const h of VISTA.huellas) MOTOR.escena.remove(h);
  VISTA.zombis.clear(); VISTA.huellas.length = 0; VISTA.jug = null; VISTA.cx = VISTA.cz = null; limpiaEfectos();
}
function montaJugador(J) {
  VISTA.jug = montaPersonaje(J.animal, true); VISTA.jug.fase = 0;
  MOTOR.escena.add(VISTA.jug.grupo); VISTA.arma = null;
}
// las armas cuerpo a cuerpo (la escopeta y la pistola son las de Ratkov, js/modelos.js)
const MODELOS_MELEE = {
  palanca: (o) => { o.caja(0.07, 0.07, 0.9, 0xb8282e, 0, 0, 0.35); o.caja(0.07, 0.2, 0.07, 0xb8282e, 0, 0.08, 0.8); },
  bate: (o) => { o.caja(0.08, 0.08, 0.4, 0x3a2a1a, 0, 0, 0.1); o.caja(0.13, 0.13, 0.6, 0xc89a5a, 0, 0, 0.6); },
  hacha: (o) => { o.caja(0.07, 0.07, 0.85, 0x7a5a3a, 0, 0, 0.32); o.caja(0.05, 0.32, 0.24, 0x8a8e96, 0, 0.12, 0.7); o.caja(0.06, 0.06, 0.24, 0xd8dce4, 0, 0.27, 0.7); },
  cuchillo: (o) => { o.caja(0.06, 0.08, 0.16, 0x2a2420, 0, 0, 0.05); o.caja(0.03, 0.07, 0.3, 0xd8dce4, 0, 0.01, 0.27); },
};
function modeloMelee(id) { const o = new Obra(); MODELOS_MELEE[id](o); const m = o.hecha(); m.userData.boca = 0.8; return m; }
function pintaJugador(J, dt) {
  const v = VISTA.jug;
  if (VISTA.arma !== J.arma) { VISTA.arma = J.arma; if (MODELOS_MELEE[J.arma]) { ponArma(v, null); v.arma = modeloMelee(J.arma); v.mano.add(v.arma); } else ponArma(v, J.arma); }
  const anda = Math.hypot(J.x - (v.x ?? J.x), J.z - (v.z ?? J.z)) > 0.001; v.x = J.x; v.z = J.z;
  v.fase += dt * (J.corre ? 14 : 9);
  posturaGolpe(v);
  v.grupo.position.set(J.x + Math.sin(J.a) * v.empuje, 0, J.z + Math.cos(J.a) * v.empuje); v.grupo.rotation.y = J.a;
  const tumbado = J.duerme || J.vida <= 0;
  v.grupo.rotation.x = tumbado ? -Math.PI / 2 : 0; v.grupo.position.y = tumbado ? 0.3 : 0;
  v.grupo.scale.set(v.escala, v.escala * (J.agacha && !J.duerme ? 0.72 : 1), v.escala);
  animaPersonaje(v, v.fase, anda);
}
// un zombi vivo: anda, da un respingo al recibir, se tambalea aturdido o se queda tumbado tras el empujón
function posturaZombi(zb, v, dt) {
  const g = v.mod.grupo, anda = !zb.aturdido && Math.hypot(zb.x - g.position.x, zb.z - g.position.z) > 0.002;
  v.fase += dt * (anda ? 7 : 2); v.respingo = Math.max(0, (v.respingo || 0) - dt);
  v.suelo = zb.derribado ? Math.min(1, (v.suelo || 0) + dt * 6) : Math.max(0, (v.suelo || 0) - dt * 3);
  g.position.set(zb.x, 0.28 * v.suelo, zb.z); g.rotation.y = zb.a + Math.sin(v.fase * 0.5) * 0.12;
  g.rotation.x = -Math.PI / 2 * v.suelo + (zb.aturdido > 0 && !zb.derribado ? 0.35 + Math.sin(v.fase * 6) * 0.08 : 0) + (v.respingo > 0 ? 0.3 : 0);
  g.scale.setScalar(v.mod.escala * (v.respingo > 0 ? 1.08 : 1));
  animaPersonaje(v.mod, v.fase, anda);
}
// quitar el dibujo de un fan que ya no está (su trozo se ha descargado)
function quitaVistaZombi(id) { const v = VISTA.zombis.get(id); if (!v) return; MOTOR.escena.remove(v.mod.grupo); VISTA.zombis.delete(id); }
function pintaZombis(e, dt) {
  for (const zb of e.zombis) {
    let v = VISTA.zombis.get(zb.id);
    if (!v) { v = { mod: montaPersonaje('z_' + zb.tipo, false), fase: Math.random() * 6, cae: 0 }; MOTOR.escena.add(v.mod.grupo); VISTA.zombis.set(zb.id, v); }
    const g = v.mod.grupo;
    if (zb.vida <= 0) { v.cae = Math.min(1, v.cae + dt * 3); g.rotation.x = -Math.PI / 2 * v.cae; g.position.y = 0.3 * v.cae; continue; }
    posturaZombi(zb, v, dt);
  }
}
// los anillos del ruido: uno por ruido vivo (naranja el tuyo, rojo las alarmas, morado los gritos)
function pintaRuidos(e) {
  while (VISTA.anillos.length < e.ruidos.length) {
    const m = new THREE.Mesh(GEO_ANILLO, new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    m.rotation.x = -Math.PI / 2; MOTOR.escena.add(m); VISTA.anillos.push(m);
  }
  VISTA.anillos.forEach((m, i) => {
    const r = e.ruidos[i]; m.visible = !!r;
    if (!r) return;
    const f = 1 - r.t / r.max, ciclo = r.quien === 'alarma' ? (f * 12) % 1 : f, rad = Math.max(0.5, r.r * ciclo);
    m.position.set(r.x, 0.07, r.z); m.scale.set(rad, rad, rad);
    m.material.color.setHex(r.quien === 'alarma' ? 0xff3030 : r.quien === 'zombi' ? 0xc070ff : 0xfff0c0);
    m.material.opacity = 0.85 * (1 - ciclo);
  });
}
function pintaHuellas(e) {
  while (VISTA.huellas.length < e.huellas.length) { const m = new THREE.Mesh(GEO_HUELLA, MAT_HUELLA); m.rotation.x = -Math.PI / 2; MOTOR.escena.add(m); VISTA.huellas.push(m); }
  VISTA.huellas.forEach((m, i) => {
    const h = e.huellas[i]; m.visible = !!h;
    if (!h) return;
    const lado = i % 2 ? 0.15 : -0.15;
    m.position.set(h.x + Math.cos(h.a) * lado, 0.03, h.z - Math.sin(h.a) * lado); m.rotation.z = h.a;
  });
}
// la luz según la hora: día gris, atardecer naranja, noche azul (y más negra sin luz en el distrito)
function pintaLuz(AJ, e) {
  MOTOR.nieve.visible = MOTOR.nieveSi !== false && (!e.planta || e.planta === ZOM.AZOTEA(AJ));   // en verano no cae nada
  if (e.planta && e.planta < ZOM.AZOTEA(AJ)) { luzOficina(e); return; }
  const h = ZOM.horaDe(e.min) / 60, dia = Math.max(0, Math.min(1, Math.min((h - 6) / 2, (21 - h) / 2)));
  const ocaso = h > 17 && h < 21 ? 1 - Math.abs(h - 19.5) / 1.5 : 0, oscuro = e.sinLuz ? 0.75 : 1;
  MOTOR.hemi.intensity = (0.3 + 0.38 * dia) * oscuro;
  MOTOR.hemi.color.setRGB(0.55 + 0.22 * dia, 0.6 + 0.22 * dia, 0.85);
  MOTOR.sol.intensity = 0.1 + 0.45 * dia;
  MOTOR.sol.color.setRGB(1, 0.93 - 0.3 * ocaso, 0.97 - 0.5 * ocaso);
  const fondo = new THREE.Color().setRGB((0.18 + 0.3 * dia) * oscuro, (0.2 + 0.32 * dia) * oscuro, (0.32 + 0.25 * dia) * oscuro);
  MOTOR.escena.background.copy(fondo); MOTOR.escena.fog.color.copy(fondo);
  MOTOR.escena.fog.near = 44 + 6 * dia; MOTOR.escena.fog.far = 76 + 19 * dia;
  // de noche llevas una linterna: un círculo de luz a tu alrededor
  if (!VISTA.linterna) { VISTA.linterna = new THREE.PointLight(0xffe2b0, 0, 11, 1.6); MOTOR.escena.add(VISTA.linterna); }
  const J = e.jugador; VISTA.linterna.position.set(J.x + Math.sin(J.a) * 1.5, 2.2, J.z + Math.cos(J.a) * 1.5);
  VISTA.linterna.intensity = J.duerme ? 0 : (1 - dia) * 1.6;
  luzEstacion();
}
// dentro de una planta de la torre: los fluorescentes (sin hora del día) y el fondo negro, como un edificio sin ventanas a la calle
function luzOficina(e) {
  const tenue = e.sinLuz ? 0.55 : 1;
  MOTOR.hemi.intensity = 0.62 * tenue; MOTOR.hemi.color.setHex(0xdce8f0); MOTOR.sol.intensity = 0.25 * tenue; MOTOR.sol.color.setHex(0xf0f4ff);
  MOTOR.escena.background.setHex(0x0c0e14); MOTOR.escena.fog.color.setHex(0x0c0e14); MOTOR.escena.fog.near = 40; MOTOR.escena.fog.far = 80;
  if (!VISTA.linterna) { VISTA.linterna = new THREE.PointLight(0xffe2b0, 0, 11, 1.6); MOTOR.escena.add(VISTA.linterna); }
  const J = e.jugador; VISTA.linterna.position.set(J.x + Math.sin(J.a) * 1.5, 2.2, J.z + Math.cos(J.a) * 1.5);
  VISTA.linterna.intensity = e.sinLuz && !J.duerme ? 1.2 : 0;
}
// la cámara: sigue al jugador, algo por delante de donde apunta
function pintaCamara(J, dt) {
  const cx = J.x + Math.sin(J.a) * 2.5, cz = J.z + Math.cos(J.a) * 1.8;
  VISTA.cx = VISTA.cx == null ? cx : VISTA.cx + (cx - VISTA.cx) * Math.min(1, dt * 5);
  VISTA.cz = VISTA.cz == null ? cz : VISTA.cz + (cz - VISTA.cz) * Math.min(1, dt * 5);
  camaraEn(VISTA.cx + tiembla(), VISTA.cz + tiembla()); avanzaTapan(J.x, J.z, dt);
}
function pintaMundo(AJ, e, dt) {
  avanzaEfectos(e.jugador, dt); pintaJugador(e.jugador, dt); pintaZombis(e, dt); pintaRuidos(e); pintaHuellas(e); pintaLuz(AJ, e); pintaCamara(e.jugador, dt);
  const u = MOTOR.postMat.uniforms, J = e.jugador;
  u.dano.value = Math.max(0, u.dano.value - dt * 2); u.frio.value = J.duerme ? 0.8 : 0;
}
// la luz de la ciudad de fondo (menús): la de día de Ratkov, sin linterna
function luzDeFondo() {
  MOTOR.nieve.visible = true;
  MOTOR.hemi.intensity = 0.68; MOTOR.hemi.color.setHex(0xc4d2e4); MOTOR.sol.intensity = 0.55; MOTOR.sol.color.setHex(0xeef0f8);
  MOTOR.escena.background.setHex(0x7a8692); MOTOR.escena.fog.color.setHex(0x8a96a2); MOTOR.escena.fog.near = 50; MOTOR.escena.fog.far = 95;
  if (VISTA.linterna) VISTA.linterna.intensity = 0;
}
