// Fans of Nova · Pantallas de la galaxia de la comunidad: el mapa común de la semana, la clasificación, tu patrón (y cambiarlo)
// y el parte de guerra al empezar la semana. Datos y reglas en frente-nova.js; el sistema común, en core/js/sistema/frente.js.
'use strict';

// Pinta un mapa común con sus dueños (la misma rejilla que la campaña, sin niebla ni selección).
function nvFrentePinta(cv, est) {
  const ids = Object.keys(est.duenos);
  let mx = 1, my = 1; for (const k of ids) { mx = Math.max(mx, Math.abs(est.gal[k].x)); my = Math.max(my, Math.abs(est.gal[k].y)); }
  const W = cv.clientWidth || 480, s = W / (2 * mx + 2), H = s * (2 * my + 2.2), dpr = Math.min(2, window.devicePixelRatio || 1), c = cv.getContext('2d');
  cv.style.height = H + 'px'; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
  const patron = nvPatron();
  for (const k of ids) {
    const h = est.gal[k], x = W / 2 + s * h.x, y = s * (my + 1.1) + s * h.y, dueno = est.duenos[k];
    c.beginPath();
    for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; c[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * s * 0.95, y + Math.sin(a) * s * 0.95); }
    c.closePath(); c.globalAlpha = dueno === patron ? 1 : 0.7; c.fillStyle = nvColorDueno(dueno); c.fill(); c.globalAlpha = 1;
    c.lineWidth = dueno === patron ? 2.5 : 1.2; c.strokeStyle = '#1a0f2e'; c.stroke();
  }
}
function nvFrenteFilaRanking(caja, est) {
  est.ranking.forEach((x, i) => {
    const f = nvEl('nv-fila'); f.style.color = NV_FAC_COLOR[x.faccion];
    f.appendChild(nvEl('', (i + 1) + '. ' + tr(NOVA_CASCOS.facciones[x.faccion].nombre) + (x.faccion === nvPatron() ? ' · ' + tr('tu patrón') : '')));
    f.appendChild(nvEl('', x.casillas + ' ' + tr('sectores')));
    caja.appendChild(f);
  });
}

// ---------- la pantalla principal ----------
// Se pinta en seguida con lo que haya y, si llegan los puntos de todos del servidor, se vuelve a pintar (una vez)
function nvFrenteMenu(yaBajado) {
  if (!yaBajado && nvFrenteEnRed()) { nvFrenteEnvia(); nvFrenteBaja(nvFrente().semana).then(d => { if (d && document.querySelector('.nv-frente')) nvFrenteMenu(true); }); }
  const cont = document.getElementById('nv-paneles'); cont.textContent = '';
  const est = nvFrenteHoy(), f = nvFrente(), p = nvEl('nv-panel nv-frente');
  p.appendChild(nvEl('nv-titulo', tr('GALAXIA DE LA COMUNIDAD')));
  nvCabecera(p);
  const hoy = (new Date().getDay() + 6) % 7, quedan = 6 - hoy;
  p.appendChild(nvEl('nv-cdet', tr('El mapa se recalcula cada día con los puntos de tu facción. La semana se cierra el domingo.') + ' ' +
    (quedan ? tr('Quedan {n} días.', { n: quedan }) : tr('Hoy es el último día.'))));
  const cv = document.createElement('canvas'); cv.className = 'nv-gal'; p.appendChild(cv);
  nvFrenteFilaRanking(p, est);
  p.appendChild(nvEl('nv-cdet', tr('Tus puntos esta semana') + ': ' + nvFrenteMisPuntos(f.aportes) + ' · ' + tr('Cada misión de campaña suma a tu patrón.')));
  nvColeccionFila(p);   // cosmeticos-ui.js
  if (nvTieneCosmeticos()) { const as = nvEl('nv-boton', tr('Aspecto de la nave'), 'button'); as.onclick = nvAspectoVentana; p.appendChild(as); }
  const cambia = nvEl('nv-boton', tr('Cambiar de patrón'), 'button'); cambia.onclick = () => nvFrenteVentanaPatron(est); p.appendChild(cambia);
  const vuelve = nvEl('nv-boton', tr('Volver a la galaxia'), 'button'); vuelve.onclick = nvGalaxiaMenu; p.appendChild(vuelve);
  p.appendChild(nvEl('nv-cdet', nvFrenteDeRed(f.semana) ? tr('Con los puntos de todos los pilotos.') : tr('Sin conexión: el resto de pilotos los simula la IA en tu aparato.')));
  cont.appendChild(p);
  requestAnimationFrame(() => nvFrentePinta(cv, est));
}

