// Fans of Nova · Pantallas de campaña: el mapa hexagonal de la galaxia (tocar para elegir, volver a tocar para lanzar) y la nave capital.
'use strict';
const NV_GAL = { sel: null };

function nvJugarCampana() {   // desde la portada: primero la galaxia
  document.getElementById('nv-portada').hidden = true;
  document.getElementById('nv-partida').hidden = false;
  nvAjustaLienzo();
  nvGalaxiaMenu();
}
function nvCabecera(p) {
  const c = nvCamp(), f = nvEl('nv-fila');
  f.appendChild(nvEl('', tr('Aleación'))); f.appendChild(nvEl('', String(c.aleacion)));
  p.appendChild(f);
}
function nvGalaxiaMenu() {
  nvParar(); const camp = nvCamp();
  const lz = document.getElementById('nv-canvas'); lz.getContext('2d').clearRect(0, 0, lz.width, lz.height);   // sin restos de la última partida detrás
  if (!camp.faccion) { nvEligeFaccion(); return; }
  const cont = document.getElementById('nv-paneles'); cont.textContent = '';
  const p = nvEl('nv-panel'); p.appendChild(nvEl('nv-titulo', tr('GALAXIA')));
  nvCabecera(p);
  const cv = document.createElement('canvas'); cv.className = 'nv-gal'; p.appendChild(cv);
  const info = nvEl('nv-carta nv-galinfo'); p.appendChild(info);
  const lanzar = nvEl('nv-boton', tr('Lanzar misión'), 'button');
  lanzar.onclick = () => { if (NV_GAL.sel && nvSectorAbierto(NV_GAL.sel)) { NVP.sector = NV_GAL.sel; nvMenu(); } };
  p.appendChild(lanzar);
  const cap = nvEl('nv-boton', tr('Nave capital'), 'button'); cap.onclick = nvNaveCapital; p.appendChild(cap);
  const ay = nvEl('nv-boton', tr('Cómo se juega'), 'button'); ay.onclick = () => { if (!NVP.tuto) nvTutoTodo(); }; ay.prepend(nvIcono('ui', 'info', '#2f8cff', 26)); p.appendChild(ay);
  const s = nvEl('nv-boton', tr('Salir'), 'button'); s.onclick = () => { cont.textContent = ''; nvSalir(); }; p.appendChild(s);
  nvInfo(p, 'galaxia');
  cont.appendChild(p);
  if (!NV_GAL.sel || !NVP.gal[NV_GAL.sel]) NV_GAL.sel = NVP.gal._base;
  const pinta = () => { nvPintaGalaxia(cv); nvInfoSector(info); lanzar.disabled = !nvSectorAbierto(NV_GAL.sel); };
  cv.onclick = ev => {
    const k = nvHexEnPunto(cv, ev); if (!k) return;
    if (k === NV_GAL.sel && nvSectorAbierto(k)) { lanzar.onclick(); return; }   // segundo toque: lanzar
    NV_GAL.sel = k; pinta();
  };
  requestAnimationFrame(pinta);   // con el panel ya en pantalla, para medir el ancho
}
// Al empezar la campaña: tu facción decide los colores que vas pintando y dónde está tu enclave rebelde.
function nvEligeFaccion() {
  const cont = document.getElementById('nv-paneles'); cont.textContent = '';
  const p = nvEl('nv-panel'); p.appendChild(nvEl('nv-titulo', tr('ELIGE TU FACCIÓN')));
  p.appendChild(nvEl('nv-cdet', tr('Empiezas en un enclave rebelde, enfrente del territorio oficial de tu facción. Cada sector que liberes se pinta de tu color.')));
  for (const f of NV_FACCIONES) {
    const b = nvEl('nv-carta', '', 'button'); b.style.setProperty('--col', NV_FAC_COLOR[f]);
    b.appendChild(nvEl('nv-cnom', tr(NOVA_CASCOS.facciones[f].nombre)));
    b.appendChild(nvEl('nv-cdet', tr(NOVA_CASCOS.facciones[f].afinidad)));
    b.onclick = () => { nvCampFaccion(f); NV_GAL.sel = null; nvGalaxiaMenu(); };
    p.appendChild(b);
  }
  const s = nvEl('nv-boton', tr('Salir'), 'button'); s.onclick = () => { cont.textContent = ''; nvSalir(); }; p.appendChild(s);
  nvInfo(p, 'faccion');
  cont.appendChild(p);
}
function nvSectores() { return Object.keys(NVP.gal).filter(k => k[0] !== '_'); }
// Geometría: hexágonos con punta arriba; el decágono entero cabe a lo ancho del lienzo.
function nvGalGeo(cv) {
  let mx = 1, my = 1; for (const k of nvSectores()) { mx = Math.max(mx, Math.abs(NVP.gal[k].x)); my = Math.max(my, Math.abs(NVP.gal[k].y)); }
  const W = cv.clientWidth || 480, s = W / (2 * mx + 2);
  return { W, H: s * (2 * my + 2.2), s, cx: W / 2, cy: s * (my + 1.1) };
}
function nvHexPix(g, h) { return [g.cx + g.s * h.x, g.cy + g.s * h.y]; }
function nvHexEnPunto(cv, ev) {
  const g = nvGalGeo(cv), b = cv.getBoundingClientRect(), x = ev.clientX - b.left, y = ev.clientY - b.top;
  let mejor = null, md = 1e9;
  for (const k of nvSectores()) { const [hx, hy] = nvHexPix(g, NVP.gal[k]), d = Math.hypot(hx - x, hy - y); if (d < md) { md = d; mejor = k; } }
  return md < g.s ? mejor : null;
}
function nvColorDueno(d) { return d === 'rebelde' ? '#8a90b8' : NV_FAC_COLOR[d] || '#8a90b8'; }
function nvPintaGalaxia(cv) {
  const g = nvGalGeo(cv), dpr = Math.min(2, window.devicePixelRatio || 1), c = cv.getContext('2d'), camp = nvCamp();
  cv.style.height = g.H + 'px'; cv.width = Math.round(g.W * dpr); cv.height = Math.round(g.H * dpr);
  c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, g.W, g.H);
  for (const k of nvSectores()) {
    const s = NVP.gal[k], [x, y] = nvHexPix(g, s), libre = camp.libres.includes(k), abierto = nvSectorAbierto(k);
    c.beginPath();
    for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3, r = g.s * 0.95; c[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r); }
    c.closePath();
    c.globalAlpha = libre ? 1 : abierto ? 0.8 : 0.55; c.fillStyle = nvColorDueno(nvDuenoActual(k)); c.fill(); c.globalAlpha = 1;
    if (!libre && !abierto) { c.fillStyle = 'rgba(6,10,30,.25)'; c.fill(); }   // niebla: se ve de quién es, pero más apagado
    c.lineWidth = k === NV_GAL.sel ? 4 : libre ? 2.5 : 1.5; c.strokeStyle = k === NV_GAL.sel ? '#fff' : '#1a0f2e'; c.stroke();
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff'; c.strokeStyle = '#1a0f2e'; c.lineWidth = 3;
    if (s.base) { c.font = `800 ${Math.round(g.s * 0.5)}px 'Baloo 2', sans-serif`; c.strokeText(tr('BASE'), x, y); c.fillText(tr('BASE'), x, y); }
    else if (s.dueno === 'microblizz' && !libre) { c.font = `800 ${Math.round(g.s * 0.62)}px 'Baloo 2', sans-serif`; c.strokeText('M', x, y); c.fillText('M', x, y); }
    if (abierto && !libre) for (let i = 0; i < s.peligro; i++) {   // peligro: puntos bajo el centro, solo donde puedes atacar
      c.beginPath(); c.arc(x + (i - (s.peligro - 1) / 2) * g.s * 0.24, y + g.s * 0.45, g.s * 0.09, 0, 6.283); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#1a0f2e'; c.stroke();
    }
  }
}
function nvNombreDueno(d) { return d === 'rebelde' ? tr('Territorio rebelde sin reclamar') : d === 'microblizz' ? tr('Núcleo de Microblizz') : tr('Territorio de') + ' ' + tr(NOVA_CASCOS.facciones[d].nombre); }
function nvInfoSector(box) {
  const k = NV_GAL.sel, s = NVP.gal[k], T = NV_TIPOS_SECTOR[s.tipo], camp = nvCamp(), libre = camp.libres.includes(k);
  box.textContent = ''; box.style.setProperty('--col', nvColorDueno(nvDuenoActual(k)));
  box.appendChild(nvEl('nv-ctipo', s.base ? tr('Tu base rebelde') : libre ? tr('Liberado') : nvNombreDueno(s.dueno)));
  box.appendChild(nvEl('nv-cnom', tr(T.nombre) + (s.base ? '' : ' · ' + tr('Peligro') + ' ' + s.peligro + '/5')));
  box.appendChild(nvEl('nv-cdet', tr(T.txt)));
  const estado = libre ? (s.base ? tr('Puedes entrenar aquí cuando quieras') : tr('Liberado: puedes volver a jugarlo')) : nvSectorAbierto(k) ? tr('Gana la misión para liberarlo y abrir sus vecinos') : tr('Bloqueado: libera antes un sector vecino');
  box.appendChild(nvEl('nv-cdet', estado));
  if (!s.base && s.peligro > 1) box.appendChild(nvEl('nv-cdet', tr('Enemigos más duros y aleación') + ' ×' + (1 + 0.3 * (s.peligro - 1)).toFixed(1)));
}
// Nave capital: las mejoras que se quedan entre misiones.
function nvNaveCapital() {
  const cont = document.getElementById('nv-paneles'); cont.textContent = '';
  const p = nvEl('nv-panel'); p.appendChild(nvEl('nv-titulo', tr('NAVE CAPITAL')));
  nvCabecera(p);
  const camp = nvCamp();
  p.appendChild(nvEl('nv-cdet', tr('Misiones') + ': ' + camp.misiones + ' · ' + tr('Victorias') + ': ' + camp.victorias + ' · ' + tr('Sectores liberados') + ': ' + (camp.libres.length - 1)));
  for (const m of NV_CAPITAL) {
    const k = nvNivelCapital(m.id), tope = k >= m.max, coste = tope ? 0 : m.coste(k);
    const b = nvEl('nv-carta', '', 'button'); b.style.setProperty('--col', '#ffd93d');
    b.appendChild(nvEl('nv-ctipo', tr('Nivel') + ' ' + k + '/' + m.max));
    b.appendChild(nvEl('nv-cnom', tr(m.nombre)));
    b.appendChild(nvEl('nv-cdet', tr(m.txt)));
    b.appendChild(nvEl('nv-cdet', tope ? tr('Al máximo') : tr('Mejorar') + ': ' + coste + ' ' + tr('de aleación')));
    b.disabled = tope || camp.aleacion < coste;
    nvConIcono(b, 'sis', { nucleo: 'mejora', hangar: 'casco', sensores: 'iman', astillero: 'dano' }[m.id], '#ffd93d', 48);
    b.onclick = () => { if (nvMejoraCapital(m.id)) nvNaveCapital(); };
    p.appendChild(b);
  }
  const v = nvEl('nv-boton', tr('Volver a la galaxia'), 'button'); v.onclick = nvGalaxiaMenu; p.appendChild(v);
  nvInfo(p, 'capital');
  cont.appendChild(p);
}
