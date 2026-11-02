// Fans of Nova · Avisos de combos (adaptador de NV.Combos, dominio/combos.js): la franja de arriba la primera vez que haces un combo, la
// cuenta de la misión y la página «Combos» del Arsenal con los descubiertos y las pistas de los que faltan. Diseño: docs/nova/avisos-de-combos.md.
'use strict';
const NV_DESCUBRE_T = 2.6, NV_DESCUBRE_HUECO = 0.4;   // la franja dura 2,6 s y la siguiente espera 0,4 s más: como mucho una cada 3 s

// Un combo ha actuado en la misión: se cuenta y, si la campaña no lo conocía, se pone en cola su franja
function nvDescubre(S, id) {
  const veces = S.stats.combos || (S.stats.combos = {});
  veces[id] = (veces[id] || 0) + 1;
  const vistos = NVP.camp ? NVP.camp.combos : null, nuevos = S.nuevos || (S.nuevos = []);
  if (!NVP.camp || !NV.Combos.esNuevo(vistos, nuevos, id)) return;
  nuevos.push(id);
  (S.colaDescubre || (S.colaDescubre = [])).push(id);
}
function nvDescubreVarios(S, ids) { for (const id of ids) nvDescubre(S, id); }

// Cada fotograma: caduca la franja que se ve y saca la siguiente de la cola
function nvDescubrePaso(S, dt) {
  if (S.descubre && (S.descubre.t -= dt) <= -NV_DESCUBRE_HUECO) S.descubre = null;
  if (S.descubre || !S.colaDescubre || !S.colaDescubre.length) return;
  const x = NV.Combos.catalogo(NOVA_ARMAS).find(c => c.id === S.colaDescubre.shift());
  if (!x) return;
  S.descubre = { t: NV_DESCUBRE_T, nombre: x.nombre, efecto: x.efecto, color: nvColorCombo(x) };
  play('nvDescubre');
}

// El color de un combo: el de su primera carga (el Cazador no pide carga: el naranja de las armas)
function nvColorCombo(x) { return x.cargas.length ? NOVA_ARMAS.cargas[x.cargas[0]].color : '#ff9a3c'; }
// Su pista: las cargas que junta y, si es un talento, el arma que lo tiene
function nvPistaCombo(x) {
  const A = NOVA_ARMAS, partes = x.cargas.map(k => tr(A.cargas[k].nombre));
  if (x.portador) partes.push(tr(A.portadores[x.portador].nombre));
  return partes.join(' + ');
}

// La franja, arriba y sin pausar: el nombre grande con el color de su carga y debajo lo que hace
function nvPintaDescubre(c, S, W, H, u) {
  const d = S.descubre;
  if (!d || d.t <= 0) return;
  const a = Math.min(1, d.t / 0.3, (NV_DESCUBRE_T - d.t) / 0.2), y = H * 0.16, alto = 54 * u;
  c.save(); c.globalAlpha = Math.max(0, a);
  c.fillStyle = 'rgba(10,14,40,.85)'; c.fillRect(0, y - alto / 2, W, alto);
  c.fillStyle = d.color; c.fillRect(0, y - alto / 2, W, 3 * u); c.fillRect(0, y + alto / 2 - 3 * u, W, 3 * u);
  c.textAlign = 'center'; c.lineWidth = 4; c.strokeStyle = '#1a0f2e';
  c.font = '800 ' + 26 * u + 'px Luckiest Guy, Baloo 2, sans-serif'; c.fillStyle = d.color;
  const titulo = tr('¡Combo nuevo!') + ' ' + tr(d.nombre);
  c.strokeText(titulo, W / 2, y - 4 * u); c.fillText(titulo, W / 2, y - 4 * u);
  c.font = '700 ' + 13 * u + 'px Baloo 2, sans-serif'; c.fillStyle = '#fff';
  c.strokeText(tr(d.efecto), W / 2, y + 16 * u); c.fillText(tr(d.efecto), W / 2, y + 16 * u);
  c.restore();
}

// Al cerrar la misión: la campaña aprende lo descubierto y los retos cuentan cuántos llevas
function nvCombosCierra(S, c) {
  S.combosNuevos = NV.Combos.junta(c, S.stats.combos || {});
  NV_RETOS.maximo('combos', NV.Combos.cuenta(c, NOVA_ARMAS).hechos);
}
function nvCombosLineaFin(S, p) {
  const nuevos = S.combosNuevos || [];
  if (!nuevos.length) return;
  const cat = NV.Combos.catalogo(NOVA_ARMAS), nombre = id => tr(cat.find(x => x.id === id).nombre);
  p.appendChild(nvEl('nv-cdet', (nuevos.length > 1 ? tr('Combos nuevos descubiertos') : tr('Combo nuevo descubierto')) + ': ' + nuevos.map(nombre).join(', ')));
}

// ---------- la página «Combos» del Arsenal ----------
function nvArsenalCombos() {
  const cont = document.getElementById('nv-paneles'); cont.textContent = '';
  const c = nvCamp(), vistos = c.combos || {}, A = NOVA_ARMAS, n = NV.Combos.cuenta(c, A);
  const p = nvEl('nv-panel'); p.appendChild(nvEl('nv-titulo', tr('COMBOS')));
  p.appendChild(nvEl('nv-cdet', tr('{n} de {t} descubiertos', { n: n.hechos, t: n.total }) + ' · ' + tr('Los que faltan dicen qué cargas juntar.')));
  for (const x of NV.Combos.catalogo(A)) p.appendChild(nvCartaCombo(x, vistos[x.id] || 0));
  const v = nvEl('nv-boton', tr('Volver al Arsenal'), 'button'); v.onclick = nvArsenal; p.appendChild(v);
  cont.appendChild(p);
}
function nvCartaCombo(x, veces) {
  const b = nvEl('nv-carta nv-combo'), cargas = nvPistaCombo(x);
  b.style.setProperty('--col', veces ? nvColorCombo(x) : '#5a5f7a');
  b.appendChild(nvEl('nv-ctipo', veces ? tr('Hecho {n} veces', { n: veces }) : tr('Sin descubrir')));
  b.appendChild(nvEl('nv-cnom', veces ? tr(x.nombre) : '???'));
  b.appendChild(nvEl('nv-cdet', veces ? tr(x.efecto) + ' · ' + cargas : tr('Pista') + ': ' + cargas));
  if (!veces) b.style.opacity = 0.7;
  return b;
}