// ---------- cambiar de patrón ----------
function nvFrenteVentanaPatron(est) {
  const c = nvVentana(tr('CAMBIAR DE PATRÓN'));
  c.appendChild(nvEl('nv-cdet', tr('Una facción que va perdiendo necesita pilotos y te acepta casi gratis; la que va ganando te cobra muy caro.')));
  const l = nvEl('opt-list');
  for (const x of est.ranking) {
    const precio = nvFrentePrecio(x.faccion, est), suyo = x.faccion === nvPatron();
    const b = nvEl('btn-ghost ol', suyo ? tr('TU PATRÓN') : precio + ' ' + tr('Aleación'), 'button');
    b.disabled = suyo || nvCamp().aleacion < precio;
    b.onclick = () => { if (nvFrenteCambia(x.faccion, est)) { play('select'); nvCierraVentana(); nvFrenteMenu(); } };
    const f = nvEl('nv-fila'); f.style.color = NV_FAC_COLOR[x.faccion];
    f.appendChild(nvEl('', tr(NOVA_CASCOS.facciones[x.faccion].nombre))); f.appendChild(b); l.appendChild(f);
  }
  c.appendChild(l);
}

// ---------- el parte de guerra (sale solo al empezar la semana) ----------
// Con cuenta, antes baja los puntos de todos de la semana pasada, para que el parte diga lo mismo a todos
function nvFrenteAlAbrir() {
  const f = nvFrente(), sale = () => { if (nvFrenteParte()) nvFrenteVentanaParte(); };
  nvFrenteEnvia();
  if (f.previa && !f.previa.cobrada && nvFrenteEnRed()) nvFrenteBaja(f.previa.semana).then(sale); else sale();
}
function nvFrenteVentanaParte() {
  const parte = nvFrenteParte(); if (!parte) return;
  const c = nvVentana(tr('PARTE DE GUERRA'));
  c.appendChild(nvEl('nv-cnom', tr('Ganó') + ' ' + tr(NOVA_CASCOS.facciones[parte.ganadora].nombre)));
  const cv = document.createElement('canvas'); cv.className = 'nv-gal nv-gal-parte'; c.appendChild(cv);
  parte.est.ranking.slice(0, 3).forEach((x, i) => c.appendChild(nvEl('nv-cdet', (i + 1) + '. ' + tr(NOVA_CASCOS.facciones[x.faccion].nombre) + ' · ' + x.casillas + ' ' + tr('sectores'))));
  c.appendChild(nvEl('nv-cdet', tr('Tus puntos') + ': ' + parte.mios + ' · ' + tr('Aleación') + ': +' + parte.aleacion));
  if (parte.cosmetico) c.appendChild(nvEl('nv-cdet', tr('Cosmético de la facción ganadora') + ': ' + tr(NV_FRENTE_NOMBRE[NV.Cosmeticos.parte(parte.cosmetico).pieza]) + ' · ' + tr(NOVA_CASCOS.facciones[parte.ganadora].nombre)));
  if (parte.extra) c.appendChild(nvEl('nv-cdet', tr('Ya tenías sus tres cosméticos') + ': +' + parte.extra + ' ' + tr('Aleación')));
  nvParteVista(c, parte);   // cosmeticos-ui.js: la pieza nueva puesta en tu nave
  const ok = nvEl('btn-big ol nv-ok', tr('RECOGER'), 'button');
  ok.onclick = () => { nvFrenteCobra(parte); play('crown'); nvCierraVentana(); nvGalaxiaMenu(); };
  c.appendChild(ok);
  requestAnimationFrame(() => nvFrentePinta(cv, parte.est));
}
const NV_FRENTE_NOMBRE = { pintura: 'Pintura de nave', estela: 'Estela de motor', emblema: 'Emblema del casco' };
