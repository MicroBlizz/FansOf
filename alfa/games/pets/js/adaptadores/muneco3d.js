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
  const PUFF = { escala: 0.7, y: 0.02 };   // la cesta del maniquí (hecha para un cuerpo más alto) a la medida del muñeco, que es un 40 % más bajo
  const archivo = (id, edad) => `img/criaturas/${id.replace(':', '-')}/${edad}/muneco.glb`;

  // lo «abierto» de cada vértice (de 0 a 1): 0 en un hueco de la forma (el cuello, la base de las orejas), donde el contorno hinchado de la malla de al lado
  // asomaría por delante como una línea negra, y 1 en lo liso o abombado. Es cuánto quedan por encima de su plano los vecinos (cóncavo), suavizado
  const HUECO = { desde: 0.04, hasta: 0.35, pasadas: 3 };
  function abierto(geo) {
    const pos = geo.attributes.position, nor = geo.attributes.normal, n = pos.count, vecinos = Array.from({ length: n }, () => new Set()), idx = geo.index.array;
    for (let i = 0; i < idx.length; i += 3) for (let k = 0; k < 3; k++) { vecinos[idx[i + k]].add(idx[i + (k + 1) % 3]); vecinos[idx[i + k]].add(idx[i + (k + 2) % 3]); }
    let c = new Float32Array(n);
    for (let v = 0; v < n; v++) {
      let sx = 0, sy = 0, sz = 0, largo = 0;
      for (const w of vecinos[v]) { sx += pos.getX(w) - pos.getX(v); sy += pos.getY(w) - pos.getY(v); sz += pos.getZ(w) - pos.getZ(v); largo += Math.hypot(pos.getX(w) - pos.getX(v), pos.getY(w) - pos.getY(v), pos.getZ(w) - pos.getZ(v)); }
      c[v] = largo ? (sx * nor.getX(v) + sy * nor.getY(v) + sz * nor.getZ(v)) / largo : 0;
      c[v] = Math.max(c[v], 0);
    }
    for (let r = 0; r < HUECO.pasadas; r++) {   // el hueco se extiende un poco a lo que lo rodea: el borde de la línea no queda a medias
      const d = new Float32Array(n);
      for (let v = 0; v < n; v++) { let mx = c[v]; for (const w of vecinos[v]) mx = Math.max(mx, c[w]); d[v] = (mx + c[v]) / 2; }
      c = d;
    }
    const a = new Float32Array(n);
    for (let v = 0; v < n; v++) { const t = Math.min(Math.max((c[v] - HUECO.desde) / (HUECO.hasta - HUECO.desde), 0), 1); a[v] = 1 - t * t * (3 - 2 * t); }
    return a;
  }
  // la cara de atrás de la malla, empujada hacia fuera por su normal y de un color: el contorno de dibujo, que sigue a la piel
  function contorno(T, malla) {
    const m = new T.MeshBasicMaterial({ color: CONTORNO.color, side: T.BackSide });
    m.onBeforeCompile = s => { s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nattribute float abierto;').replace('#include <begin_vertex>', `#include <begin_vertex>\n transformed += normalize(normal) * ${CONTORNO.grosor.toFixed(4)} * abierto;`); };
    const c = malla.clone(); c.geometry = malla.geometry.clone(); c.geometry.setAttribute('abierto', new T.BufferAttribute(abierto(c.geometry), 1)); c.material = m; c.userData = { contorno: true };
    return c;
  }
  function viste(T, gradiente, malla, i) {
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
    const { T, render, tonos, luces, cosaCon } = await PT.maniqui3d.comun(), gradiente = tonos();
    const gltf = await new T.GLTFLoader().loadAsync(archivo(id, edad)), raiz = gltf.scene, mallas = [], huesos = [];
    raiz.traverse(o => { if (o.isMesh) mallas.push(o); if (o.isBone) huesos.push(o); });
    mallas.forEach((m, i) => { viste(T, gradiente, m, i); m.parent.add(contorno(T, m)); });
    const escena = new T.Scene(); escena.add(raiz); luces(escena);
    return { T, render, escena, raiz, mallas, piel: mallas.find(m => m.material.map) || null, cara: '', caras: null, objetos: PT.maniqui3dObjetos.crea(T, cosaCon(gradiente), PT.maniqui.de(id).valor.medidas.estampado), huesos: Object.fromEntries(huesos.map(h => [h.name, h])), reposo: reposos(T, raiz, huesos) };
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
    PT.maniqui3dObjetos.coloca(mo.T, mo.objetos, mo.escena, { ...pose, objetos: pose.objetos.filter(n => n === 'cesta') }, null, null);
    mo.objetos.cesta.scale.setScalar(PUFF.escala); mo.objetos.cesta.position.y = PUFF.y;   // la cama puff al dormir (con su zeta); los objetos de comer los pone el minijuego
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
  // LAS CARAS (f16, «Expresiones»): la piel lleva la cara de base; las otras (ojos cerrados, boca abierta) son parches sin pérdida de las zonas que cambian
  // (img/criaturas/<criatura>/<edad>/caras.json y cara-<estado>-<n>.webp, de herramientas/pets/caras_del_muneco.py). Para cambiar de cara, la piel se
  // copia a un lienzo, se le pegan los parches pedidos y ese lienzo es su textura. Mientras los parches cargan, o si no los hay, se queda la cara de base
  const carpeta = (id, edad) => `img/criaturas/${id.replace(':', '-')}/${edad}/`;
  function cargaCaras(mo, id, edad) {
    if (mo.caras) return;
    mo.caras = { listas: false, parches: {} };
    const dir = carpeta(id, edad), foto = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error(src)); i.src = src; });
    fetch(dir + 'caras.json').then(r => r.ok ? r.json() : Promise.reject(new Error('caras.json'))).then(async datos => {
      for (const [nombre, rs] of Object.entries(datos.caras)) mo.caras.parches[nombre] = await Promise.all(rs.map(async r => ({ ...r, imagen: await foto(dir + r.archivo) })));
      const base = mo.piel.material.map.image, lienzo = document.createElement('canvas'); lienzo.width = lienzo.height = datos.lado;
      const textura = new mo.T.CanvasTexture(lienzo), vieja = mo.piel.material.map;
      textura.flipY = vieja.flipY; textura.colorSpace = vieja.colorSpace; textura.generateMipmaps = vieja.generateMipmaps; textura.minFilter = vieja.minFilter; textura.anisotropy = vieja.anisotropy;
      Object.assign(mo.caras, { base, lienzo, textura, listas: true });
    }).catch(e => { console.warn('Pets · muñeco 3D sin caras:', id, edad, e.message); });
  }
  // pone la cara con esos estados (lista de nombres de caras.json, o vacía: la de base); no hace nada si ya la tiene o si los parches aún no han cargado
  function poneCara(mo, estados) {
    const c = mo.caras, clave = estados.join('+');
    if (!c || !c.listas || mo.cara === clave) return;
    const ctx = c.lienzo.getContext('2d'); ctx.drawImage(c.base, 0, 0, c.lienzo.width, c.lienzo.height);
    for (const n of estados) for (const r of c.parches[n] || []) ctx.drawImage(r.imagen, r.x, r.y);
    c.textura.needsUpdate = true; mo.piel.material.map = c.textura; mo.piel.material.needsUpdate = true; mo.cara = clave;
  }
  // los ojos, solos: abiertos, o cerrados al dormir y en el parpadeo (cada 4 s y cuarto, durante una décima y media)
  const PARPADEO = { cada: 4.2, dura: 0.15 };
  const parpadea = t => t % PARPADEO.cada < PARPADEO.dura;
  const caraDe = (nombre, t, boca) => [...(nombre === 'dormir' || parpadea(t) ? ['ojos-cerrados'] : []), ...(boca ? ['boca-abierta'] : [])];
  const EN_T = 'en-t';
  // PINTAR EN EL LIENZO DEL JUEGO (como PT.maniqui3d.pinta): el muñeco de la criatura id y de su edad, en la pose nombre, con el encuadre de su dibujo de
  // 640 (los pies donde los tenía) centrado en (x, y) a lado píxeles, con un margen por si el muñeco sobresale. Devuelve false mientras carga (o si
  // no hay muñeco de esa criatura y edad) y quien llama pinta lo de siempre
  const LISTOS = {}, ENCUADRE = 1.15, LADO_RENDER = 640;
  function pinta(ctx, id, x, y, lado, t, nombre, edad = 'nino', boca = false) {
    const clave = id + '/' + edad;
    if (!(clave in LISTOS)) { LISTOS[clave] = null; montaje(id, edad).then(() => monta_listo(clave, id, edad), e => { console.warn('Pets · muñeco 3D sin montar:', clave, e.message); }); }
    const mo = LISTOS[clave], pose = PT.maniquiPoses.de(nombre, t);
    if (!mo || !pose.ok) return false;
    aplica(mo, pose.valor);
    if (mo.piel) { cargaCaras(mo, id, edad); poneCara(mo, caraDe(nombre, t, boca)); }
    mo.render.setSize(LADO_RENDER, LADO_RENDER, false); mo.render.render(mo.escena, mo.camara);
    const borde = lado * ENCUADRE / 2;
    ctx.drawImage(mo.render.domElement, x - borde, y - borde, 2 * borde, 2 * borde);
    return true;
  }
  // con el montaje ya hecho (la promesa de MONTAJES), le pone su cámara: la del dibujo de 640 de la criatura, un poco más grande
  async function monta_listo(clave, id, edad) {
    const mo = await MONTAJES[clave], med = PT.maniqui.de(id).valor.medidas, k = med.k, T = mo.T, m = (ENCUADRE - 1) / 2 * 640;
    mo.camara = new T.OrthographicCamera(-(med.cx + m) / k, (640 - med.cx + m) / k, (med.suelo + m) / k, -(640 - med.suelo + m) / k, 0.01, 100);
    mo.camara.position.set(0, 0, 10); LISTOS[clave] = mo;
  }
  // DÓNDE CAE UN HUESO en el lienzo, si el muñeco se pintó con pinta(ctx, id, x, y, lado, …): { x, y } en las coordenadas del lienzo, o null mientras
  // no esté listo (o si el hueso no existe). Los minijuegos de cuidado lo usan para saber dónde están la boca y las zonas del cuerpo
  function ancla(id, edad, hueso, x, y, lado) {
    const mo = LISTOS[id + '/' + edad], h = mo && mo.huesos[hueso];
    if (!h) return null;
    const v = h.getWorldPosition(new mo.T.Vector3()).project(mo.camara), borde = lado * ENCUADRE / 2;
    return { x: x - borde + (v.x + 1) * borde, y: y - borde + (1 - v.y) * borde };
  }
  // ¿está el muñeco de esa criatura y edad cargado y listo para pintar? (la partida decide con esto si usa el minijuego o el cuidado directo)
  const tiene = (id, edad) => !!LISTOS[id + '/' + edad];
  // la carpeta del muñeco de cada etapa de la mascota: el jefe es un adulto
  const EDADES = { bebe: 'bebe', nino: 'nino', adolescente: 'adolescente', adulto: 'adulto', jefe: 'adulto' };
  const edad = etapa => EDADES[etapa];
  return { montaje, pinta, ancla, tiene, edad, caraDe, EN_T };
})();
