// Fans of Nova · Preparar la misión en campaña: una sola pantalla con la nave y el líder de tu facción ya puestos y la elección del
// oficial de primera entre las unidades de la facción (datos en comandantes.js, nvPreparacion). Sin campaña sigue el paso a paso de
// interfaz.js (nave, capitán y oficial). Diseño: docs/nova/tripulacion.md.
'use strict';
function nvMenuPrepara(P) {
  const cont = document.getElementById('nv-paneles'); cont.textContent = '';
  const p = nvEl('nv-panel'); p.appendChild(nvEl('nv-titulo', tr('PREPARA LA MISIÓN')));
  p.appendChild(nvPreparaNave(P.casco));
  p.appendChild(nvPreparaCapitan(P));
  p.appendChild(nvEl('nv-cnom', tr('Elige tu oficial de primera')));
  for (const o of P.oficiales) {
    const b = nvEl('nv-carta', '', 'button'); b.style.setProperty('--col', '#6fc4ff');
    b.appendChild(nvEl('nv-ctipo', tr(NOVA_TRIPULACION.facetas[o.faceta].nombre)));
    b.appendChild(nvEl('nv-cnom', tr(nvCapNombre(o.id))));
    b.appendChild(nvEl('nv-cdet', tr(NV_OFICIAL_TXT[o.faceta])));
    nvConIcono(b, 'cap', o.id, NV_FAC_COLOR[P.faccion], 52);
    b.onclick = () => { cont.textContent = ''; NVP.casco = P.casco; NVP.cap = P.cap; NVP.ofi = o.faceta; nvEmpieza(P.casco, P.cap, o.faceta); };
    p.appendChild(b);
  }
  const at = nvEl('nv-boton', tr('Atrás'), 'button'); at.onclick = nvGalaxiaMenu; p.appendChild(at);
  nvInfo(p, ['nave', 'capitan', 'oficial']);
  cont.appendChild(p);
}
// La nave de tu facción, con su dibujo y su arma (no se pulsa: viene puesta)
function nvPreparaNave(casco) {
  const H = NOVA_PIEZAS.cascos[casco], F = NOVA_CASCOS.facciones[H.faccion], C = NV_CASCOS[casco], VI = C.arma[2] && NV_VAR_ID[C.arma[2]];
  const b = nvEl('nv-carta nv-nave nv-fija'); b.style.setProperty('--col', NOVA_ARMAS.cargas[C.arma[1]].color);
  const cv = document.createElement('canvas'); cv.width = 110; cv.height = 150; b.appendChild(cv); nvPreview(cv, casco);
  const t = nvEl('nv-ntxt'); t.appendChild(nvEl('nv-ctipo', tr('Tu nave') + ' · ' + tr(F.nombre)));
  t.appendChild(nvEl('nv-cnom', tr(H.nombre)));
  t.appendChild(nvEl('nv-cdet', tr(F.casco) + '. ' + tr(F.afinidad)));
  if (VI) t.appendChild(nvEl('nv-cdet', tr('Arma insignia') + ': ' + tr(VI.nombre)));
  b.appendChild(t);
  return b;
}
// El comandante: el líder de tu facción, con su pasiva o el bonus de su faceta
function nvPreparaCapitan(P) {
  const K = NOVA_TRIPULACION.capitanes.find(c => c.id === P.cap), fc = nvCapFaceta(P.cap);
  const b = nvEl('nv-carta nv-fija'); b.style.setProperty('--col', '#ffd93d');
  b.appendChild(nvEl('nv-ctipo', tr('Comandante') + ' · ' + tr('Líder')));
  b.appendChild(nvEl('nv-cnom', tr(nvCapNombre(P.cap))));
  if (fc) b.appendChild(nvEl('nv-cdet', tr(NOVA_TRIPULACION.facetas[fc].nombre) + ': ' + tr(NV_OFICIAL_TXT[fc])));
  else if (K) {
    b.appendChild(nvEl('nv-cdet', tr(P.cap === 'progamer' ? 'Sin bonus ni pega: cifras base' : K.ventaja)));
    if (K.pega && K.pega !== 'Ninguna') b.appendChild(nvEl('nv-cdet', tr('Pega') + ': ' + tr(K.pega)));
  }
  nvConIcono(b, 'cap', P.cap, NV_COL_CAP[P.cap] || NV_FAC_COLOR[P.faccion], 58);
  return b;
}
