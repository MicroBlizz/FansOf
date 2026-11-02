// Fans of Nova · Pantallas de los cosméticos de la galaxia de la comunidad: la ventana «Aspecto de la nave» (elegir pintura, estela y
// emblema, mezclando facciones, con la nave de muestra en marcha), la fila «Tu colección» de 27 casillas (las que faltan, en silueta) y la
// vista previa del parte de guerra. Reglas en dominio/cosmeticos.js (NV.Cosmeticos); el dibujo, en cosmeticos-dibujo.js.
'use strict';
const NV_COSM_NOMBRE = { pintura: 'Pintura', estela: 'Estela', emblema: 'Emblema' };
const nvMiFrente = () => nvCamp().frente || { cosmeticos: [] };
const nvTieneCosmeticos = () => (nvMiFrente().cosmeticos || []).length > 0;

// ---------- la casilla de un cosmético: la pieza dibujada con su facción, o su silueta si no la tienes ----------
function nvCosmeticoIcono(id, tiene, tam) {
  const { fac, pieza } = NV.Cosmeticos.parte(id), cv = document.createElement('canvas'), d = tam * 2, c = cv.getContext('2d'), col = NV_FAC_COLOR[fac];
  cv.width = cv.height = d; cv.style.width = cv.style.height = tam + 'px'; c.scale(d / 64, d / 64);
  if (pieza === 'emblema') NV_ICONOS.faccion[fac](c, col);
  else if (pieza === 'pintura') { c.save(); c.beginPath(); c.arc(32, 32, 28, 0, 6.283); c.fillStyle = '#5a63a8'; c.fill(); c.clip(); c.translate(32, 32); c.scale(0.4, 0.4); NV_PINTURAS[fac](c, col); c.restore(); c.beginPath(); c.arc(32, 32, 28, 0, 6.283); c.lineWidth = 3; c.strokeStyle = NV_TINTA; c.stroke(); }
  else { const S = { t: 0 }; [[18, 48, 1.5, 0.5], [32, 32, 2, 0.75], [46, 16, 2.5, 1]].forEach(([x, y, e, a], i) => { c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(e, e); NV_ESTELAS[fac](c, col, i + 1, S); c.restore(); }); }
  if (!tiene) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-in'; c.fillStyle = 'rgba(20,24,60,.55)'; c.fillRect(0, 0, d, d); }
  return cv;
}

// ---------- la nave de muestra con el aspecto que se le pase, en marcha mientras el lienzo siga en pantalla ----------
function nvAspectoVista(cv, aspecto) {
  const W = cv.width = 360, H = cv.height = 240, c = cv.getContext('2d'), t0 = performance.now();
  const S = { casco: NVP.casco, lleva: aspecto, estelaP: [], t: 0, estado: 'juego', nave: { x: 0, y: 0, ang: 0, vx: 0, vy: -200, rango: 1, escala: 0.55, armas: [], esc: null, golpeado: 0 } };
  const cuadro = () => {
    if (!cv.isConnected) return;
    S.t = (performance.now() - t0) / 1000; S.nave.y = -200 * S.t;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
    c.translate(W / 2, H * 0.42 - S.nave.y);
    nvDibujaNave(c, S);
    requestAnimationFrame(cuadro);
  };
  requestAnimationFrame(cuadro);
  return S;
}

// ---------- «Aspecto de la nave»: una fila por pieza con «Ninguno» y lo que tienes ----------
function nvAspectoVentana() {
  const f = nvMiFrente(), c = nvVentana(tr('ASPECTO DE LA NAVE'));
  const cv = document.createElement('canvas'); cv.className = 'nv-aspecto'; c.appendChild(cv);
  const S = nvAspectoVista(cv, NV.Cosmeticos.lleva(f, NV_FRENTE.cosmeticos));
  c.appendChild(nvEl('nv-cdet', tr('Solo cambian cómo se ve tu nave, nunca lo que hace. Se ganan en la galaxia de la comunidad.')));
  for (const pieza of NV_FRENTE.cosmeticos) {
    c.appendChild(nvEl('nv-cnom', tr(NV_COSM_NOMBRE[pieza])));
    const fila = nvEl('nv-cosm-fila');
    const pinta = () => fila.querySelectorAll('button').forEach(b => b.classList.toggle('sel', (b.dataset.id || null) === S.lleva[pieza]));
    const opcion = (id, cont) => {
      const b = nvEl('nv-cosm', undefined, 'button'); if (id) b.dataset.id = id; b.appendChild(cont);
      b.onclick = () => { if (NV.Cosmeticos.pon(f, pieza, id)) { nvCampGuarda(); play('select'); } S.lleva = NV.Cosmeticos.lleva(f, NV_FRENTE.cosmeticos); S.estelaP.length = 0; pinta(); };
      fila.appendChild(b);
    };
    opcion(null, nvEl('', tr('Ninguno')));
    for (const fac of NV_FACCIONES) { const id = NV.Cosmeticos.id(fac, pieza); if (NV.Cosmeticos.tiene(f, id)) opcion(id, nvCosmeticoIcono(id, true, 40)); }
    c.appendChild(fila); pinta();
  }
  c.appendChild(nvEl('nv-cdet', tr('Tu colección') + ': ' + NV.Cosmeticos.cuenta(f, NV_FACCIONES, NV_FRENTE.cosmeticos) + ' / ' + NV_FACCIONES.length * NV_FRENTE.cosmeticos.length));
}

// ---------- «Tu colección» en la galaxia de la comunidad: 9 facciones × 3 piezas ----------
function nvColeccionFila(p) {
  const f = nvMiFrente(), filas = NV.Cosmeticos.coleccion(f, NV_FACCIONES, NV_FRENTE.cosmeticos);
  p.appendChild(nvEl('nv-cnom', tr('Tu colección') + ' · ' + NV.Cosmeticos.cuenta(f, NV_FACCIONES, NV_FRENTE.cosmeticos) + ' / ' + filas.length * NV_FRENTE.cosmeticos.length));
  const rej = nvEl('nv-coleccion');
  NV_FRENTE.cosmeticos.forEach((pieza, j) => filas.forEach(fila => {
    const x = fila[j], cas = nvEl('nv-cosm-cas' + (x.puesto ? ' sel' : ''));
    cas.title = tr(NOVA_CASCOS.facciones[x.fac].nombre) + ' · ' + tr(NV_COSM_NOMBRE[pieza]);
    cas.appendChild(nvCosmeticoIcono(x.id, x.tiene, 30)); rej.appendChild(cas);
  }));
  p.appendChild(rej);
  p.appendChild(nvEl('nv-cdet', tr('Cada semana que gana tu patrón te llevas una pieza suya. Para completar otras facciones, cambia de patrón.')));
}

// ---------- el parte de guerra: la pieza que acabas de ganar, puesta en tu nave ----------
function nvParteVista(c, parte) {
  if (!parte.cosmetico) return;
  const pieza = NV.Cosmeticos.parte(parte.cosmetico).pieza, aspecto = NV.Cosmeticos.lleva(nvMiFrente(), NV_FRENTE.cosmeticos);
  aspecto[pieza] = parte.cosmetico;
  const cv = document.createElement('canvas'); cv.className = 'nv-aspecto nv-aspecto-parte'; c.appendChild(cv);
  nvAspectoVista(cv, aspecto);
}
