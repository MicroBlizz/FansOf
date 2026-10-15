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
  nvParar(); nvCamp();
  const lz = document.getElementById('nv-canvas'); lz.getContext('2d').clearRect(0, 0, lz.width, lz.height);   // sin restos de la última partida detrás
  const cont = document.getElementById('nv-paneles'); cont.textContent = '';
  const p = nvEl('nv-panel'); p.appendChild(nvEl('nv-titulo', tr('GALAXIA')));
  nvCabecera(p);
  const cv = document.createElement('canvas'); cv.className = 'nv-gal'; p.appendChild(cv);
  const info = nvEl('nv-carta nv-galinfo'); p.appendChild(info);
  const lanzar = nvEl('nv-boton', tr('Lanzar misión'), 'button');
  lanzar.onclick = () => { if (NV_GAL.sel && nvSectorAbierto(NV_GAL.sel)) { NVP.sector = NV_GAL.sel; nvMenu(); } };
  p.appendChild(lanzar);
  const cap = nvEl('nv-boton', tr('Nave capital'), 'button'); cap.onclick = nvNaveCapital; p.appendChild(cap);
  const s = nvEl('nv-boton', tr('Salir'), 'button'); s.onclick = () => { cont.textContent = ''; nvSalir(); }; p.appendChild(s);
  cont.appendChild(p);
  if (!NV_GAL.sel) NV_GAL.sel = nvHexClave(NV_BASE);
  const pinta = () => { nvPintaGalaxia(cv); nvInfoSector(info); lanzar.disabled = !nvSectorAbierto(NV_GAL.sel); };
  cv.onclick = ev => {
    const k = nvHexEnPunto(cv, ev); if (!k) return;
    if (k === NV_GAL.sel && nvSectorAbierto(k)) { lanzar.onclick(); return; }   // segundo toque: lanzar
    NV_GAL.sel = k; pinta();
  };
  requestAnimationFrame(pinta);   // con el panel ya en pantalla, para medir el ancho
}
// Geometría: hexágonos con punta arriba, tamaño según el ancho del lienzo.
function nvGalGeo(cv) {
  const W = cv.clientWidth || 480, s = W / (Math.sqrt(3) * (2 * NV_GAL_RADIO + 1.4));
  return { W, H: s * (3 * NV_GAL_RADIO + 2.4), s, cx: W / 2, cy: s * (1.5 * NV_GAL_RADIO + 1.2) };
}
function nvHexPix(g, h) { return [g.cx + g.s * Math.sqrt(3) * (h.q + h.r / 2), g.cy + g.s * 1.5 * h.r]; }
function nvHexEnPunto(cv, ev) {
  const g = nvGalGeo(cv), b = cv.getBoundingClientRect(), x = ev.clientX - b.left, y = ev.clientY - b.top;
  let mejor = null, md = 1e9;
  for (const k in NVP.gal) { const [hx, hy] = nvHexPix(g, NVP.gal[k]), d = Math.hypot(hx - x, hy - y); if (d < md) { md = d; mejor = k; } }
  return md < g.s ? mejor : null;
}
function nvPintaGalaxia(cv) {
  const g = nvGalGeo(cv), dpr = Math.min(2, window.devicePixelRatio || 1), c = cv.getContext('2d'), camp = nvCamp();
  cv.style.height = g.H + 'px'; cv.width = Math.round(g.W * dpr); cv.height = Math.round(g.H * dpr);
  c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, g.W, g.H);
  for (const k in NVP.gal) {
    const s = NVP.gal[k], [x, y] = nvHexPix(g, s), libre = camp.libres.includes(k), abierto = nvSectorAbierto(k), T = NV_TIPOS_SECTOR[s.tipo];
    c.beginPath();
    for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3, r = g.s * 0.94; c[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r); }
    c.closePath();
    c.globalAlpha = libre ? 0.95 : abierto ? 0.7 : 0.22; c.fillStyle = T.color; c.fill(); c.globalAlpha = 1;
    c.lineWidth = k === NV_GAL.sel ? 4 : 2; c.strokeStyle = k === NV_GAL.sel ? '#ffd93d' : '#1a0f2e'; c.stroke();
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff'; c.strokeStyle = '#1a0f2e'; c.lineWidth = 3;
    if (s.base) { c.font = `800 ${Math.round(g.s * 0.42)}px 'Baloo 2', sans-serif`; c.strokeText(tr('BASE'), x, y); c.fillText(tr('BASE'), x, y); }
    else if (!abierto) { c.font = `800 ${Math.round(g.s * 0.6)}px 'Baloo 2', sans-serif`; c.strokeText('?', x, y); c.fillText('?', x, y); }
    else if (libre) { c.lineWidth = 4; c.strokeStyle = '#fff'; c.beginPath(); c.moveTo(x - g.s * 0.3, y); c.lineTo(x - g.s * 0.08, y + g.s * 0.22); c.lineTo(x + g.s * 0.32, y - g.s * 0.2); c.stroke(); }
    if (abierto && !s.base) for (let i = 0; i < s.peligro; i++) {   // peligro: puntos rojos bajo el centro
      c.beginPath(); c.arc(x + (i - (s.peligro - 1) / 2) * g.s * 0.2, y + g.s * 0.5, g.s * 0.07, 0, 6.283); c.fillStyle = '#ff5b5b'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#1a0f2e'; c.stroke();
    }
  }
}
function nvInfoSector(box) {
  const k = NV_GAL.sel, s = NVP.gal[k], T = NV_TIPOS_SECTOR[s.tipo], camp = nvCamp();
  box.textContent = ''; box.style.setProperty('--col', T.color);
  box.appendChild(nvEl('nv-ctipo', s.base ? tr('Tu base rebelde') : tr('Peligro') + ' ' + s.peligro + '/5'));
  box.appendChild(nvEl('nv-cnom', tr(T.nombre)));
  box.appendChild(nvEl('nv-cdet', tr(T.txt)));
  const estado = camp.libres.includes(k) ? (s.base ? tr('Puedes entrenar aquí cuando quieras') : tr('Liberado: puedes volver a jugarlo')) : nvSectorAbierto(k) ? tr('Gana la misión para liberarlo y abrir sus vecinos') : tr('Bloqueado: libera antes un sector vecino');
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
  cont.appendChild(p);
}
