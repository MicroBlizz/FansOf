// Fans Of Pets · adaptador · MUÑECO 3D COMPLETO (fase f16, docs/pets/f16-muneco-completo.md): carga el muñeco de una criatura
// (img/criaturas/<criatura>/<edad>/muneco.glb, hecho por herramientas/blender/scripts/pets_muneco.py: una malla con piel y su esqueleto),
// lo pinta con el sombreado de dibujo y un contorno calculado (la cara de atrás, un poco hinchada) y le pone las poses del maniquí
// (PT.maniquiPoses). Las poses dicen giros en ejes del mundo, como en el maniquí; aquí se pasan al eje de cada hueso. Da el mismo montaje
// que PT.maniqui3d.montaje para el visor de desarrollo (herramientas/pets/visor-3d.html). three.js, el renderizador y las luces son los
// del maniquí (PT.maniqui3d.comun).
'use strict';
PT.muneco3d = (() => {
  const CONTORNO = { color: '#2b1a14', grosor: 0.011 };   // el grosor, en unidades del mundo (la criatura mide algo más de 1)
  const MONTAJES = {};
  const archivo = (id, edad) => `img/criaturas/${id.replace(':', '-')}/${edad}/muneco.glb`;

  // la cara de atrás de la malla, empujada hacia fuera por su normal y de un color: el contorno de dibujo, que sigue a la piel
  function contorno(T, malla) {
    const m = new T.MeshBasicMaterial({ color: CONTORNO.color, side: T.BackSide });
    m.onBeforeCompile = s => { s.vertexShader = s.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\n transformed += normalize(normal) * ${CONTORNO.grosor.toFixed(4)};`); };
    const c = malla.clone(); c.material = m; c.userData = { contorno: true };
    return c;
  }
  function pinta(T, gradiente, malla, i) {
    const viejo = malla.material, color = viejo.color ? '#' + viejo.color.getHexString() : '#ffffff';
    malla.material = new T.MeshToonMaterial({ color, map: viejo.map || null, gradientMap: gradiente });
    malla.userData = { id: i + 1, hueso: malla.parent && malla.parent.isBone ? malla.parent.name : malla.name, color };
  }
  // el reposo de cada hueso: su giro y su sitio, y su giro en el mundo (para pasar a su eje los giros de las poses)
  function reposos(T, raiz, huesos) {
    raiz.updateMatrixWorld(true);
    const r = {};
    for (const h of huesos) {
      const mundo = h.getWorldQuaternion(new T.Quaternion()), madre = h.parent ? h.parent.getWorldQuaternion(new T.Quaternion()) : new T.Quaternion();
      r[h.name] = { q: h.quaternion.clone(), p: h.position.clone(), s: h.scale.clone(), mundo, inversa: mundo.clone().invert(), madreInv: madre.invert() };
    }
    return r;
  }
  async function monta(id, edad) {
    const { T, render, tonos, luces } = await PT.maniqui3d.comun(), gradiente = tonos();
    const gltf = await new T.GLTFLoader().loadAsync(archivo(id, edad)), raiz = gltf.scene, mallas = [], huesos = [];
    raiz.traverse(o => { if (o.isMesh) mallas.push(o); if (o.isBone) huesos.push(o); });
    mallas.forEach((m, i) => { pinta(T, gradiente, m, i); m.parent.add(contorno(T, m)); });
    const escena = new T.Scene(); escena.add(raiz); luces(escena);
    return { T, render, escena, raiz, mallas, huesos: Object.fromEntries(huesos.map(h => [h.name, h])), reposo: reposos(T, raiz, huesos) };
  }
  // un giro de la pose (ejes del mundo, como el maniquí) en el eje del hueso: reposo · (mundo⁻¹ · giro · mundo)
  function gira(T, h, rp, q, caida = 0) {
    const giro = new T.Quaternion().setFromEuler(new T.Euler(q.x || 0, q.y || 0, q.z || 0)).multiply(new T.Quaternion().setFromEuler(new T.Euler(0, 0, caida)));
    h.quaternion.copy(rp.q).multiply(rp.inversa.clone().multiply(giro).multiply(rp.mundo));
    h.position.copy(rp.p).add(new T.Vector3(q.px || 0, q.py || 0, q.pz || 0).applyQuaternion(rp.madreInv));
    // estirar (sy) sin cambiar el volumen; las hijas lo deshacen, para que la cabeza no se estire al respirar (se multiplica: da igual el orden)
    const sy = q.sy || 1, k = Math.sqrt(sy); h.scale.multiply(new T.Vector3(1 / k, sy, 1 / k));
    for (const hija of h.children) if (hija.isBone) hija.scale.multiply(new T.Vector3(k, 1 / sy, k));
  }
  // el muñeco está hecho con los brazos en T (la piel se deforma mejor); las poses los quieren colgando, así que antes de cada pose bajan CAIDA
  const CAIDA = { brazo1: -0.95, 'brazo-1': 0.95 };
  function aplica(mo, pose, enT = false) {
    const { T } = mo;
    for (const [n, h] of Object.entries(mo.huesos)) h.scale.copy(mo.reposo[n].s);
    for (const [n, h] of Object.entries(mo.huesos)) gira(T, h, mo.reposo[n], pose.huesos[n] || {}, enT ? 0 : CAIDA[n] || 0);
    mo.raiz.position.y = pose.sentado;
  }
  // el mismo montaje que PT.maniqui3d.montaje; edad: la carpeta del muñeco (bebe, nino, adolescente o adulto)
  async function montaje(id, edad = 'nino') {
    const clave = id + '/' + edad;
    MONTAJES[clave] = MONTAJES[clave] || monta(id, edad).catch(e => { delete MONTAJES[clave]; throw e; });
    const mo = await MONTAJES[clave];
    return { T: mo.T, render: mo.render, escena: mo.escena, piezas: mo.mallas, capa: new mo.T.Group(), ids: null, lado: 1024,
      pose: (nombre, t) => {   // «en-t»: tal como está hecho, sin pose y con los brazos en T
        if (nombre === EN_T) { aplica(mo, { huesos: {}, sentado: 0 }, true); return true; }
        const p = PT.maniquiPoses.de(nombre, t); if (p.ok) aplica(mo, p.valor); return p.ok;
      },
      // para probar el esqueleto (visor): los huesos y una pose hecha a mano, { hueso: { x, y, z } } en radianes, con los brazos en T o bajados
      huesos: mo.huesos, aMano: (giros, enT = false) => aplica(mo, { huesos: giros, sentado: 0 }, enT) };
  }
  const EN_T = 'en-t';
  return { montaje, EN_T };
})();
