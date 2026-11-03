// Fans Of Pets · adaptador · INFLADO 3D (fase f15, docs/pets/FASES.md): monta en three.js las piezas del despiece de una criatura
// (img/criaturas/<criatura>/<edad>/mapa.json), cada una inflada desde su silueta con PT.inflado y con su propia pieza como textura, colgada
// de su pivote y de su pieza madre. Da el mismo montaje que PT.maniqui3d.montaje para el visor de desarrollo (herramientas/pets/visor-3d.html)
// y entiende las mismas poses (PT.maniquiPoses). three.js, el renderizador y las luces son los del maniquí (PT.maniqui3d.comun).
'use strict';
PT.inflado3d = (() => {
  const PASO = 4, LADO = 1024;   // los despieces son de 1024; la rejilla de la silueta, cada 4 px
  const GROSOR = { cabeza: 0.75, tronco: 0.8, 'oreja-izq': 0.35, 'oreja-der': 0.35 };   // el resto, 0.85
  const MONTAJES = {};
  const carpeta = (id, edad) => `img/criaturas/${id.replace(':', '-')}/${edad}/`;
  const carga = src => new Promise((bien, mal) => { const i = new Image(); i.onload = () => bien(i); i.onerror = () => mal(new Error('no carga ' + src)); i.src = src; });
  async function imagen(base, nombre, archivo) {   // la cabeza con su cara, si la hay
    if (nombre === 'cabeza') { try { return await carga(base + 'cabeza-cara.webp'); } catch (e) { console.warn('Pets · inflado sin cara:', e.message); } }
    return carga(base + archivo);
  }
  function lienzo(img) { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; c.getContext('2d', { willReadFrequently: true }).drawImage(img, 0, 0); return c; }
  function colorMedio(c) { const x = document.createElement('canvas').getContext('2d'); x.canvas.width = x.canvas.height = 1; x.drawImage(c, 0, 0, 1, 1); const d = x.getImageData(0, 0, 1, 1).data; return `rgb(${d[0]},${d[1]},${d[2]})`; }
  function pieza(T, gradiente, nombre, img, i) {
    const c = lienzo(img), px = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    const m = PT.inflado.malla({ alfa: (x, y) => px[(y * c.width + x) * 4 + 3], ancho: c.width, alto: c.height, paso: PASO, grosor: GROSOR[nombre] || 0.85, unidad: LADO });
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(m.posiciones, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(m.uvs, 2));
    g.setIndex(m.indices); g.computeVertexNormals();
    const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace;
    const malla = new T.Mesh(g, new T.MeshToonMaterial({ map: tex, gradientMap: gradiente, alphaTest: 0.35, side: T.DoubleSide }));
    malla.userData = { id: i + 1, hueso: nombre, color: colorMedio(c) };
    return { malla, gordura: m.gordura };
  }
  // cada pieza en su pivote (en el mundo: x centrado, los pies en y = 0), apoyada delante o detrás de su madre
  function cuelga(T, mapa, nombre, hecho, raiz, pies) {
    const p = mapa.piezas[nombre], [bx, by, bw, bh] = p.caja, [vx, vy] = p.pivote, piv = new T.Group();
    piv.userData.mundo = [vx - 0.5, pies - vy];
    if (p.madre) {
      const ma = hecho[p.madre], [mx, my, mw, mh] = mapa.piezas[p.madre].caja, z = PT.inflado.apoyo(mapa, nombre, ma.gordura((vx - mx) / mw, (vy - my) / mh));
      piv.position.set(piv.userData.mundo[0] - ma.piv.userData.mundo[0], piv.userData.mundo[1] - ma.piv.userData.mundo[1], z); ma.piv.add(piv);
    } else { piv.position.set(...piv.userData.mundo, 0); raiz.add(piv); }
    hecho[nombre].malla.position.set(bx - vx, -(by - vy), 0); piv.add(hecho[nombre].malla);
    hecho[nombre].piv = piv;
    return piv;
  }
  async function monta(id, edad) {
    const { T, render, tonos, luces } = await PT.maniqui3d.comun(), base = carpeta(id, edad), gradiente = tonos();
    const mapa = await (await fetch(base + 'mapa.json')).json(), orden = PT.inflado.orden(mapa);
    if (!orden.ok) throw new Error(orden.error);
    const imgs = await Promise.all(orden.valor.map(n => imagen(base, n, mapa.piezas[n].archivo)));
    const hecho = {}; orden.valor.forEach((n, i) => { hecho[n] = pieza(T, gradiente, n, imgs[i], i); });
    const pies = Math.max(...Object.values(mapa.piezas).map(p => p.caja[1] + p.caja[3])), raiz = new T.Group(), J = {};
    for (const n of orden.valor) J[n] = cuelga(T, mapa, n, hecho, raiz, pies);
    const reposo = {}; for (const [n, piv] of Object.entries(J)) reposo[n] = { p: piv.position.clone(), r: piv.rotation.clone() };
    const escena = new T.Scene(); escena.add(raiz); luces(escena);
    return { T, render, escena, raiz, J, reposo, piezas: orden.valor.map(n => hecho[n].malla) };
  }
  // la pose del maniquí sobre las piezas: cada hueso del maniquí mueve la pieza que le toca (los objetos de la pose no salen)
  function aplica(mo, pose) {
    for (const [n, piv] of Object.entries(mo.J)) {
      const q = pose.huesos[PT.inflado.hueso(n)] || {}, rp = mo.reposo[n];
      piv.position.set(rp.p.x + (q.px || 0), rp.p.y + (q.py || 0), rp.p.z + (q.pz || 0));
      piv.rotation.set(rp.r.x + (q.x || 0), rp.r.y + (q.y || 0), rp.r.z + (q.z || 0));
      piv.children[0].scale.set(1, q.sy || 1, 1);
    }
    mo.raiz.position.y = pose.sentado;
  }
  // el mismo montaje que PT.maniqui3d.montaje; edad: la carpeta del despiece (por ahora solo hay de niña)
  async function montaje(id, edad = 'nino') {
    const clave = id + '/' + edad;
    MONTAJES[clave] = MONTAJES[clave] || monta(id, edad).catch(e => { delete MONTAJES[clave]; throw e; });
    const mo = await MONTAJES[clave];
    return { T: mo.T, render: mo.render, escena: mo.escena, piezas: mo.piezas, capa: new mo.T.Group(), ids: null, lado: LADO,
      pose: (nombre, t) => { const p = PT.maniquiPoses.de(nombre, t); if (p.ok) aplica(mo, p.valor); return p.ok; } };
  }
  return { montaje };
})();
